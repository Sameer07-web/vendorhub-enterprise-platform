const { GoogleGenAI } = require('@google/genai');
const LLMProvider = require('./LLMProvider');

class GeminiProvider extends LLMProvider {
  constructor() {
    super();
    this.client = null;
    this.modelName = 'gemini-2.5-flash';
  }

  init() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('[GeminiProvider] GEMINI_API_KEY is not set. AI features will be disabled or fail.');
    }
    // Initialize the new SDK
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('[GeminiProvider] Initialized.');
  }

  _mapHistoryToGeminiContent(history) {
    // Map standard { role: 'user' | 'model', parts: [{text}] } to Gemini structure
    return history.map(h => ({
      role: h.role, // 'user' or 'model'
      parts: h.parts // [{text: "..."}] or [{functionCall: {...}}]
    }));
  }

  async generateContent(prompt, history, tools, systemInstruction, onChunk, extraConfig = {}) {
    if (!this.client) {
      throw new Error('Gemini client not initialized.');
    }

    const contents = this._mapHistoryToGeminiContent(history);
    
    const userParts = [{ text: prompt }];
    if (extraConfig.files) {
      extraConfig.files.forEach(file => {
        userParts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.base64
          }
        });
      });
      delete extraConfig.files;
    }
    
    contents.push({ role: 'user', parts: userParts });

    const config = {
      systemInstruction,
      tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined,
      temperature: 0.1, // Keep it deterministic for enterprise tool calling
      ...extraConfig
    };

    let fullText = '';
    let toolCalls = [];

    if (onChunk) {
      // Streaming implementation
      const responseStream = await this.client.models.generateContentStream({
        model: this.modelName,
        contents,
        config
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullText += chunk.text;
          onChunk(chunk.text);
        }
        
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          toolCalls.push(...chunk.functionCalls);
        }
      }
    } else {
      // Non-streaming implementation
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents,
        config
      });

      fullText = response.text || '';
      if (response.functionCalls && response.functionCalls.length > 0) {
        toolCalls = response.functionCalls;
      }
    }

    return { text: fullText, toolCalls };
  }
}

module.exports = new GeminiProvider();
