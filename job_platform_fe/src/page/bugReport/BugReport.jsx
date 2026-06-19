import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';

function BugReport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = localStorage.getItem('accessToken');
  const user = token ? decodeToken(token) : null;

  if (!user) {
    return (
      <div className="page-container">
        <div className="page-card" style={{ textAlign: 'center' }}>
          <h2>Vui lòng đăng nhập</h2>
          <p style={{ margin: '20px 0', color: 'var(--text-muted)' }}>Bạn cần đăng nhập để gửi báo cáo lỗi.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Đăng nhập</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/bug-reports', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Cảm ơn bạn! Báo cáo đã được gửi thành công.' });
        setFormData({ title: '', description: '' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div className="page-card">
        <h2 className="page-title">🐛 Báo cáo lỗi hệ thống</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Nếu bạn gặp bất kỳ sự cố nào khi sử dụng JobPlatform, vui lòng mô tả chi tiết dưới đây để chúng tôi khắc phục sớm nhất.
        </p>

        {message.text && (
          <div className={`toast toast-${message.type}`} style={{ position: 'relative', top: 0, right: 0, marginBottom: '20px' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tiêu đề lỗi *</label>
            <input 
              required 
              placeholder="VD: Lỗi không tải được file CV" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Mô tả chi tiết *</label>
            <textarea 
              required 
              placeholder="Hãy mô tả các bước bạn đã thực hiện trước khi gặp lỗi..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? '⏳ Đang gửi...' : '🚀 Gửi báo cáo'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BugReport;
