import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api, { checkToken } from '../service/api';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const initUser = async () => {
      const userData = await checkToken(); // Kiểm tra và tự động làm mới ngầm nếu cần
      setUser(userData);
      setIsLoading(false);
    };
    initUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('auth-changed'));
    setUser(null); // Xóa state user để Navbar chuyển về trạng thái Chưa đăng nhập ngay lập tức
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
      <div className="container">
        <div className="d-flex align-items-center gap-4">
          <Link to="/" className="navbar-logo">
            <span>Job</span>Platform
          </Link>
          <div className="navbar-links">
            <Link to="/jobs">All Jobs</Link>
            <Link to="/companies">IT Companies</Link>
          </div>
        </div>

        <div className="navbar-actions d-flex align-items-center gap-3" style={{ height: '100%' }}>
          
          {/* Nút dành cho Nhà tuyển dụng */}
          {(!user || user.role !== 'recruiter') && (
            <Link to="/post-job" style={{ 
              display: 'flex', flexDirection: 'column', padding: '4px 12px', 
              border: '1px solid #333', borderRadius: '4px', textDecoration: 'none',
              backgroundColor: 'rgba(255,255,255,0.05)', transition: 'background 0.2s',
              marginRight: '10px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            >
              <span style={{ fontSize: '11px', color: '#a6a6a6', lineHeight: '1' }}>Dành cho</span>
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: '600', lineHeight: '1.2' }}>Nhà Tuyển Dụng</span>
            </Link>
          )}
          
          {user ? (
            <div className="user-dropdown-container">
              <div className="user-dropdown-trigger d-flex align-items-center gap-2" style={{ cursor: 'pointer', padding: '5px' }}>
                
                {/* Avatar ITviec style */}
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid transparent', overflow: 'hidden', padding: '2px' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ed1b2f' }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
                
                <span style={{ color: '#a6a6a6', fontSize: '10px', marginLeft: '2px' }}>▼</span>
              </div>
              
              <div className="user-dropdown-menu">
                <div className="user-dropdown-header">
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ed1b2f' }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: '#121212', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'Người dùng'}</div>
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
                  <Link to="/settings" className="user-dropdown-item">
                    <span className="user-dropdown-icon">⚙️</span> Cài đặt tài khoản
                  </Link>
                </div>
                
                <div className="user-dropdown-footer">
                  <button onClick={handleLogout} className="user-dropdown-item" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#d32f2f' }}>
                    <span className="user-dropdown-icon">🚪</span> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', fontWeight: '600', color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontWeight: '600', backgroundColor: '#ed1b2f', borderColor: '#ed1b2f' }}>Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
