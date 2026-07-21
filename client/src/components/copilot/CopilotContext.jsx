import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const CopilotContext = createContext();

export const useCopilot = () => useContext(CopilotContext);

export const CopilotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const toggleCopilot = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCopilot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCopilot]);

  const sendQuery = async (prompt) => {
    // Add user message to history
    const newHistory = [...history, { role: 'user', parts: [{ text: prompt }] }];
    setHistory(newHistory);
    setIsTyping(true);

    try {
      // Use standard non-streaming for simplicity in React without fetch reader handling
      const res = await api.post('/ai/query', { 
        prompt,
        history: history // Pass previous history
      });
      
      const assistantText = res.data.data.response;
      setHistory([...newHistory, { role: 'model', parts: [{ text: assistantText }] }]);
    } catch (err) {
      console.error(err);
      setHistory([...newHistory, { role: 'model', parts: [{ text: '*Sorry, an error occurred while connecting to the AI service.*' }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <CopilotContext.Provider value={{ isOpen, toggleCopilot, history, sendQuery, isTyping, clearHistory }}>
      {children}
    </CopilotContext.Provider>
  );
};
