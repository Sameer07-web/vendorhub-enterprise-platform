const workflowService = require('../services/workflow/workflow.service');

const processAction = async (req, res) => {
  const { id } = req.params;
  const { action, comments } = req.body;

  try {
    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action payload' });
    }

    // Map payload APPROVE -> APPROVED (to match our History ENUM)
    const historyAction = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const process = await workflowService.processAction(id, req.user._id, historyAction, comments);
    
    res.json({
      success: true,
      data: process
    });
  } catch (error) {
    console.error('Workflow Action Error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  processAction
};
