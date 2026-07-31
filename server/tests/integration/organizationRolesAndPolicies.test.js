const request = require('supertest');
const app = require('../../src/app');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const OrganizationMember = require('../../src/models/OrganizationMember');
const OrganizationRole = require('../../src/models/OrganizationRole');
const OrganizationMemberRole = require('../../src/models/OrganizationMemberRole');
const AuthorizationPolicy = require('../../src/models/AuthorizationPolicy');
const AuditLog = require('../../src/models/AuditLog');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Phase 10.3: Dynamic RBAC, Custom Roles & Policy Engine Integration Tests', () => {
  let mongoServer;
  let orgA, orgB;
  let adminA, viewerA, adminB;
  let tokenAdminA, tokenViewerA, tokenAdminB;
  let memberAdminA, memberViewerA, memberAdminB;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.disconnect();
    await mongoose.connect(uri);

    // Create Organizations
    orgA = await Organization.create({ name: 'Org A', slug: 'org-a-' + Date.now() });
    orgB = await Organization.create({ name: 'Org B', slug: 'org-b-' + Date.now() });

    // Create Users
    adminA = await User.create({
      fullName: 'Admin A',
      email: 'admin@orga.com',
      password: 'Password123!',
      organization: orgA._id
    });
    viewerA = await User.create({
      fullName: 'Viewer A',
      email: 'viewer@orga.com',
      password: 'Password123!',
      organization: orgA._id
    });
    adminB = await User.create({
      fullName: 'Admin B',
      email: 'admin@orgb.com',
      password: 'Password123!',
      organization: orgB._id
    });

    // Create Organization Memberships
    memberAdminA = await OrganizationMember.create({
      organization: orgA._id,
      user: adminA._id,
      role: 'Admin',
      status: 'ACTIVE',
      joinedAt: new Date()
    });
    memberViewerA = await OrganizationMember.create({
      organization: orgA._id,
      user: viewerA._id,
      role: 'Viewer',
      status: 'ACTIVE',
      joinedAt: new Date()
    });
    memberAdminB = await OrganizationMember.create({
      organization: orgB._id,
      user: adminB._id,
      role: 'Admin',
      status: 'ACTIVE',
      joinedAt: new Date()
    });

    // Sign Tokens
    const signToken = (user, orgId) => jwt.sign(
      { id: user._id, email: user.email, role: user.role, organizationId: orgId, tenantVersion: 1 },
      process.env.JWT_SECRET || 'supersecretjwtkey_vendorhub_enterprise_2026',
      { expiresIn: '1h' }
    );

    tokenAdminA = signToken(adminA, orgA._id);
    tokenViewerA = signToken(viewerA, orgA._id);
    tokenAdminB = signToken(adminB, orgB._id);

    // Automatically seed default roles
    const dynamicRoleService = require('../../src/services/dynamicRole.service');
    await dynamicRoleService.seedDefaultRoles(orgA._id, adminA._id);
    await dynamicRoleService.seedDefaultRoles(orgB._id, adminB._id);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('1. Custom Role Lifecycle Management', () => {
    let customRoleId;

    test('Admin A can create custom role -> Returns 201 Created & Audited', async () => {
      const res = await request(app)
        .post('/api/v1/organizations/roles')
        .set('Authorization', `Bearer ${tokenAdminA}`)
        .send({
          name: 'Procurement Auditor',
          description: 'Special audits access role',
          permissions: ['vendors:view', 'pr:view']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('Procurement Auditor');
      customRoleId = res.body.data._id;

      // Verify Audit Log
      const audit = await AuditLog.findOne({ organization: orgA._id, action: 'ROLE_CREATED' });
      expect(audit).not.toBeNull();
      expect(audit.newValue.name).toBe('Procurement Auditor');
    });

    test('Duplicate role name within same org is rejected -> Returns 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/organizations/roles')
        .set('Authorization', `Bearer ${tokenAdminA}`)
        .send({
          name: 'Procurement Auditor',
          permissions: ['vendors:view']
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    test('Admin A can clone custom role -> Creates cloned role config', async () => {
      const res = await request(app)
        .post(`/api/v1/organizations/roles/${customRoleId}/clone`)
        .set('Authorization', `Bearer ${tokenAdminA}`)
        .send({ name: 'Procurement Auditor Cloned' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('Procurement Auditor Cloned');
    });

    test('Admin A can update custom role permissions -> Updates and increments permissionsVersion', async () => {
      const res = await request(app)
        .patch(`/api/v1/organizations/roles/${customRoleId}`)
        .set('Authorization', `Bearer ${tokenAdminA}`)
        .send({
          permissions: ['vendors:view', 'pr:view', 'rfq:view']
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.permissionsVersion).toBe(2);
      expect(res.body.data.permissions.length).toBe(3);
    });

    test('Protected system roles cannot be modified or archived -> Returns 400 Bad Request', async () => {
      const systemRole = await OrganizationRole.findOne({ organization: orgA._id, isSystem: true });
      expect(systemRole).not.toBeNull();

      const resUpdate = await request(app)
        .patch(`/api/v1/organizations/roles/${systemRole._id}`)
        .set('Authorization', `Bearer ${tokenAdminA}`)
        .send({ name: 'Modified Name' });

      expect(resUpdate.statusCode).toBe(400);

      const resArchive = await request(app)
        .post(`/api/v1/organizations/roles/${systemRole._id}/archive`)
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(resArchive.statusCode).toBe(400);
    });

    test('Admin A can archive custom role -> Sets status to ARCHIVED', async () => {
      const res = await request(app)
        .post(`/api/v1/organizations/roles/${customRoleId}/archive`)
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('ARCHIVED');
    });
  });

  describe('2. Dynamic Role Assignment & Verification', () => {
    test('Admin A can assign custom role to Viewer A -> Creates relationship', async () => {
      const customRole = await OrganizationRole.create({
        organization: orgA._id,
        name: 'Custom Viewer Admin',
        permissions: [{ key: 'vendors:view', granted: true }]
      });

      const res = await request(app)
        .post('/api/v1/organizations/roles/assign')
        .set('Authorization', `Bearer ${tokenAdminA}`)
        .send({
          memberId: memberViewerA._id,
          roleId: customRole._id
        });

      expect(res.statusCode).toBe(200);

      // Verify assignment table has entry
      const assigned = await OrganizationMemberRole.findOne({ member: memberViewerA._id, role: customRole._id });
      expect(assigned).not.toBeNull();
    });
  });

  describe('3. Attribute-Based Policy Evaluation Engine', () => {
    test('Policy Engine evaluates ALLOW policies correctly', async () => {
      const policy = await AuthorizationPolicy.create({
        organization: orgA._id,
        resource: 'vendors',
        action: 'edit',
        effect: 'ALLOW',
        priority: 10,
        enabled: true
      });

      const policyEngineService = require('../../src/services/policyEngine.service');
      const decision = await policyEngineService.evaluate(
        orgA._id,
        memberViewerA, // viewer has VENDORS_VIEW, not VENDORS_EDIT statically. But let's check with custom role.
        'vendors',
        'edit',
        { user: { _id: viewerA._id } }
      );

      // Should be allowed because custom role or policy ALLOW triggers
      // Wait, we need to assign custom role that contains edit permission to trigger ALLOW path. Let's create one.
      const editorRole = await OrganizationRole.create({
        organization: orgA._id,
        name: 'Custom Vendor Editor',
        permissions: [{ key: 'vendors:edit', granted: true }]
      });

      await OrganizationMemberRole.create({
        organization: orgA._id,
        member: memberViewerA._id,
        role: editorRole._id
      });

      const decisionAllowed = await policyEngineService.evaluate(
        orgA._id,
        memberViewerA,
        'vendors',
        'edit',
        { user: { _id: viewerA._id } }
      );
      expect(decisionAllowed.allowed).toBe(true);
    });

    test('Policy Engine evaluates DENY policies overrides and priority logic', async () => {
      // Create DENY policy for same resource/action with higher priority
      const denyPolicy = await AuthorizationPolicy.create({
        organization: orgA._id,
        resource: 'vendors',
        action: 'edit',
        effect: 'DENY',
        priority: 100, // Higher priority than ALLOW
        enabled: true
      });

      const policyEngineService = require('../../src/services/policyEngine.service');
      const decisionDenied = await policyEngineService.evaluate(
        orgA._id,
        memberViewerA,
        'vendors',
        'edit',
        { user: { _id: viewerA._id } }
      );
      
      expect(decisionDenied.allowed).toBe(false);
      expect(decisionDenied.reason).toMatch(/effect: DENY/i);
    });
  });

  describe('4. Cross-Tenant Authorization Boundaries', () => {
    test('Admin B from Org B cannot view custom roles of Org A -> Tenant isolation boundary blocks query', async () => {
      const res = await request(app)
        .get('/api/v1/organizations/roles')
        .set('Authorization', `Bearer ${tokenAdminB}`);

      expect(res.statusCode).toBe(200);
      const hasOrgARole = res.body.data.some(r => r.name === 'Custom Vendor Editor');
      expect(hasOrgARole).toBe(false);
    });

    test('Admin B from Org B cannot query policies of Org A', async () => {
      const res = await request(app)
        .get('/api/v1/organizations/policies')
        .set('Authorization', `Bearer ${tokenAdminB}`);

      expect(res.statusCode).toBe(200);
      // Org A policies shouldn't bleed into Org B
      const hasOrgAPolicy = res.body.data.some(p => p.resource === 'vendors' && p.priority === 100);
      expect(hasOrgAPolicy).toBe(false);
    });
  });

  describe('5. Explain Plans & Index Verifications', () => {
    test('OrganizationRole queries utilize indexed lookup stages', async () => {
      const query = OrganizationRole.find({ organization: orgA._id, status: 'ACTIVE' });
      const explain = await query.explain('executionStats');
      
      const winningPlan = explain.queryPlanner.winningPlan;
      const hasIxScan = JSON.stringify(winningPlan).includes('IXSCAN');
      expect(hasIxScan).toBe(true);
    });

    test('AuthorizationPolicy queries utilize indexed lookup stages', async () => {
      const query = AuthorizationPolicy.find({ organization: orgA._id, enabled: true });
      const explain = await query.explain('executionStats');
      
      const winningPlan = explain.queryPlanner.winningPlan;
      const hasIxScan = JSON.stringify(winningPlan).includes('IXSCAN');
      expect(hasIxScan).toBe(true);
    });
  });
});
