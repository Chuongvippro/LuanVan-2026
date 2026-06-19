import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';

function CvManager() {
  const navigate = useNavigate();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [skills, setSkills] = useState('');

  const token = localStorage.getItem('accessToken');
  const user = token ? decodeToken(token) : null;

  useEffect(() => {
    if (!user || user.role !== 'candidate') {
      navigate('/login');
      return;
    }
    fetchCv();
  }, []);

  const fetchCv = async () => {
    try {
      const res = await api.get('/cv');
      if (res.data.success) {
        setCvData(res.data.data);
        setSkills(res.data.data.skills || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Tải lên CV thành công!' });
        fetchCv();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi tải lên CV!' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSkills = async () => {
    try {
      const res = await api.put('/cv/skills', { skills });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Lưu kỹ năng thành công!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi lưu kỹ năng!' });
    }
  };

  const handleDeleteCv = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa CV này?')) return;
    try {
      await api.delete('/cv');
      setMessage({ type: 'success', text: 'Đã xóa CV!' });
      fetchCv();
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi xóa CV!' });
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">📄 Quản lý Hồ sơ CV</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Tải lên CV của bạn (định dạng PDF) để AI có thể phân tích và giúp bạn tìm kiếm việc làm phù hợp nhất.
        </p>

        {message.text && (
          <div className={`toast toast-${message.type}`} style={{ position: 'relative', top: 0, right: 0, marginBottom: '20px' }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          {/* Cột trái: Thông tin CV file */}
          <div style={{ flex: 1, padding: '24px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Tệp CV hiện tại</h3>
            {cvData?.cvPath ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '32px' }}>📑</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600' }}>CV_cua_toi.pdf</p>
                    <a href={`${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${cvData.cvPath}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px' }}>
                      Xem chi tiết →
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label className="btn btn-primary" style={{ flex: 1 }}>
                    {uploading ? '⏳ Đang tải...' : '🔄 Thay đổi CV'}
                    <input type="file" hidden accept=".pdf" onChange={handleUpload} disabled={uploading} />
                  </label>
                  <button className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={handleDeleteCv}>
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
                <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Bạn chưa có CV nào trên hệ thống.</p>
                <label className="btn btn-primary">
                  {uploading ? '⏳ Đang tải...' : '📤 Tải lên CV (PDF)'}
                  <input type="file" hidden accept=".pdf" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
            )}
          </div>

          {/* Cột phải: Kỹ năng bổ sung */}
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Kỹ năng chuyên môn</h3>
            <div className="form-group">
              <label>Khai báo thêm các kỹ năng để AI đối chiếu với JD tốt hơn</label>
              <textarea 
                value={skills} 
                onChange={(e) => setSkills(e.target.value)}
                placeholder="VD: ReactJS, Java Spring Boot, MySQL, Giao tiếp tiếng Anh..."
                style={{ height: '160px' }}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSaveSkills}>💾 Lưu kỹ năng</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CvManager;
