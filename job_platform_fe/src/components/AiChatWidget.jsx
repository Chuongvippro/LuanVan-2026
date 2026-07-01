import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../service/api';
import CvEvaluationPanel from './CvEvaluationPanel';
import JobMatchPanel from './JobMatchPanel';
import MockInterviewPanel from './MockInterviewPanel';  // ← thêm

const ACTION_BUTTONS = [
  { id: 'evaluate_cv',    label: '📄 Đánh giá CV',       description: 'So khớp CV với bài tuyển dụng' },
  { id: 'mock_interview', label: '🎤 Phỏng vấn thử',      description: 'Luyện tập câu hỏi phỏng vấn' },
  { id: 'find_jobs',      label: '🔍 Tìm việc phù hợp',   description: 'Gợi ý bài đăng việc làm phù hợp' },
];

function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState(null);
  const [profileCvUrl, setProfileCvUrl] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');
  const user  = token ? decodeToken(token) : null;

  useEffect(() => {
    const loadProfileCv = async () => {
      try {
        const res = await api.get('/candidate/profile');
        if (res.data.success && res.data.data?.cvUrl) {
          setProfileCvUrl(res.data.data.cvUrl);
        }
      } catch (err) {
        console.error('Error loading profile CV:', err);
      }
    };
    if (isOpen && user && !profileCvUrl) loadProfileCv();
  }, [isOpen, user]);

  const handleActionSelect = (action) => setActiveView(action.id);
  const handleBackToMenu   = ()       => setActiveView(null);

  const showMenu           = !activeView;
  const showEvaluatePanel  = activeView === 'evaluate_cv';
  const showFindJobsPanel  = activeView === 'find_jobs';
  const showMockInterview  = activeView === 'mock_interview';

  return (
    <>
      <button className="ai-widget-btn" onClick={() => setIsOpen(!isOpen)} title="Trợ lý AI">
        {isOpen ? '✕' : '🤖'}
      </button>

      <div className={`ai-chat-drawer ${isOpen ? 'open' : ''}`}>
        <div className="ai-chat-header">
          <h3>🤖 Trợ lý AI</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {user && !showMenu && (
              <button className="btn btn-ghost btn-sm" onClick={handleBackToMenu} style={{ color: 'white' }}>
                ← Menu
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} style={{ color: 'white' }}>
              ✕
            </button>
          </div>
        </div>

        {/* MENU */}
        {showMenu && (
          <div className="ai-chat-messages">
            {!user ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                <p style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Xin chào! Tôi là trợ lý AI của JobPlatform.<br /><br />
                  Bạn cần{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); setIsOpen(false); }}
                    style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
                    Đăng nhập
                  </a>{' '}
                  để có thể sử dụng trợ lý AI!
                </p>
              </div>
            ) : (
              <div style={{ padding: '24px 16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>👋</div>
                  <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.5', margin: 0 }}>
                    Xin chào! Tôi có thể giúp gì cho bạn hôm nay?
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ACTION_BUTTONS.map((action) => (
                    <button key={action.id} onClick={() => handleActionSelect(action)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                        gap: '4px', padding: '14px 16px', background: 'white',
                        border: '1.5px solid #e0e0e0', borderRadius: '12px', cursor: 'pointer',
                        textAlign: 'left', transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary-color, #6366f1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                      }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#222' }}>{action.label}</span>
                      <span style={{ fontSize: '13px', color: '#888' }}>{action.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showEvaluatePanel && (
          <div className="ai-chat-messages" style={{ overflowY: 'auto' }}>
            <CvEvaluationPanel onBack={handleBackToMenu} hasProfileCv={!!profileCvUrl} profileCvUrl={profileCvUrl} />
          </div>
        )}

        {showFindJobsPanel && (
          <div className="ai-chat-messages" style={{ overflowY: 'auto' }}>
            <JobMatchPanel onBack={handleBackToMenu} />
          </div>
        )}

        {/* ← Thay placeholder bằng MockInterviewPanel thật */}
        {showMockInterview && (
          <div className="ai-chat-messages" style={{ overflowY: 'auto' }}>
            <MockInterviewPanel onBack={handleBackToMenu} />
          </div>
        )}
      </div>

      {/* Spinner animation dùng cho MockInterviewPanel */}
      <style>{`@keyframes mi-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export default AiChatWidget;