class TenantAggregationBuilder {
  /**
   * Constructs a tenant-aware aggregation pipeline.
   * Prepends or merges {$match: { organization: tenantId }} at the very start.
   *
   * @param {string|ObjectId} tenantId 
   * @param {Array<Object>} pipeline 
   * @returns {Array<Object>}
   */
  static build(tenantId, pipeline = []) {
    if (!tenantId) {
      throw new Error("TenantAggregationBuilder: tenantId (organization) is required.");
    }

    const orgIdStr = tenantId._id ? tenantId._id : tenantId;
    const finalPipeline = JSON.parse(JSON.stringify(pipeline));

    if (finalPipeline.length > 0 && finalPipeline[0].$match) {
      finalPipeline[0].$match.organization = orgIdStr;
    } else {
      finalPipeline.unshift({ $match: { organization: orgIdStr } });
    }

    return finalPipeline;
  }
}

module.exports = TenantAggregationBuilder;
