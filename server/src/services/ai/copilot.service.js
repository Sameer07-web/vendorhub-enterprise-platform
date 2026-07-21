const AIConversation = require('../../models/AIConversation');
const geminiProvider = require('./geminiProvider');
const SYSTEM_PROMPT = require('./systemPrompt');
const toolRegistry = require('./toolRegistry');
const toolExecutor = require('./toolExecutor');

class CopilotService {
  constructor() {
    geminiProvider.init();
    // Expose declarations for the LLM
    this.toolsForLLM = toolRegistry.map(t => t.declaration);
  }

  /**
   * Main entrypoint for processing an AI query.
   */
  async processQuery(prompt, user, history = [], onChunk) {
    let latencyMs = 0;
    const startTime = Date.now();
    const toolCallLogs = [];
    
    try {
      // 1. Send initial prompt to LLM
      let { text, toolCalls } = await geminiProvider.generateContent(
        prompt,
        history,
        this.toolsForLLM,
        SYSTEM_PROMPT,
        onChunk
      );

      // 2. Handle Tool Calls if the LLM decided to use any
      if (toolCalls && toolCalls.length > 0) {
        const toolResponses = [];
        
        for (const call of toolCalls) {
          const toolStart = Date.now();
          const functionName = call.name;
          const args = call.args || {};
          
          let resultData;
          let toolSuccess = true;
          let errorMessage = null;

          try {
            // Find in registry
            const registryEntry = toolRegistry.find(t => t.declaration.name === functionName);
            if (!registryEntry) {
              throw new Error(`LLM attempted to call unknown tool: ${functionName}`);
            }

            // Execute
            resultData = await toolExecutor.execute(functionName, args, user, registryEntry.rbac);
          } catch (err) {
            toolSuccess = false;
            errorMessage = err.message;
            resultData = { error: err.message };
            console.error(`[Copilot] Tool execution failed: ${functionName}`, err);
          }

          const toolLatency = Date.now() - toolStart;
          
          // Log it for our DB
          toolCallLogs.push({
            toolName: functionName,
            arguments: args,
            result: toolSuccess ? 'Success (Data fetched)' : errorMessage,
            latencyMs: toolLatency,
            success: toolSuccess,
            errorMessage
          });

          // Add to conversation turn so we can feed it back to LLM
          toolResponses.push({
            functionResponse: {
              name: functionName,
              response: { result: resultData }
            }
          });
        }

        // We need to send the tool results back to the LLM to get the final text summary
        // We append the assistant's tool call turn, and then the tool results turn.
        const newHistory = [
          ...history,
          { role: 'user', parts: [{ text: prompt }] },
          { role: 'model', parts: toolCalls.map(c => ({ functionCall: c })) },
          { role: 'user', parts: toolResponses } // In Gemini, tool results are often passed as 'user' role or 'function' role. The genai SDK handles {functionResponse: {}} inside parts.
        ];

        // Call again for the final synthesis
        const synthesis = await geminiProvider.generateContent(
          "", // prompt is implicitly in the history now
          newHistory,
          [], // no tools needed for synthesis
          SYSTEM_PROMPT,
          onChunk
        );

        text = synthesis.text; // The final markdown text
      }

      latencyMs = Date.now() - startTime;

      // 3. Log the interaction
      await this._logConversation(user._id, prompt, text, toolCallLogs, latencyMs, true);

      return text;

    } catch (error) {
      latencyMs = Date.now() - startTime;
      await this._logConversation(user._id, prompt, "An error occurred.", toolCallLogs, latencyMs, false, error.message);
      
      console.error('[Copilot] Query processing failed:', error);
      // Graceful fallback
      if (onChunk) onChunk("\n\n*I encountered an issue connecting to the procurement systems. Please try again later.*");
      return "*I encountered an issue connecting to the procurement systems. Please try again later.*";
    }
  }

  async _logConversation(userId, prompt, response, toolCalls, latencyMs, success, errorDetails = null) {
    try {
      await AIConversation.create({
        user: userId,
        prompt,
        response,
        toolCalls,
        latencyMs,
        success,
        errorDetails
      });
    } catch (e) {
      console.error('[Copilot] Failed to log AI conversation to DB', e);
    }
  }
}

module.exports = new CopilotService();
