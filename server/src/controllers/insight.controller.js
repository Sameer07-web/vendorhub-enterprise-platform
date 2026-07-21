const AIInsight = require('../models/AIInsight');
const insightGeneratorService = require('../services/ai/insightGenerator.service');

// @desc    Get all active insights
// @route   GET /api/v1/ai/insights
// @access  Private (Admin/Manager)
exports.getInsights = async (req, res) => {
  try {
    // Return NEW and ACKNOWLEDGED, ordered by generatedAt descending
    const insights = await AIInsight.find({ status: { $in: ['NEW', 'ACKNOWLEDGED'] } })
      .sort({ generatedAt: -1 })
      .populate('resolvedBy', 'fullName email')
      .lean();

    res.json({ success: true, count: insights.length, data: insights });
  } catch (err) {
    console.error('Error fetching insights:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Generate insights on-demand
// @route   POST /api/v1/ai/insights/generate
// @access  Private (Admin)
exports.generateInsights = async (req, res) => {
  try {
    const insights = await insightGeneratorService.generateInsights();
    res.status(201).json({ success: true, count: insights.length, data: insights });
  } catch (err) {
    console.error('Error generating insights:', err);
    res.status(500).json({ success: false, error: 'Failed to generate insights' });
  }
};

// @desc    Update insight status (Acknowledge/Resolve)
// @route   PUT /api/v1/ai/insights/:id/status
// @access  Private
exports.updateInsightStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['ACKNOWLEDGED', 'RESOLVED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const insight = await AIInsight.findById(req.params.id);
    if (!insight) {
      return res.status(404).json({ success: false, error: 'Insight not found' });
    }

    insight.status = status;
    
    if (status === 'ACKNOWLEDGED') {
      insight.acknowledgedAt = new Date();
    } else if (status === 'RESOLVED') {
      insight.resolvedAt = new Date();
      insight.resolvedBy = req.user._id;
    }

    await insight.save();
    res.json({ success: true, data: insight });
  } catch (err) {
    console.error('Error updating insight status:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
