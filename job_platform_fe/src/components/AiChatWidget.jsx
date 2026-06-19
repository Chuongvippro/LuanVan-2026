import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../service/api';

function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');
  const user = token ? decodeToken(token) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Tải lịch sử chat khi mở (nếu đã đăng nhập)
  useEffect(() => {
    if (isOpen && messages.length === 0 && user) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      if (res.data.success && res.data.data) {
        setMessages(res.data.data.map(m => ({ role: m.role, content: m.content })));
      }
    } catch (err) {
      console.error('Lỗi tải lịch sử chat:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: userMessage,
        context: 'general'
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.data }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    try {
      await api.delete('/ai/history');
      setMessages([]);
    } catch (err) {
      console.error('Lỗi xóa lịch sử:', err);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button className="ai-widget-btn" onClick={() => setIsOpen(!isOpen)} title="Trợ lý AI">
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat drawer */}
      <div className={`ai-chat-drawer ${isOpen ? 'open' : ''}`}>
        <div className="ai-chat-header">
          <h3>🤖 Trợ lý AI</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {user && <button className="btn btn-ghost btn-sm" onClick={handleClearHistory} style={{ color: 'white' }}>Xóa</button>}
            <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} style={{ color: 'white' }}>✕</button>
          </div>
        </div>

        <div className="ai-chat-messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <p style={{ fontSize: '15px', lineHeight: '1.5' }}>
                Xin chào! Tôi là trợ lý AI của JobPlatform.
                <br /><br />
                {user ? (
                  user.role === 'candidate'
                    ? 'Hãy hỏi tôi về việc làm, CV, hay kinh nghiệm phỏng vấn nhé!'
                    : 'Tôi có thể giúp bạn viết JD, hoặc đánh giá CV ứng viên!'
                ) : (
                  <span>
                    Bạn cần <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); setIsOpen(false); }} style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Đăng nhập</a> để có thể trò chuyện với tôi!
                  </span>
                )}
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`ai-message ${msg.role}`}>
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="ai-message assistant">
              <span style={{ animation: 'pulse 1.5s infinite' }}>Đang suy nghĩ...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="ai-chat-input">
          <input
            type="text"
            placeholder={user ? "Nhập tin nhắn..." : "Vui lòng đăng nhập trước..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading || !user}
          />
          <button onClick={handleSend} disabled={loading || !input.trim() || !user}>
            Gửi
          </button>
        </div>
      </div>
    </>
  );
}

export default AiChatWidget;
