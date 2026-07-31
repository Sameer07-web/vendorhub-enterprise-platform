const TenantRepository = require("./tenantRepository");

class BaseRepository {
  constructor(model) {
    this.tenantRepo = new TenantRepository(model);
    this.model = model;
  }

  _extractOrgId(sessionOrOrgId) {
    if (!sessionOrOrgId) {
      throw new Error("BaseRepository: Tenant context (TenantSession or organizationId) is required.");
    }
    return sessionOrOrgId.organization
      ? sessionOrOrgId.organization
      : sessionOrOrgId._id
      ? sessionOrOrgId._id
      : sessionOrOrgId;
  }

  findById(sessionOrOrgId, id, projection = null, options = {}) {
    const orgId = this._extractOrgId(sessionOrOrgId);
    return this.tenantRepo.findById(orgId, id, projection, options);
  }

  findOne(sessionOrOrgId, filter = {}, projection = null, options = {}) {
    const orgId = this._extractOrgId(sessionOrOrgId);
    return this.tenantRepo.findOne(orgId, filter, projection, options);
  }

  findMany(sessionOrOrgId, filter = {}, projection = null, options = {}) {
    const orgId = this._extractOrgId(sessionOrOrgId);
    return this.tenantRepo.find(orgId, filter, projection, options);
  }

  create(sessionOrOrgId, data) {
    const orgId = this._extractOrgId(sessionOrOrgId);
    return this.tenantRepo.create(orgId, data);
  }

  update(sessionOrOrgId, id, data, options = { new: true }) {
    const orgId = this._extractOrgId(sessionOrOrgId);
    return this.tenantRepo.findByIdAndUpdate(orgId, id, data, options);
  }

  delete(sessionOrOrgId, id, options = {}) {
    const orgId = this._extractOrgId(sessionOrOrgId);
    return this.tenantRepo.findByIdAndDelete(orgId, id, options);
  }

  exists(sessionOrOrgId, filter = {}) {
    const orgId = this._extractOrgId(sessionOrOrgId);
    return this.tenantRepo.countDocuments(orgId, filter).then(count => count > 0);
  }

  aggregate(sessionOrOrgId, pipeline = []) {
    const orgId = this._extractOrgId(sessionOrOrgId);
    return this.tenantRepo.aggregate(orgId, pipeline);
  }

  count(sessionOrOrgId, filter = {}) {
    const orgId = this._extractOrgId(sessionOrOrgId);
    return this.tenantRepo.countDocuments(orgId, filter);
  }
}

module.exports = BaseRepository;
