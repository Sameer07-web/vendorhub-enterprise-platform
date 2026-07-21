const copilotService = require('../services/ai/copilot.service');
const AIDraft = require('../models/AIDraft');

const queryCopilot = async (req, res) => {
  const { prompt, history = [], stream = false } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  try {
    if (stream) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      const onChunk = (chunk) => {
        res.write(chunk);
      };

      await copilotService.processQuery(prompt, req.user, history, onChunk);
      res.end();
    } else {
      const responseText = await copilotService.processQuery(prompt, req.user, history);
      res.json({ success: true, data: { response: responseText } });
    }
  } catch (error) {
    console.error('AI Controller Error:', error);
    if (stream) {
      res.write('\n\n*Sorry, an internal error occurred.*');
      res.end();
    } else {
      res.status(500).json({ success: false, error: 'Failed to process AI query' });
    }
  }
};

const getDraft = async (req, res) => {
  try {
    const draft = await AIDraft.findById(req.params.id);
    
    if (!draft) {
      return res.status(404).json({ success: false, error: 'Draft not found or expired' });
    }
    
    // Check if draft belongs to user (optional, maybe drafts are shareable, but strictly we can check user)
    if (draft.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this draft' });
    }
    
    if (draft.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: 'Draft has already been consumed' });
    }

    res.json({ success: true, data: draft });
  } catch (error) {
    console.error('Get Draft Error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve draft' });
  }
};

module.exports = {
  queryCopilot,
  getDraft
};
