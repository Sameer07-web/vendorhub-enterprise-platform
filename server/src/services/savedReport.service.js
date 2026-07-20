const SavedReport = require('../models/SavedReport');
const ExportJob = require('../models/ExportJob');

class SavedReportService {
  async getSavedReports(userId) {
    return await SavedReport.find({ user: userId }).sort({ folder: 1, name: 1 });
  }

  async getRecentReportsAndJobs(userId) {
    const recentSaved = await SavedReport.find({ user: userId, lastRunAt: { $ne: null } })
      .sort({ lastRunAt: -1 })
      .limit(10)
      .lean();

    const recentJobs = await ExportJob.find({ user: userId })
      .sort({ lastRunAt: -1 })
      .limit(10)
      .lean();

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

  async createSavedReport(userId, data) {
    const report = new SavedReport({
      ...data,
      user: userId
    });
    return await report.save();
  }

  async updateSavedReport(userId, reportId, data) {
    return await SavedReport.findOneAndUpdate(
      { _id: reportId, user: userId },
      { $set: data },
      { new: true }
    );
  }

  async deleteSavedReport(userId, reportId) {
    return await SavedReport.findOneAndDelete({ _id: reportId, user: userId });
  }

  async markAsRun(userId, reportId) {
    return await SavedReport.findOneAndUpdate(
      { _id: reportId, user: userId },
      { $set: { lastRunAt: new Date() } },
      { new: true }
    );
  }
}

module.exports = new SavedReportService();
