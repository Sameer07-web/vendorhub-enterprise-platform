const geminiProvider = require('./geminiProvider');
const AIInsight = require('../../models/AIInsight');
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
  async generateInsights() {
    console.log('[InsightGenerator] Starting proactive insight generation...');
    try {
      // 1. Gather Context
      const slaMetrics = await workflowAnalyticsService.getSlaMetrics('30d');
      const departmentScorecard = await workflowAnalyticsService.getDepartmentScorecard('30d');
      const funnel = await workflowAnalyticsService.getApprovalFunnel('30d');
      const automation = await workflowAnalyticsService.getAutomationMetrics('30d');
      const kpis = await analyticsService.getDashboardKPIs();

      const payload = {
        slaMetrics,
        departmentScorecard,
        approvalFunnel: funnel,
        automationMetrics: automation,
        highLevelKPIs: kpis
      };

      const prompt = `Analyze the following operational data and generate insights:\n${JSON.stringify(payload, null, 2)}`;

      // 2. Query LLM
      const response = await geminiProvider.generateContent(
        prompt,
        [], // no history
        [], // no tools needed for generation
        INSIGHT_SYSTEM_PROMPT,
        null,
        { responseMimeType: "application/json" } // Force JSON output if supported
      );

      let rawText = response.text;
      // Strip markdown block if model ignored the mimeType directive
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      const insights = JSON.parse(rawText);
      
      // 3. Process and Persist Insights
      const createdInsights = [];
      
      for (const item of insights) {
        // Simple deduplication strategy based on type and affectedModule for unresolved insights
        const existing = await AIInsight.findOne({
          type: item.type,
          affectedModule: item.affectedModule,
          status: { $in: ['NEW', 'ACKNOWLEDGED'] }
        });

        if (existing) {
          // Update occurrences and refresh generatedAt
          existing.occurrences += 1;
          existing.generatedAt = new Date();
          existing.confidenceScore = item.confidenceScore;
          existing.description = item.description; // Update with latest context
          existing.referenceData = payload; // Keep latest evidence
          await existing.save();
          createdInsights.push(existing);
        } else {
          // Create new
          const newInsight = await AIInsight.create({
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
