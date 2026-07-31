const request = require('supertest');
const app = require('../../src/app');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const OrganizationMember = require('../../src/models/OrganizationMember');
const OrganizationInvitation = require('../../src/models/OrganizationInvitation');
const AuditLog = require('../../src/models/AuditLog');
const Notification = require('../../src/models/Notification');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Phase 10.2: Organization Membership & Identity Management Integration Tests', () => {
  let mongoServer;
  let orgA, orgB;
  let ownerA, adminA, viewerA, adminB;
  let tokenOwnerA, tokenAdminA, tokenViewerA, tokenAdminB;
  let memberOwnerA, memberAdminA, memberViewerA, memberAdminB;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.disconnect();
    await mongoose.connect(uri);

    // Create Organizations
    orgA = await Organization.create({ name: 'Org A', slug: 'org-a-' + Date.now() });
    orgB = await Organization.create({ name: 'Org B', slug: 'org-b-' + Date.now() });

    // Create Users
    ownerA = await User.create({
      fullName: 'Owner A',
      email: 'owner@orga.com',
      password: 'Password123!',
      organization: orgA._id
    });
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
    memberOwnerA = await OrganizationMember.create({
      organization: orgA._id,
      user: ownerA._id,
      role: 'Owner',
      status: 'ACTIVE',
      joinedAt: new Date()
    });
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

    tokenOwnerA = signToken(ownerA, orgA._id);
    tokenAdminA = signToken(adminA, orgA._id);
    tokenViewerA = signToken(viewerA, orgA._id);
    tokenAdminB = signToken(adminB, orgB._id);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('1. Invitation Flow & Management Lifecycle', () => {
    let invitationToken;
    let invitationId;

    test('Admin A can invite a new member to Org A -> Generates 201 Created & Audited', async () => {
      const res = await request(app)
        .post('/api/v1/organizations/invitations')
        .set('Authorization', `Bearer ${tokenAdminA}`)
        .send({ email: 'newbuyer@orga.com', role: 'Buyer' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('invitationToken');
      expect(res.body.data.email).toBe('newbuyer@orga.com');

      invitationToken = res.body.data.invitationToken;
      invitationId = res.body.data._id;

      // Verify Audit Log was generated
      const audit = await AuditLog.findOne({ organization: orgA._id, action: 'INVITATION_SENT' });
      expect(audit).not.toBeNull();
      expect(audit.newValue.email).toBe('newbuyer@orga.com');
    });

    test('Admin A cannot trigger duplicate active invitation for same email -> Returns 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/organizations/invitations')
        .set('Authorization', `Bearer ${tokenAdminA}`)
        .send({ email: 'newbuyer@orga.com', role: 'Buyer' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/pending invitation already exists/i);
    });

    test('Anonymous user can accept active invitation -> Creates user & active membership link', async () => {
      const res = await request(app)
        .post('/api/v1/organizations/invitations/accept')
        .send({
          invitationToken,
          fullName: 'New Buyer Account',
          password: 'SecurePassword123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('member');
      expect(res.body.data.member.status).toBe('ACTIVE');
      expect(res.body.data.member.role).toBe('Buyer');

      const acceptedInvite = await OrganizationInvitation.findById(invitationId);
      expect(acceptedInvite.status).toBe('ACCEPTED');
    });

    test('Revoking invitation updates status -> Revokes pending invites', async () => {
      const invite = await request(app)
        .post('/api/v1/organizations/invitations')
        .set('Authorization', `Bearer ${tokenAdminA}`)
        .send({ email: 'revokeduser@orga.com', role: 'Viewer' });

      expect(invite.statusCode).toBe(201);

      const res = await request(app)
        .delete(`/api/v1/organizations/invitations/${invite.body.data._id}`)
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('REVOKED');
    });

    test('Invitation expiration block accepted attempt -> Fails with 400', async () => {
      const expiredInvite = await OrganizationInvitation.create({
        organization: orgA._id,
        email: 'expired@orga.com',
        role: 'Viewer',
        invitationToken: 'expiredtoken123',
        invitedBy: adminA._id,
        expiresAt: new Date(Date.now() - 1000), // in the past
        status: 'PENDING'
      });

      const res = await request(app)
        .post('/api/v1/organizations/invitations/accept')
        .send({
          invitationToken: 'expiredtoken123',
          fullName: 'Expired Account',
          password: 'SecurePassword123!'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/expired/i);

      const updatedInvite = await OrganizationInvitation.findById(expiredInvite._id);
      expect(updatedInvite.status).toBe('EXPIRED');
    });
  });

  describe('2. Authorization Middleware & Permission Scope Enforcement', () => {
    test('Viewer A is denied access to administrative user management endpoints -> Returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/organizations/members')
        .set('Authorization', `Bearer ${tokenViewerA}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/insufficient permissions/i);
    });

    test('Admin A is allowed access to user management endpoints -> Returns 200 OK', async () => {
      const res = await request(app)
        .get('/api/v1/organizations/members')
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Cross-Tenant Management Isolation Boundaries', () => {
    test('Admin B from Org B cannot query members of Org A -> Tenant scoping bounds lookup to Org B only', async () => {
      const res = await request(app)
        .get('/api/v1/organizations/members')
        .set('Authorization', `Bearer ${tokenAdminB}`);

      expect(res.statusCode).toBe(200);
      // Verify no member from Org A exists in response
      const hasOrgAMember = res.body.data.some(m => m.user.email === 'admin@orga.com');
      expect(hasOrgAMember).toBe(false);
    });

    test('Admin B from Org B cannot update or manipulate Org A member roles -> Returns 404 Not Found due to tenant scoping', async () => {
      const res = await request(app)
        .patch(`/api/v1/organizations/members/${memberViewerA._id}/role`)
        .set('Authorization', `Bearer ${tokenAdminB}`)
        .send({ role: 'Manager' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('4. Member Actions, Suspension, and Transfer Ownership', () => {
    test('Admin A can suspend member -> Deactivates user and updates status', async () => {
      const res = await request(app)
        .patch(`/api/v1/organizations/members/${memberViewerA._id}/suspend`)
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('SUSPENDED');

      const user = await User.findById(viewerA._id);
      expect(user.isActive).toBe(false);
    });

    test('Admin A can reactivate suspended member -> Re-enables user account', async () => {
      const res = await request(app)
        .patch(`/api/v1/organizations/members/${memberViewerA._id}/reactivate`)
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('ACTIVE');

      const user = await User.findById(viewerA._id);
      expect(user.isActive).toBe(true);
    });

    test('Admin A cannot transfer organization ownership -> Fails with 403 Forbidden', async () => {
      const res = await request(app)
        .post(`/api/v1/organizations/members/${memberAdminA._id}/transfer-ownership`)
        .set('Authorization', `Bearer ${tokenAdminA}`);

      expect(res.statusCode).toBe(403);
    });

    test('Owner A can transfer organization ownership -> Upgrades target and downgrades previous owner', async () => {
      const res = await request(app)
        .post(`/api/v1/organizations/members/${memberAdminA._id}/transfer-ownership`)
        .set('Authorization', `Bearer ${tokenOwnerA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.newOwner.role).toBe('Owner');
      expect(res.body.data.previousOwner.role).toBe('Admin');

      const org = await Organization.findById(orgA._id);
      expect(org.owner.toString()).toBe(adminA._id.toString());
    });
  });

  describe('5. Performance Index Verification (Explain Plans)', () => {
    test('OrganizationMember queries use indexed lookup patterns', async () => {
      const query = OrganizationMember.find({ organization: orgA._id, user: ownerA._id });
      const explain = await query.explain('executionStats');
      
      const winningPlan = explain.queryPlanner.winningPlan;
      const stage = winningPlan.stage;
      const inputStage = winningPlan.inputStage || {};
      
      const hasIxScan = stage === 'IXSCAN' || inputStage.stage === 'IXSCAN' || JSON.stringify(winningPlan).includes('IXSCAN');
      expect(hasIxScan).toBe(true);
    });

    test('OrganizationInvitation queries use indexed lookup patterns', async () => {
      const query = OrganizationInvitation.find({ organization: orgA._id, email: 'newbuyer@orga.com' });
      const explain = await query.explain('executionStats');
      
      const winningPlan = explain.queryPlanner.winningPlan;
      const stage = winningPlan.stage;
      const inputStage = winningPlan.inputStage || {};
      
      const hasIxScan = stage === 'IXSCAN' || inputStage.stage === 'IXSCAN' || JSON.stringify(winningPlan).includes('IXSCAN');
      expect(hasIxScan).toBe(true);
    });
  });
});
