import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';
import './JobDetail.css';

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('accessToken');
  const user = token ? decodeToken(token) : null;

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.data.success) setJob(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const cvFile = e.target.cv.files[0];
    const coverLetter = e.target.coverLetter.value;
    if (!cvFile) { setMessage('Vui lòng chọn file CV!'); return; }

    setApplying(true);
    const formData = new FormData();
    formData.append('cv', cvFile);
    if (coverLetter) {
      formData.append('coverLetter', coverLetter);
    }

    try {
      const res = await api.post(`/applications/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setMessage('🎉 Ứng tuyển thành công!');
        setShowApplyModal(false);
        fetchJobDetail();
      } else {
        setMessage(`❌ ${res.data.message}`);
      }
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Lỗi khi ứng tuyển!'}`);
    } finally {
      setApplying(false);
    }
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    if (logoPath.startsWith('/images/')) return logoPath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${logoPath}`;
  };

  if (loading) return (
    <div className="job-detail-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
      <div className="spinner"></div>
    </div>
  );
  if (!job) return <div className="job-detail-page" style={{ textAlign: 'center', paddingTop: '100px' }}>Bài đăng không tồn tại!</div>;

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        
        {/* CỘT TRÁI: Nội dung chính */}
        <div className="job-detail-main">
          
          <div className="job-detail-header-bg"></div>
          
          <div className="job-detail-header-content">
            <div className="job-detail-logo-box">
              {job.companyLogo ? (
                <img src={getLogoUrl(job.companyLogo)} alt={job.companyName} />
              ) : (
                <span className="job-detail-logo-placeholder">
                  {job.companyName ? job.companyName.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>
            
            <h1 className="job-detail-title">{job.title}</h1>
            
            <div className="job-detail-company">
              🏢 {job.companyName || 'Công ty ẩn danh'}
              {job.companyPoint && (
                <span className="job-detail-trust-badge">
                  ⭐ {job.companyPoint} điểm uy tín
                </span>
              )}
            </div>

            <div className="job-detail-tags">
              {job.salary && <div className="job-detail-tag highlight">💰 <strong style={{ marginLeft: '4px' }}>{job.salary}</strong></div>}
              {job.locationAddress && <div className="job-detail-tag">📍 {job.locationAddress || job.location}</div>}
              {job.jobType && <div className="job-detail-tag">⏳ {job.jobType}</div>}
              {job.experienceLevel && <div className="job-detail-tag">📊 {job.experienceLevel}</div>}
              {job.categoryName && <div className="job-detail-tag">💼 {job.categoryName}</div>}
            </div>
          </div>

          <div className="job-section">
            <h3>📝 Mô tả công việc</h3>
            <div className="job-section-content">{job.jdText || 'Chưa có mô tả chi tiết.'}</div>
          </div>

          {job.requirements && (
            <div className="job-section" style={{ borderTop: '1px solid #f1f5f9' }}>
              <h3>✅ Yêu cầu ứng viên</h3>
              <div className="job-section-content">{job.requirements}</div>
            </div>
          )}

          {job.benefits && (
            <div className="job-section" style={{ borderTop: '1px solid #f1f5f9' }}>
              <h3>🎁 Quyền lợi được hưởng</h3>
              <div className="job-section-content">{job.benefits}</div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: Thông tin phụ & Nút ứng tuyển */}
        <aside className="job-sidebar">
          <h4 className="sidebar-title">Thông tin chung</h4>
          
          <div className="sidebar-stat-list">
            <div className="sidebar-stat-item">
              <span className="sidebar-stat-label">🕒 Ngày đăng</span>
              <span className="sidebar-stat-value">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="sidebar-stat-item">
              <span className="sidebar-stat-label">👥 Đã ứng tuyển</span>
              <span className="sidebar-stat-value">{job.applicationCount} người</span>
            </div>
            <div className="sidebar-stat-item">
              <span className="sidebar-stat-label">Trạng thái</span>
              <span className={`job-status-badge ${job.status === 1 ? 'active' : 'inactive'}`}>
                {job.status === 1 ? 'Đang tuyển' : 'Đã đóng'}
              </span>
            </div>
            <div className="sidebar-stat-item">
              <span className="sidebar-stat-label">Mã CV</span>
              <span className="sidebar-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
                  {job.jobCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(job.jobCode);
                    setMessage('✅ Đã copy mã công việc!');
                    setTimeout(() => setMessage(''), 3000);
                  }}
                  style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', padding: '2px 8px', fontSize: '12px', color: '#64748b' }}
                >
                  Copy
                </button>
              </span>
            </div>
          </div>

          <div className="apply-btn-wrapper">
            {message && (
              <div className={`action-message ${message.includes('❌') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
            
            {user?.role === 'candidate' ? (
              <button 
                className={`apply-btn ${job.status === 1 ? 'primary' : 'disabled'}`} 
                onClick={() => setShowApplyModal(true)} 
                disabled={job.status !== 1}
              >
                {job.status === 1 ? '🚀 Ứng tuyển ngay' : '🔒 Đã đóng tuyển dụng'}
              </button>
            ) : !user ? (
              <button className="apply-btn outline" onClick={() => navigate('/login')}>
                Đăng nhập để ứng tuyển
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '16px', background: '#f8fafc', borderRadius: '12px', fontSize: '14px' }}>
                Tài khoản nhà tuyển dụng hoặc admin không thể ứng tuyển trực tiếp.
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="custom-modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="custom-modal-box" onClick={e => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h3>Ứng tuyển: {job.title}</h3>
              <button className="close-btn" onClick={() => setShowApplyModal(false)}>×</button>
            </div>
            
            <div className="custom-modal-body">
              <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>Bạn đang ứng tuyển vào vị trí thuộc công ty <strong style={{ color: '#0f172a' }}>{job.companyName}</strong>.</p>
              </div>

              <form onSubmit={handleApply}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Họ và tên</label>
                    <input type="text" value={user?.name || ''} disabled style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontWeight: '600' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Email</label>
                    <input type="email" value={user?.email || ''} disabled style={{ width: '100%', padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontWeight: '600' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>
                    Tải lên CV (PDF/DOC) <span style={{ color: '#ed1b2f' }}>*</span>
                  </label>
                  <div className="upload-box">
                    <input type="file" name="cv" accept=".pdf,.doc,.docx" required style={{ width: '100%', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>
                    Thư tự giới thiệu (Không bắt buộc)
                  </label>
                  <textarea 
                    name="coverLetter" 
                    placeholder="Viết đôi dòng giới thiệu nổi bật về bạn..." 
                    rows="4"
                    style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '16px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                  <button type="button" className="apply-btn outline" style={{ flex: 1 }} onClick={() => setShowApplyModal(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="apply-btn primary" style={{ flex: 2 }} disabled={applying}>
                    {applying ? '⏳ Đang gửi hồ sơ...' : '🚀 Xác nhận ứng tuyển'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetail;
