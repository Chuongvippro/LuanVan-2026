import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api, { checkToken } from '../service/api';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      const userData = await checkToken();
      setUser(userData);
      setIsLoading(false);
    };
    initUser();
    window.addEventListener('auth-changed', initUser);
    return () => window.removeEventListener('auth-changed', initUser);
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('auth-changed'));
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <nav className="premium-navbar">
      <div className="container">
        
        {/* Left side */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className="nav-brand">
            <span>Job</span>Platform
          </Link>
          <div className="nav-menu">
            <Link to="/jobs" className="nav-link">Tìm siêu việc (All Jobs)</Link>
            <Link to="/companies" className="nav-link">Công ty IT (IT Companies)</Link>
          </div>
        </div>

        {/* Right side Actions */}
        <div className="nav-actions">
          
          {(!user || user.role !== 'recruiter') && (
            <Link to="/post-job" className="nav-employer-btn">
              <span className="employer-sm">Dành cho</span>
              <span className="employer-lg">Nhà Tuyển Dụng</span>
            </Link>
          )}
          
          {user ? (
            <div className="user-dropdown-container nav-user">
              <div className="nav-user-trigger">
                <div className="nav-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="nav-chevron">▼</span>
              </div>
              
              <div className="user-dropdown-menu">
                <div className="user-dropdown-header">
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ed1b2f' }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div style={{ overflow: 'hidden', marginLeft: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'Người dùng'}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || 'Chưa cập nhật email'}</div>
                  </div>
                </div>
                
                <div className="user-dropdown-body">
                  <Link to="/profile" className="user-dropdown-item">
                    <span className="user-dropdown-icon">👤</span> Tổng quan hồ sơ
                  </Link>
                  {user.role === 'candidate' && (
                    <Link to="/my-applications" className="user-dropdown-item">
                      <span className="user-dropdown-icon">💼</span> Việc làm của tôi
                    </Link>
                  )}
                  {user.role === 'recruiter' && (
                    <Link to="/my-posts" className="user-dropdown-item">
                      <span className="user-dropdown-icon">📊</span> Quản lý bài đăng
                    </Link>
                  )}
                </div>
                
                <div className="user-dropdown-footer">
                  <button onClick={handleLogout} className="user-dropdown-item" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                    <span className="user-dropdown-icon">🚪</span> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn-light">Đăng nhập</Link>
              <Link to="/register" className="nav-btn nav-btn-primary">Đăng ký</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
