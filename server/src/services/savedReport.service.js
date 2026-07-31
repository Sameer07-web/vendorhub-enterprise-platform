const SavedReportRepository = require('../repositories/SavedReportRepository');
const ExportJobRepository = require('../repositories/ExportJobRepository');

class SavedReportService {
  async getSavedReports(sessionOrOrgId, userId) {
    return await SavedReportRepository.findMany(sessionOrOrgId, { user: userId }, null, { sort: { folder: 1, name: 1 } });
  }

  async getRecentReportsAndJobs(sessionOrOrgId, userId) {
    const recentSaved = await SavedReportRepository.findMany(sessionOrOrgId, { user: userId, lastRunAt: { $ne: null } }, null, {
      sort: { lastRunAt: -1 },
      limit: 10
    });

    const recentJobs = await ExportJobRepository.findMany(sessionOrOrgId, { user: userId }, null, {
      sort: { lastRunAt: -1 },
      limit: 10
    });

    // Combine and sort by lastRunAt DESC
    const combined = [...recentSaved, ...recentJobs].sort((a, b) => new Date(b.lastRunAt) - new Date(a.lastRunAt));
    
    // De-duplicate by name (for saved) and reportType (for jobs) to get top 10 unique recent activities
    const unique = [];
    const seen = new Set();
    
    for (const item of combined) {
      const key = item.name || item.reportType; // name for SavedReport, reportType for ExportJob
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
        if (unique.length === 10) break;
      }
    }
    return unique;
  }

  async createSavedReport(sessionOrOrgId, userId, data) {
    return await SavedReportRepository.create(sessionOrOrgId, {
      ...data,
      user: userId
    });
  }

  async updateSavedReport(sessionOrOrgId, userId, reportId, data) {
    return await SavedReportRepository.update(
      sessionOrOrgId,
      { _id: reportId, user: userId },
      data,
      { new: true }
    );
  }

  async deleteSavedReport(sessionOrOrgId, userId, reportId) {
    return await SavedReportRepository.delete(sessionOrOrgId, { _id: reportId, user: userId });
  }

  async markAsRun(sessionOrOrgId, userId, reportId) {
    return await SavedReportRepository.update(
      sessionOrOrgId,
      { _id: reportId, user: userId },
      { lastRunAt: new Date() },
      { new: true }
    );
  }
}

module.exports = new SavedReportService();
