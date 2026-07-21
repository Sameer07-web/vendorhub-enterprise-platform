const AutomationRule = require('../models/AutomationRule');

// Basic CRUD for Automation Rules

const createRule = async (req, res) => {
  try {
    const rule = await AutomationRule.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getRules = async (req, res) => {
  try {
    const rules = await AutomationRule.find({}).sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getRuleById = async (req, res) => {
  try {
    const rule = await AutomationRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateRule = async (req, res) => {
  try {
    const rule = await AutomationRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    
    Object.assign(rule, req.body);
    rule.updatedBy = req.user._id;
    rule.version += 1;
    await rule.save();
    
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteRule = async (req, res) => {
  try {
    const rule = await AutomationRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createRule,
  getRules,
  getRuleById,
  updateRule,
  deleteRule
};
