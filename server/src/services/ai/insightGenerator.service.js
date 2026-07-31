const geminiProvider = require('./geminiProvider');
const AIInsightRepository = require('../../repositories/AIInsightRepository');
const workflowAnalyticsService = require('../analytics/workflowAnalytics.service');
const analyticsService = require('../analytics.service');

const INSIGHT_SYSTEM_PROMPT = `You are VendorHub AI, an operational intelligence engine for an Enterprise Procurement platform.
Your task is to analyze the provided JSON data (SLA metrics, funnel, automation stats, KPIs) and generate proactive business insights.

For each insight you identify, provide:
- type: One of [TREND, ANOMALY, BOTTLENECK, PERFORMANCE, OPPORTUNITY, RISK, RECOMMENDATION]
- severity: One of [LOW, MEDIUM, HIGH, CRITICAL, POSITIVE] (Use POSITIVE for good performance/trends)
- title: A short, descriptive title.
- description: Explain WHY this is happening using data points. Be concise.
- actionableAdvice: What should the user do about it?
- confidenceScore: 0 to 100 representing your confidence in this insight based on the data.
- affectedModule: e.g. "Workflow", "Vendors", "Finance Department", "Automation"

Rules:
- Generate 3 to 5 high-quality insights.
- Do NOT hallucinate data. Only use the numbers provided in the input payload.
- Return ONLY a JSON array of insight objects. No markdown formatting, no backticks.`;

class InsightGeneratorService {
  async generateInsights(sessionOrOrgId) {
    console.log('[InsightGenerator] Starting proactive insight generation...');
    try {
      const slaMetrics = await workflowAnalyticsService.getSlaMetrics(sessionOrOrgId, '30d');
      const departmentScorecard = await workflowAnalyticsService.getDepartmentScorecard(sessionOrOrgId, '30d');
      const funnel = await workflowAnalyticsService.getApprovalFunnel(sessionOrOrgId, '30d');
      const automation = await workflowAnalyticsService.getAutomationMetrics(sessionOrOrgId, '30d');
      const kpis = await analyticsService.getDashboardKPIs(sessionOrOrgId);

      const payload = {
        slaMetrics,
        departmentScorecard,
        approvalFunnel: funnel,
        automationMetrics: automation,
        highLevelKPIs: kpis
      };

      const prompt = `Analyze the following operational data and generate insights:\n${JSON.stringify(payload, null, 2)}`;

      const response = await geminiProvider.generateContent(
        prompt,
        [],
        [],
        INSIGHT_SYSTEM_PROMPT,
        null,
        { responseMimeType: "application/json" }
      );

      let rawText = response.text;
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      const insights = JSON.parse(rawText);
      const createdInsights = [];
      
      for (const item of insights) {
        const existing = await AIInsightRepository.findOne(sessionOrOrgId, {
          type: item.type,
          affectedModule: item.affectedModule,
          status: { $in: ['NEW', 'ACKNOWLEDGED'] }
        });

        if (existing) {
          existing.occurrences += 1;
          existing.generatedAt = new Date();
          existing.confidenceScore = item.confidenceScore;
          existing.description = item.description;
          existing.referenceData = payload;
          await existing.save();
          createdInsights.push(existing);
        } else {
          const newInsight = await AIInsightRepository.create(sessionOrOrgId, {
            title: item.title,
            description: item.description,
            type: item.type,
            severity: item.severity,
            confidenceScore: item.confidenceScore,
            affectedModule: item.affectedModule,
            actionableAdvice: item.actionableAdvice,
            referenceData: payload
          });
          createdInsights.push(newInsight);
        }
      }

      console.log(`[InsightGenerator] Successfully processed ${createdInsights.length} insights.`);
      return createdInsights;
    } catch (error) {
      console.error('[InsightGenerator] Failed to generate insights:', error);
      throw error;
    }
  }
}

module.exports = new InsightGeneratorService();
