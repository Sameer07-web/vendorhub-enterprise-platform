const dashboardPreferenceService = require('../services/dashboardPreference.service');

const getPreferences = async (req, res) => {
  try {
    const prefs = await dashboardPreferenceService.getPreferences(req.user._id);
    res.json({ success: true, data: prefs });
  } catch (error) {
    console.error('Error fetching dashboard preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const prefs = await dashboardPreferenceService.updatePreferences(req.user._id, req.body);
    res.json({ success: true, data: prefs });
  } catch (error) {
    console.error('Error updating dashboard preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
};

module.exports = {
  getPreferences,
  updatePreferences
};
