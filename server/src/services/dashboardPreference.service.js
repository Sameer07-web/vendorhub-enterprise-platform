const DashboardPreferenceRepository = require('../repositories/DashboardPreferenceRepository');

class DashboardPreferenceService {
  async getPreferences(sessionOrOrgId, userId) {
    let prefs = await DashboardPreferenceRepository.findOne(sessionOrOrgId, { user: userId });
    
    if (!prefs) {
      prefs = await DashboardPreferenceRepository.create(sessionOrOrgId, {
        user: userId,
        template: 'Executive',
        density: 'spacious',
        theme: 'light',
        defaultRange: '30d',
        widgets: [
          'aiInsights', 'totalSpend', 'vendors', 'purchaseRequests', 'totalRfqs',
          'executiveSummary', 'spendTrend', 'departmentSpend', 'vendorDistribution', 'procurementStatus'
        ],
        layouts: {
          lg: [
            { i: 'aiInsights', x: 0, y: 0, w: 12, h: 8 },
            { i: 'totalSpend', x: 0, y: 8, w: 3, h: 4 },
            { i: 'vendors', x: 3, y: 8, w: 3, h: 4 },
            { i: 'purchaseRequests', x: 6, y: 8, w: 3, h: 4 },
            { i: 'totalRfqs', x: 9, y: 8, w: 3, h: 4 },
            { i: 'executiveSummary', x: 0, y: 12, w: 12, h: 4 },
            { i: 'spendTrend', x: 0, y: 16, w: 6, h: 10 },
            { i: 'departmentSpend', x: 6, y: 16, w: 6, h: 10 },
            { i: 'vendorDistribution', x: 0, y: 26, w: 6, h: 10 },
            { i: 'procurementStatus', x: 6, y: 26, w: 6, h: 10 }
          ]
        }
      });
    }
    
    return prefs;
  }

  async updatePreferences(sessionOrOrgId, userId, data) {
    const orgId = sessionOrOrgId.organization ? sessionOrOrgId.organization : sessionOrOrgId._id ? sessionOrOrgId._id : sessionOrOrgId;
    return await DashboardPreferenceRepository.tenantRepo.findOneAndUpdate(
      orgId,
      { user: userId },
      { $set: data },
      { new: true, upsert: true }
    );
  }
}

module.exports = new DashboardPreferenceService();
