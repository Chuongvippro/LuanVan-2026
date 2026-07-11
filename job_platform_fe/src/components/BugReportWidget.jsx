import { useState, useEffect, useRef } from 'react';
import api, { checkToken } from '../service/api';

function BugReportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await checkToken();
      setUser(userData);
    };
    loadUser();
    window.addEventListener('auth-changed', loadUser);
    return () => window.removeEventListener('auth-changed', loadUser);
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) { alert('Chỉ hỗ trợ ảnh PNG, JPG hoặc WEBP!'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Ảnh tối đa 5MB!'); return; }
    setScreenshot(file);
  };

  const getReportTitle = () => {
    const role = user?.role;
    if (role === 'recruiter' || role === 'ROLE_RECRUITER') return 'USER_REPORT_RECRUITER';
    if (role === 'candidate' || role === 'ROLE_CANDIDATE') return 'USER_REPORT_CANDIDATE';
    if (role === 'admin' || role === 'ROLE_ADMIN') return 'USER_REPORT_ADMIN';

    return 'USER_REPORT_GUEST';
  };

  const handleSubmit = async () => {
    // Check đăng nhập trước, tránh gọi API dư thừa
    if (!user) {
      alert('Vui lòng đăng nhập để gửi báo cáo lỗi!');
      return;
    }

    if (!description.trim()) {
      alert('Vui lòng mô tả lỗi bạn gặp phải!');
      return;
    }

    setLoading(true);
    setResultMsg(null);

    try {
      const formData = new FormData();
      formData.append('title', getReportTitle());
      formData.append('description', description.trim());
      if (screenshot) formData.append('screenshot', screenshot);

      const res = await api.post('/bug-reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setResultMsg({ type: 'success', text: 'Đã gửi báo cáo lỗi thành công! Cảm ơn bạn đã phản hồi.' });
        setDescription('');
        setScreenshot(null);
      } else {
        setResultMsg({ type: 'error', text: res.data.message || 'Gửi báo cáo thất bại, thử lại sau!' });
      }
    } catch (err) {
      setResultMsg({
        type: 'error',
        text: err.response?.data?.message || err.response?.data?.error || 'Đã có lỗi xảy ra, vui lòng thử lại!',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="bug-widget-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Báo lỗi hệ thống"
      >
        {isOpen ? '✕' : '❗'}
      </button>

      <div className={`bug-report-drawer ${isOpen ? 'open' : ''}`}>
        <div className="bug-report-header">
          <h3>❗ Báo lỗi hệ thống</h3>
          <button
            onClick={() => setIsOpen(false)}
            title="Đóng"
            className="btn-ghost"
            style={{
              width: '30px', height: '30px', borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.25)', color: 'white', fontSize: '15px',
              fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div className="bug-report-body">
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Gặp lỗi khi sử dụng hệ thống? Mô tả chi tiết giúp đội kỹ thuật xử lý nhanh hơn nhé.
          </p>

          <div>
            <label style={labelStyle}>Mô tả lỗi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Bấm nút Ứng tuyển không phản hồi..."
              rows={5}
              style={{
                width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db',
                borderRadius: '8px', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Ảnh chụp màn hình (không bắt buộc)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                border: '1.5px dashed #d1d5db', borderRadius: '10px', cursor: 'pointer',
                background: screenshot ? '#f0fdf4' : '#fafafa',
              }}
            >
              <input
                ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {screenshot ? (
                <>
                  <span style={{ fontSize: '20px' }}>✅</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {screenshot.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{(screenshot.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setScreenshot(null); }}
                    style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Xóa
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '20px' }}>📷</span>
                  <span style={{ fontSize: '13px', color: '#666' }}>Bấm để chọn ảnh (PNG/JPG, tối đa 5MB)</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '13px', background: loading ? '#fcd34d' : '#f59e0b',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Đang gửi...' : '🚀 Gửi báo cáo'}
          </button>

          {resultMsg && (
            <div style={{
              padding: '12px 14px', borderRadius: 8, fontSize: 13, lineHeight: 1.6,
              background: resultMsg.type === 'success' ? '#e6f7ef' : '#fef2f2',
              border: `1px solid ${resultMsg.type === 'success' ? '#00b14f' : '#ef4444'}`,
              color: resultMsg.type === 'success' ? '#005c28' : '#991b1b',
            }}>
              {resultMsg.text}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: '700', color: '#555',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
};

export default BugReportWidget;