const DashboardPreference = require('../models/DashboardPreference');

class DashboardPreferenceService {
  async getPreferences(userId) {
    let prefs = await DashboardPreference.findOne({ user: userId });
    
    // Auto-create default if not exists
    if (!prefs) {
      prefs = await DashboardPreference.create({
        user: userId,
        template: 'Executive',
        density: 'spacious',
        theme: 'light',
        defaultRange: '30d',
        widgets: [
          'totalSpend', 'vendors', 'purchaseRequests', 'totalRfqs',
          'executiveSummary', 'spendTrend', 'departmentSpend', 'vendorDistribution', 'procurementStatus'
        ],
        layouts: {
          lg: [
            { i: 'totalSpend', x: 0, y: 0, w: 3, h: 4 },
            { i: 'vendors', x: 3, y: 0, w: 3, h: 4 },
            { i: 'purchaseRequests', x: 6, y: 0, w: 3, h: 4 },
            { i: 'totalRfqs', x: 9, y: 0, w: 3, h: 4 },
            { i: 'executiveSummary', x: 0, y: 4, w: 12, h: 4 },
            { i: 'spendTrend', x: 0, y: 8, w: 6, h: 10 },
            { i: 'departmentSpend', x: 6, y: 8, w: 6, h: 10 },
            { i: 'vendorDistribution', x: 0, y: 18, w: 6, h: 10 },
            { i: 'procurementStatus', x: 6, y: 18, w: 6, h: 10 }
          ]
        }
      });
    }
    
    return prefs;
  }

  async updatePreferences(userId, data) {
    return await DashboardPreference.findOneAndUpdate(
      { user: userId },
      { $set: data },
      { new: true, upsert: true }
    );
  }
}

module.exports = new DashboardPreferenceService();
