class TenantRepository {
  /**
   * Initialize repository with the Mongoose model
   * @param {mongoose.Model} model 
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Injects the tenant organization ID into the filter query
   * @param {string|ObjectId} organizationId 
   * @param {Object} filter 
   * @returns {Object} 
   */
  _applyTenantFilter(organizationId, filter = {}) {
    if (!organizationId) {
      throw new Error('TenantRepository: organizationId is required to enforce multi-tenancy.');
    }
    return { ...filter, organization: organizationId };
  }

  /**
   * Find multiple documents for a tenant
   */
  find(organizationId, filter = {}, projection = null, options = {}) {
    const tenantFilter = this._applyTenantFilter(organizationId, filter);
    return this.model.find(tenantFilter, projection, options);
  }

  /**
   * Find a single document for a tenant
   */
  findOne(organizationId, filter = {}, projection = null, options = {}) {
    const tenantFilter = this._applyTenantFilter(organizationId, filter);
    return this.model.findOne(tenantFilter, projection, options);
  }

  /**
   * Find document by ID, scoped to the tenant
   */
  findById(organizationId, id, projection = null, options = {}) {
    const tenantFilter = this._applyTenantFilter(organizationId, { _id: id });
    return this.model.findOne(tenantFilter, projection, options);
  }

  /**
   * Create a document for a tenant
   */
  create(organizationId, data) {
    if (Array.isArray(data)) {
      data = data.map(doc => ({ ...doc, organization: organizationId }));
    } else {
      data = { ...data, organization: organizationId };
    }
    return this.model.create(data);
  }

  /**
   * Update a single document for a tenant
   */
  findOneAndUpdate(organizationId, filter = {}, update = {}, options = {}) {
    const tenantFilter = this._applyTenantFilter(organizationId, filter);
    return this.model.findOneAndUpdate(tenantFilter, update, options);
  }

  /**
   * Update document by ID for a tenant
   */
  findByIdAndUpdate(organizationId, id, update = {}, options = {}) {
    const tenantFilter = this._applyTenantFilter(organizationId, { _id: id });
    return this.model.findOneAndUpdate(tenantFilter, update, options);
  }

  /**
   * Update multiple documents for a tenant
   */
  updateMany(organizationId, filter = {}, update = {}, options = {}) {
    const tenantFilter = this._applyTenantFilter(organizationId, filter);
    return this.model.updateMany(tenantFilter, update, options);
  }

  /**
   * Delete a single document for a tenant
   */
  findOneAndDelete(organizationId, filter = {}, options = {}) {
    const tenantFilter = this._applyTenantFilter(organizationId, filter);
    return this.model.findOneAndDelete(tenantFilter, options);
  }

  /**
   * Delete document by ID for a tenant
   */
  findByIdAndDelete(organizationId, id, options = {}) {
    const tenantFilter = this._applyTenantFilter(organizationId, { _id: id });
    return this.model.findOneAndDelete(tenantFilter, options);
  }

  /**
   * Delete multiple documents for a tenant
   */
  deleteMany(organizationId, filter = {}, options = {}) {
    const tenantFilter = this._applyTenantFilter(organizationId, filter);
    return this.model.deleteMany(tenantFilter, options);
  }

  /**
   * Count documents for a tenant
   */
  countDocuments(organizationId, filter = {}) {
    const tenantFilter = this._applyTenantFilter(organizationId, filter);
    return this.model.countDocuments(tenantFilter);
  }

  /**
   * Perform aggregation pipeline, ensuring the first stage matches the organization
   */
  aggregate(organizationId, pipeline = []) {
    if (!organizationId) {
      throw new Error('TenantRepository: organizationId is required for aggregations.');
    }

    // Force the first pipeline stage to be a $match on organization
    // If the first stage is already a $match, merge it.
    let tenantPipeline = [...pipeline];
    if (tenantPipeline.length > 0 && tenantPipeline[0].$match) {
      tenantPipeline[0].$match.organization = organizationId;
    } else {
      tenantPipeline.unshift({ $match: { organization: organizationId } });
    }

    return this.model.aggregate(tenantPipeline);
  }
}

module.exports = TenantRepository;
