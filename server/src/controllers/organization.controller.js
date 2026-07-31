const organizationService = require('../services/organization.service');

const getOrganization = async (req, res) => {
  try {
    const org = await organizationService.getOrganizationById(req.organization._id);
    res.json({ success: true, data: org });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const updateOrganization = async (req, res) => {
  try {
    // Only Owners/Admins should update
    if (!['Owner', 'Admin'].includes(req.user.organizationRole)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    
    // Do not allow updating owner, plan or status directly through this generic endpoint
    const { name, description, logo, website, email, phone, timezone, currency, country, industry, language, dateFormat, numberFormat } = req.body;
    
    const updateData = { name, description, logo, website, email, phone, timezone, currency, country, industry, language, dateFormat, numberFormat };
    
    const org = await organizationService.updateOrganization(req.organization._id, updateData);
    res.json({ success: true, data: org });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await organizationService.getSettings(req.organization._id);
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    // Only Owners/Admins should update settings
    if (!['Owner', 'Admin'].includes(req.user.organizationRole)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    const settings = await organizationService.updateSettings(req.organization._id, req.body);
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getOrganization,
  updateOrganization,
  getSettings,
  updateSettings
};
