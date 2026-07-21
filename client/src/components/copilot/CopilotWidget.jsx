import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCopilot } from './CopilotContext';
import './CopilotWidget.css'; // Optional CSS or use inline styles/tailwind

const CopilotWidget = () => {
  const { isOpen, toggleCopilot, history, sendQuery, isTyping, clearHistory } = useCopilot();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isTyping]);

  if (!isOpen) {
    return (
      <button className="copilot-toggle-btn" onClick={toggleCopilot} title="Ask AI (Ctrl+K)">
        💬 Ask AI
      </button>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendQuery(input.trim());
    setInput('');
  };

  return (
    <div className="copilot-widget">
      <div className="copilot-header">
        <h4>VendorHub Copilot</h4>
        <div className="copilot-actions">
          <button onClick={clearHistory} title="Clear Conversation">🧹</button>
          <button onClick={toggleCopilot}>✖</button>
        </div>
      </div>
      <div className="copilot-messages">
        {history.length === 0 && (
          <div className="copilot-welcome">
            <p>Hi! I'm your AI Procurement Assistant.</p>
            <p>Try asking:</p>
            <ul>
              <li onClick={() => sendQuery('Show overdue approvals from Finance')}>Show overdue approvals from Finance</li>
              <li onClick={() => sendQuery('Summarize pending RFQs')}>Summarize pending RFQs</li>
              <li onClick={() => sendQuery('Give me a summary of active vendors')}>Give me a summary of active vendors</li>
            </ul>
          </div>
        )}
        {history.map((msg, index) => (
          <div key={index} className={`copilot-message ${msg.role === 'user' ? 'user' : 'model'}`}>
            <div className="message-content">
              {msg.role === 'user' ? (
                msg.parts[0].text
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.parts[0].text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="copilot-message model">
            <div className="message-content typing-indicator">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="copilot-input-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask a question..." 
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !input.trim()}>Send</button>
      </form>
    </div>
  );
};

export default CopilotWidget;
