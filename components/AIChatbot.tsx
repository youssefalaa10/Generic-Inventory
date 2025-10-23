import React, { useState, useRef, useEffect } from 'react';
import { ChatIcon, SparklesIcon } from './Icon';
import { getChatbotResponse } from '../services/geminiService';
import { ChatbotDataContext } from '../types';

interface AIChatbotProps {
    dataContext: ChatbotDataContext;
}

type Message = {
    sender: 'user' | 'ai';
    text: string;
};

const AIChatbot: React.FC<AIChatbotProps> = ({ dataContext }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages, isLoading]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([{ sender: 'ai', text: 'مرحباً! أنا "فهيم"، مساعدك الذكي. كيف يمكنني خدمتك اليوم؟ يمكنك سؤالي عن المبيعات، المخزون، والمزيد.' }]);
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        const query = userInput.trim();
        if (!query || isLoading) return;

        const newMessages: Message[] = [...messages, { sender: 'user', text: query }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await getChatbotResponse(query, dataContext);
            setMessages([...newMessages, { sender: 'ai', text: response }]);
        } catch (error) {
            setMessages([...newMessages, { sender: 'ai', text: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.' }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <>
            <button className="chatbot-fab" onClick={() => setIsOpen(!isOpen)} aria-label="Open AI Assistant">
                <ChatIcon style={{ width: '32px', height: '32px' }} />
            </button>
            {isOpen && (
                <div className="chatbot-modal glass-pane">
                    <div className="modal-header" style={{padding: '1rem 1.5rem'}}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <SparklesIcon style={{ width: '24px', height: '24px', color: 'var(--primary-color)' }} />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>المساعد الذكي "فهيم"</h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                    <div className="chat-history" ref={chatHistoryRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message ai thinking-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        )}
                    </div>
                    <div className="chat-input-area">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="اسأل عن أي شيء..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button className="btn btn-secondary" onClick={handleSendMessage} disabled={isLoading}>
                            إرسال
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
