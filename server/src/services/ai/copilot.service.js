const AIConversationRepository = require('../../repositories/AIConversationRepository');
const geminiProvider = require('./geminiProvider');
const SYSTEM_PROMPT = require('./systemPrompt');
const toolRegistry = require('./toolRegistry');
const toolExecutor = require('./toolExecutor');

class CopilotService {
  constructor() {
    geminiProvider.init();
    this.toolsForLLM = toolRegistry.map(t => t.declaration);
  }

  /**
   * Main entrypoint for processing an AI query with TenantSession context.
   */
  async processQuery(sessionOrOrgId, prompt, user, history = [], onChunk) {
    let latencyMs = 0;
    const startTime = Date.now();
    const toolCallLogs = [];
    
    try {
      const AuthorizationService = require('../AuthorizationService');
      const AuthorizationPolicyRepository = require('../../repositories/AuthorizationPolicyRepository');
      const { PermissionDefinitions } = require('../../constants/permissions.registry');
      const policyEngineService = require('../policyEngine.service');
      
      const member = await AuthorizationService.resolveMembership(sessionOrOrgId, user._id);
      
      let permissions = [];
      let restrictions = '';

      if (member) {
        const context = { user: { _id: user._id, department: user.department } };
        
        for (const definition of PermissionDefinitions) {
          const parts = definition.key.split(':');
          const resource = parts[0];
          const action = parts[1] || '*';
          const decision = await policyEngineService.evaluate(sessionOrOrgId, member, resource, action, context);
          if (decision.allowed) {
            permissions.push(definition.key);
          }
        }

        const policies = await AuthorizationPolicyRepository.findMany(sessionOrOrgId, { enabled: true });
        restrictions = policies.map(p => `Resource: ${p.resource}, Action: ${p.action}, Effect: ${p.effect}, Priority: ${p.priority}`).join('; ');
      }

      const permissionAwarePrompt = `${SYSTEM_PROMPT}\n\nCRITICAL CONTEXT:\nThe active user is authorized ONLY for the following permissions: [${permissions.join(', ')}].\nActive policy restrictions: [${restrictions}].\nYou must not recommend or expose features blocked by these policies.`;

      let { text, toolCalls } = await geminiProvider.generateContent(
        prompt,
        history,
        this.toolsForLLM,
        permissionAwarePrompt,
        onChunk
      );

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
            const registryEntry = toolRegistry.find(t => t.declaration.name === functionName);
            if (!registryEntry) {
              throw new Error(`LLM attempted to call unknown tool: ${functionName}`);
            }

            resultData = await toolExecutor.execute(functionName, args, user, registryEntry.rbac, sessionOrOrgId);
          } catch (err) {
            toolSuccess = false;
            errorMessage = err.message;
            resultData = { error: err.message };
            console.error(`[Copilot] Tool execution failed: ${functionName}`, err);
          }

          const toolLatency = Date.now() - toolStart;
          
          toolCallLogs.push({
            toolName: functionName,
            arguments: args,
            result: toolSuccess ? 'Success (Data fetched)' : errorMessage,
            latencyMs: toolLatency,
            success: toolSuccess,
            errorMessage
          });

          toolResponses.push({
            functionResponse: {
              name: functionName,
              response: { result: resultData }
            }
          });
        }

        const newHistory = [
          ...history,
          { role: 'user', parts: [{ text: prompt }] },
          { role: 'model', parts: toolCalls.map(c => ({ functionCall: c })) },
          { role: 'user', parts: toolResponses }
        ];

        const synthesis = await geminiProvider.generateContent(
          "",
          newHistory,
          [],
          SYSTEM_PROMPT,
          onChunk
        );

        text = synthesis.text;
      }

      latencyMs = Date.now() - startTime;

      await this._logConversation(sessionOrOrgId, user._id, prompt, text, toolCallLogs, latencyMs, true);

      return text;

    } catch (error) {
      latencyMs = Date.now() - startTime;
      await this._logConversation(sessionOrOrgId, user._id, prompt, "An error occurred.", toolCallLogs, latencyMs, false, error.message);
      
      console.error('[Copilot] Query processing failed:', error);
      if (onChunk) onChunk("\n\n*I encountered an issue connecting to the procurement systems. Please try again later.*");
      return "*I encountered an issue connecting to the procurement systems. Please try again later.*";
    }
  }

  async _logConversation(sessionOrOrgId, userId, prompt, response, toolCalls, latencyMs, success, errorDetails = null) {
    try {
      await AIConversationRepository.create(sessionOrOrgId, {
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
