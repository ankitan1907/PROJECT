import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Notebook as Robot, X } from 'lucide-react';
import { useStore } from '../store';
import { planetData } from '../data/planetData';
import { FactType } from '../types';

const ChatContainer = styled.div`
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 350px;
  height: 500px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ChatHeader = styled.div`
  padding: 15px;
  background: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Message = styled.div<{ isBot?: boolean }>`
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  background: ${props => props.isBot ? '#e8e8e8' : '#3498db'};
  color: ${props => props.isBot ? '#333' : 'white'};
  align-self: ${props => props.isBot ? 'flex-start' : 'flex-end'};
`;

const InputContainer = styled.div`
  padding: 15px;
  display: flex;
  gap: 10px;
  background: white;
  border-top: 1px solid #eee;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  
  &:focus {
    border-color: #3498db;
  }
`;

const SendButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2980b9;
  }
`;

const QuickQuestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 15px;
  background: #f5f5f5;
`;

const QuickQuestion = styled.button`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3498db;
    color: white;
    border-color: #3498db;
  }
`;

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);

  const quickQuestions: FactType[] = [
    'atmosphere',
    'temperature',
    'moons',
    'composition',
    'orbit',
    'interesting'
  ];

  useEffect(() => {
    if (selectedPlanet) {
      setMessages([{
        text: `Hi! I'm Bolt 🤖 Ask me anything about ${selectedPlanet}! You can try asking about its atmosphere, temperature, moons, composition, orbit, or interesting facts!`,
        isBot: true
      }]);
    }
  }, [selectedPlanet]);

  const getPlanetFact = (question: string): string => {
    if (!selectedPlanet) return '';
    
    const planet = planetData.find(p => p.name === selectedPlanet);
    if (!planet) return '';

    // Check if the question matches any quick question type
    const factType = quickQuestions.find(q => 
      question.toLowerCase().includes(q.toLowerCase())
    );

    if (factType) {
      return planet.facts[factType];
    }

    // Default response for unrecognized questions
    return `I'm still learning about ${selectedPlanet}! Try asking about its atmosphere, temperature, moons, composition, orbit, or other interesting facts! 🌟`;
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        text: getPlanetFact(userMessage),
        isBot: true
      }]);
    }, 1500);
  };

  const handleQuickQuestion = (question: FactType) => {
    setMessages(prev => [
      ...prev,
      { text: `Tell me about ${selectedPlanet}'s ${question}`, isBot: false },
      { text: getPlanetFact(question), isBot: true }
    ]);
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <HeaderTitle>
          <Robot size={24} />
          <span>Chat with Bolt about {selectedPlanet}</span>
        </HeaderTitle>
        <CloseButton onClick={() => setSelectedPlanet(null)}>
          <X size={20} />
        </CloseButton>
      </ChatHeader>
      
      <QuickQuestions>
        {quickQuestions.map((q) => (
          <QuickQuestion key={q} onClick={() => handleQuickQuestion(q)}>
            {q.charAt(0).toUpperCase() + q.slice(1)}
          </QuickQuestion>
        ))}
      </QuickQuestions>

      <ChatMessages>
        {messages.map((msg, index) => (
          <Message key={index} isBot={msg.isBot}>
            {msg.text}
          </Message>
        ))}
        {isTyping && (
          <Message isBot>
            Bolt is typing... 🤖
          </Message>
        )}
      </ChatMessages>
      
      <InputContainer>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about the planet..."
        />
        <SendButton onClick={handleSend}>
          <Send size={20} />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatInterface;