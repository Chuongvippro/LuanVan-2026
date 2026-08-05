import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { checkToken } from '../../service/api';
import './Settings.css';

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState({ type: '', msg: '' });

  // Profile fields
  const [rawProfile, setRawProfile] = useState({});
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password fields
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passSaving, setPassSaving] = useState(false);

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailNewJob: true,
    emailApplication: true,
    emailNewsletter: false,
    browserPush: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // Appearance settings
  const [appearance, setAppearance] = useState({
    fontSize: 'normal',
    language: 'vi',
    theme: 'red'
  });
  const [appearanceSaving, setAppearanceSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const userData = await checkToken();
      if (!userData) { navigate('/login'); return; }
      setUser(userData);
      try {
        // Fetch Profile
        const resProfile = await api.get(`/profile/${userData.id}/${userData.role}`);
        const data = resProfile.data;
        setRawProfile(data);
        setProfileForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        });

        // Fetch Settings
        const resSettings = await api.get(`/settings/${userData.id}`);
        if(resSettings.data.success) {
           const s = resSettings.data.data;
           setNotifPrefs({
             emailNewJob: s.emailNewJob,
             emailApplication: s.emailApplication,
             emailNewsletter: s.emailNewsletter,
             browserPush: s.browserPush
           });
           setAppearance({
             fontSize: s.fontSize,
             language: s.language,
             theme: s.theme
           });
        }
      } catch (err) {
        console.error('Lỗi tải thông tin:', err);
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast({ type: '', msg: '' }), 3000);
  };

  // ---- Save Notifications ----
  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    try {
      await api.put(`/settings/${user.id}/notifications`, notifPrefs);
      showToast('success', '✅ Đã lưu tùy chọn thông báo!');
    } catch {
      showToast('error', 'Lỗi lưu cài đặt thông báo!');
    } finally {
      setNotifSaving(false);
    }
  };

  // ---- Save Appearance ----
  const handleSaveAppearance = async () => {
    setAppearanceSaving(true);
    try {
      await api.put(`/settings/${user.id}/appearance`, appearance);
      showToast('success', '✅ Đã lưu cài đặt giao diện!');
    } catch {
      showToast('error', 'Lỗi lưu cài đặt giao diện!');
    } finally {
      setAppearanceSaving(false);
    }
  };

  // ---- Profile Save ----
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast('error', 'Tên không được để trống!');
      return;
    }
    setProfileSaving(true);
    try {
      const userData = await checkToken();
      if (!userData) { navigate('/login'); return; }
      
      const payload = { ...rawProfile, ...profileForm };
      await api.put(`/profile/${userData.id}/${userData.role}`, payload);
      showToast('success', '✅ Đã cập nhật thông tin thành công!');
    } catch {
      showToast('error', 'Lỗi cập nhật thông tin!');
    } finally {
      setProfileSaving(false);
    }
  };

  // ---- Password Change ----
  const getPasswordStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passForm.oldPassword || !passForm.newPassword || !passForm.confirmPassword) {
      showToast('error', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      showToast('error', 'Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }
    const minLength = /^.{8,}$/;
    const hasUpper = /[A-Z]/;
    const hasLower = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if (!minLength.test(passForm.newPassword)) {
      showToast('error', 'Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (!hasUpper.test(passForm.newPassword)) {
      showToast('error', 'Mật khẩu phải chứa ít nhất 1 chữ hoa.');
      return;
    }
    if (!hasLower.test(passForm.newPassword)) {
      showToast('error', 'Mật khẩu phải chứa ít nhất 1 chữ thường.');
      return;
    }
    if (!hasNumber.test(passForm.newPassword)) {
      showToast('error', 'Mật khẩu phải chứa ít nhất 1 chữ số.');
      return;
    }
    if (!hasSpecial.test(passForm.newPassword)) {
      showToast('error', 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.');
      return;
    }
    setPassSaving(true);
    try {
      const userData = await checkToken();
      if (!userData) { navigate('/login'); return; }
      await api.post(`/profile/change-password/${userData.id}`, {
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword,
      });
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', '✅ Đổi mật khẩu thành công!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Lỗi đổi mật khẩu!';
      showToast('error', errMsg);
    } finally {
      setPassSaving(false);
    }
  };

  // ---- Handle Logout all sessions ----
  const handleLogoutAll = async () => {
    if (!window.confirm('Bạn có chắc muốn đăng xuất khỏi tất cả thiết bị?')) return;
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/login');
    } catch {
      showToast('error', 'Lỗi đăng xuất!');
    }
  };

  const passwordStrength = getPasswordStrength(passForm.newPassword);
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][passwordStrength] || '';
  const strengthClass = ['', 'weak', 'medium', 'medium', 'strong'][passwordStrength] || '';

  const tabs = [
    { id: 'profile', icon: '👤', label: 'Thông tin cá nhân' },
    { id: 'security', icon: '🔒', label: 'Mật khẩu & Bảo mật' },
    { id: 'notifications', icon: '🔔', label: 'Thông báo' },
    { id: 'appearance', icon: '🎨', label: 'Giao diện' },
  ];

  if (loading) {
    return (
      <div className="settings-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚙️</div>
          <p>Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {toast.msg && <div className={`settings-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="settings-container">
        {/* Sidebar */}
        <div className="settings-sidebar">
          <div className="settings-sidebar-header">
            <h3>⚙️ Cài đặt</h3>
            <p>Quản lý tài khoản của bạn</p>
          </div>
          <div className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="settings-content" key={activeTab}>

          {/* ====== TAB: PROFILE ====== */}
          {activeTab === 'profile' && (
            <>
              <h2 className="settings-section-title">Thông tin cá nhân</h2>
              <p className="settings-section-desc">Cập nhật thông tin cơ bản của tài khoản</p>

              <form onSubmit={handleProfileSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="settings-form-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      className="settings-input"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="settings-input"
                      value={profileForm.email}
                      disabled
                    />
                    <p className="settings-input-hint">Email không thể thay đổi</p>
                  </div>
                  <div className="settings-form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      className="settings-input"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="0912 345 678"
                    />
                  </div>
                  <div className="settings-form-group">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      className="settings-input"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Quận 1, TP.HCM"
                    />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label>Vai trò</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={user?.role === 'candidate' ? 'Ứng viên' : user?.role === 'recruiter' ? 'Nhà tuyển dụng' : 'Quản trị viên'}
                    disabled
                  />
                </div>

                <hr className="settings-divider" />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="settings-btn settings-btn-outline" onClick={() => navigate('/profile')}>
                    ← Về trang Hồ sơ
                  </button>
                  <button type="submit" className="settings-btn settings-btn-primary" disabled={profileSaving}>
                    {profileSaving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ====== TAB: SECURITY ====== */}
          {activeTab === 'security' && (
            <>
              <h2 className="settings-section-title">Mật khẩu & Bảo mật</h2>
              <p className="settings-section-desc">Quản lý mật khẩu và bảo vệ tài khoản của bạn</p>

              <form onSubmit={handlePasswordChange}>
                <div className="settings-form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className="settings-input"
                    value={passForm.oldPassword}
                    onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="settings-form-group">
                    <label>Mật khẩu mới</label>
                    <input
                      type="password"
                      className="settings-input"
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    {passForm.newPassword && (
                      <>
                        <div className="settings-password-strength">
                          {[1, 2, 3, 4].map(level => (
                            <div key={level} className={`strength-bar ${passwordStrength >= level ? `active ${strengthClass}` : ''}`} />
                          ))}
                        </div>
                        <p className="settings-input-hint" style={{ color: strengthClass === 'strong' ? '#22c55e' : strengthClass === 'weak' ? '#ef4444' : '#f59e0b' }}>
                          Độ mạnh: {strengthLabel}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="settings-form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      className="settings-input"
                      value={passForm.confirmPassword}
                      onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    {passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword && (
                      <p className="settings-input-hint" style={{ color: '#ef4444' }}>⚠️ Mật khẩu không khớp</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="settings-btn settings-btn-primary" disabled={passSaving}>
                    {passSaving ? '⏳ Đang xử lý...' : '🔐 Cập nhật mật khẩu'}
                  </button>
                </div>
              </form>

              <hr className="settings-divider" />

              {/* Session Management */}
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Phiên đăng nhập</h3>

              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '24px' }}>🖥️</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>Thiết bị hiện tại</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Trình duyệt Web • Đang hoạt động</div>
                  </div>
                  <span style={{ marginLeft: 'auto', display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                </div>
              </div>

              <button className="settings-btn settings-btn-danger" onClick={handleLogoutAll}>
                🚪 Đăng xuất khỏi tất cả thiết bị
              </button>

              <hr className="settings-divider" />

              {/* Danger Zone */}
              <div className="settings-danger-zone">
                <h4>⚠️ Vùng nguy hiểm</h4>
                <p>Xóa tài khoản sẽ xóa toàn bộ dữ liệu liên quan. Hành động này không thể hoàn tác.</p>
                <button className="settings-btn settings-btn-danger" onClick={() => alert('Tính năng đang phát triển. Vui lòng liên hệ Admin.')}>
                  🗑️ Yêu cầu xóa tài khoản
                </button>
              </div>
            </>
          )}

          {/* ====== TAB: NOTIFICATIONS ====== */}
          {activeTab === 'notifications' && (
            <>
              <h2 className="settings-section-title">Cài đặt thông báo</h2>
              <p className="settings-section-desc">Chọn loại thông báo bạn muốn nhận</p>

              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</h3>

              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <h4>Việc làm phù hợp</h4>
                  <p>Nhận email khi có việc làm mới phù hợp với hồ sơ của bạn</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifPrefs.emailNewJob}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, emailNewJob: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <h4>Cập nhật ứng tuyển</h4>
                  <p>Nhận email khi trạng thái đơn ứng tuyển thay đổi</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifPrefs.emailApplication}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, emailApplication: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <h4>Bản tin nhân sự</h4>
                  <p>Nhận bản tin hàng tuần về xu hướng tuyển dụng IT</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifPrefs.emailNewsletter}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, emailNewsletter: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <hr className="settings-divider" />

              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trình duyệt</h3>

              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <h4>Thông báo đẩy</h4>
                  <p>Nhận thông báo realtime ngay trên trình duyệt</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifPrefs.browserPush}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, browserPush: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <hr className="settings-divider" />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="settings-btn settings-btn-primary"
                  onClick={handleSaveNotifications}
                  disabled={notifSaving}
                >
                  {notifSaving ? '⏳ Đang lưu...' : '💾 Lưu tùy chọn'}
                </button>
              </div>
            </>
          )}

          {/* ====== TAB: APPEARANCE ====== */}
          {activeTab === 'appearance' && (
            <>
              <h2 className="settings-section-title">Giao diện</h2>
              <p className="settings-section-desc">Tùy chỉnh trải nghiệm hiển thị của bạn</p>

              {/* Font Size */}
              <div className="settings-form-group">
                <label>Cỡ chữ</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  {[
                    { value: 'small', label: 'Nhỏ', size: '13px' },
                    { value: 'normal', label: 'Bình thường', size: '15px' },
                    { value: 'large', label: 'Lớn', size: '17px' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`settings-btn ${appearance.fontSize === opt.value ? 'settings-btn-primary' : 'settings-btn-outline'}`}
                      style={{ flex: 1, justifyContent: 'center', fontSize: opt.size }}
                      onClick={() => setAppearance({ ...appearance, fontSize: opt.value })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="settings-divider" />

              {/* Language */}
              <div className="settings-form-group">
                <label>Ngôn ngữ hiển thị</label>
                <select 
                  className="settings-input" 
                  value={appearance.language}
                  onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                >
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>

              {/* Theme Preview */}
              <div className="settings-form-group">
                <label>Chủ đề màu sắc</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  {[
                    { id: 'red', name: 'Đỏ Thương Hiệu', color: '#ed1b2f' },
                    { id: 'blue', name: 'Xanh Dương', color: '#3b82f6' },
                    { id: 'purple', name: 'Tím', color: '#8b5cf6' },
                    { id: 'green', name: 'Xanh Lá', color: '#22c55e' },
                  ].map(theme => {
                    const isActive = appearance.theme === theme.id;
                    return (
                      <div
                        key={theme.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          opacity: isActive ? 1 : 0.5,
                        }}
                        onClick={() => setAppearance({ ...appearance, theme: theme.id })}
                      >
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: theme.color,
                          border: isActive ? '3px solid #0f172a' : '2px solid #e2e8f0',
                          boxShadow: isActive ? `0 4px 12px ${theme.color}40` : 'none',
                          transition: 'all 0.2s'
                        }} />
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: isActive ? '600' : '400' }}>
                          {theme.name}
                        </span>
                        {isActive && <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700' }}>✓ Đang dùng</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="settings-divider" />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="settings-btn settings-btn-primary"
                  onClick={handleSaveAppearance}
                  disabled={appearanceSaving}
                >
                  {appearanceSaving ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
