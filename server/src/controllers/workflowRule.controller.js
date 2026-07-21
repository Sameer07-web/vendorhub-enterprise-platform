const WorkflowRule = require('../models/WorkflowRule');

const getTemplates = async (req, res) => {
  try {
    const templates = await WorkflowRule.find({ isTemplate: true, isPublished: true })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const cloneTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await WorkflowRule.findById(id);

    if (!template || !template.isTemplate) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    // Create a new workflow rule based on the template
    const newRuleData = template.toObject();
    delete newRuleData._id;
    delete newRuleData.createdAt;
    delete newRuleData.updatedAt;
    
    // Modify to make it a concrete rule
    newRuleData.isTemplate = false;
    newRuleData.createdFromTemplate = template._id;
    newRuleData.name = `${template.name} (Cloned ${new Date().toISOString().slice(0,10)})`;
    newRuleData.version = 1;

    // By default, a newly cloned rule might not be active until configured
    newRuleData.isActive = false;

    const clonedRule = await WorkflowRule.create(newRuleData);

    res.status(201).json({ success: true, data: clonedRule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getTemplates,
  cloneTemplate
};
