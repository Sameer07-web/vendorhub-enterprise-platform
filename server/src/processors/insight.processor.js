const insightGeneratorService = require('../services/ai/insightGenerator.service');

module.exports = async (job) => {
  try {
    const insights = await insightGeneratorService.generateInsights();
    return { success: true, count: insights.length };
  } catch (error) {
    console.error(`[InsightProcessor] Failed to generate insights for job ${job.id}:`, error);
    throw error;
  }
};
