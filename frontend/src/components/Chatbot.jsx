import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setMessages([{ text: "Welcome to Dmart! How can I help you find products today?", sender: 'bot' }]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => setInput(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // ✅ Corrected API Port to 5000
      const response = await axios.post('http://127.0.0.1:5000/api/product_location', {
        product_name: input
      });

      const botResponse = {
        text: response.data.product 
          ? `${response.data.product} is located at ${response.data.location}`
          : 'Sorry, I could not find that product.',
        sender: 'bot'
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error:", error);
      
      let errorMessage = "Error fetching data. Please try again.";
      if (error.response) {
        // Server responded with an error
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      } else if (error.request) {
        // No response received (server might be down)
        errorMessage = "No response from server. Make sure the backend is running.";
      } else {
        // Other Axios errors
        errorMessage = "Request failed. Check your internet connection.";
      }

      setMessages((prev) => [...prev, { text: errorMessage, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={toggleChatbot}>
        {isOpen ? 'Close' : 'Chat with D-Mart Assistant'}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>D-Mart Product Finder</h3>
            <button className="close-btn" onClick={toggleChatbot}>×</button>
          </div>

          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
            {isLoading && <div className="message bot">Searching...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input type="text" value={input} onChange={handleInputChange} placeholder="Type a product name..." />
            <button type="submit" disabled={isLoading}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
