/**
 * Abstract interface for LLM Providers.
 * Any new provider (OpenAI, Anthropic, etc.) must implement these methods.
 */
class LLMProvider {
  /**
   * Initializes the provider (e.g. setting up client SDKs).
   */
  init() {
    throw new Error('Method not implemented.');
  }

  /**
   * Send a prompt with a list of available tools.
   * @param {string} prompt - The user's prompt.
   * @param {Array} history - Array of previous conversation turns.
   * @param {Array} tools - Array of tool definitions (JSON schema).
   * @param {string} systemInstruction - Instructions for the model's behavior.
   * @param {Function} onChunk - Optional callback for streaming response chunks.
   * @param {Object} extraConfig - Additional configuration (e.g., response schema or format).
   * @returns {Promise<Object>} The final response string and any tool calls made.
   */
  async generateContent(prompt, history, tools, systemInstruction, onChunk, extraConfig = {}) {
    throw new Error('Method not implemented.');
  }
}

module.exports = LLMProvider;
