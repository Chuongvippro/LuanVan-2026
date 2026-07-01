import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';

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

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!job) return <div className="page-container"><p>Bài đăng không tồn tại!</p></div>;

  return (
    <>
      <div className="job-detail-layout">
      {/* CỘT TRÁI: Nội dung chính */}
      <div className="job-main-content">
        <div className="company-logo-large" style={{ padding: job.companyLogo ? '10px' : '0' }}>
          {job.companyLogo ? (
            <img src={getLogoUrl(job.companyLogo)} alt={job.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            job.companyName ? job.companyName.charAt(0).toUpperCase() : '?'
          )}
        </div>
        
        <h1 className="job-detail-title">{job.title}</h1>
        
        <div className="company-name-highlight">
          🏢 {job.companyName || 'Công ty ẩn danh'}
          {job.companyPoint && (
            <span className="badge badge-active" style={{ fontSize: '13px', marginLeft: '10px' }}>
              ⭐ {job.companyPoint} điểm uy tín
            </span>
          )}
        </div>

        <div className="job-tags-container">
          {job.salary && <div className="job-tag">💰 <strong style={{ color: '#ed1b2f' }}>{job.salary}</strong></div>}
          {job.location && <div className="job-tag">📍 {job.location}</div>}
          {job.jobType && <div className="job-tag">⏳ {job.jobType}</div>}
          {job.experienceLevel && <div className="job-tag">📊 Kinh nghiệm: {job.experienceLevel}</div>}
          {job.categoryName && <div className="job-tag">📋 {job.categoryName}</div>}
        </div>

        <div className="job-section">
          <h3>📝 Mô tả công việc</h3>
          <div className="job-section-content">{job.jdText || 'Chưa có mô tả chi tiết.'}</div>
        </div>

        {job.requirements && (
          <div className="job-section">
            <h3>✅ Yêu cầu ứng viên</h3>
            <div className="job-section-content">{job.requirements}</div>
          </div>
        )}

        {job.benefits && (
          <div className="job-section">
            <h3>🎁 Quyền lợi được hưởng</h3>
            <div className="job-section-content">{job.benefits}</div>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: Thông tin phụ & Nút ứng tuyển */}
      <div className="job-sidebar">
        <div className="sidebar-box">
          <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '2px solid #ed1b2f', paddingBottom: '10px', display: 'inline-block' }}>Thông tin chung</h4>
          
          <div className="sidebar-stat">
            <span className="sidebar-stat-label">Ngày đăng</span>
            <span className="sidebar-stat-value">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-label">Lượt ứng tuyển</span>
            <span className="sidebar-stat-value">{job.applicationCount} người</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-label">Trạng thái</span>
            <span className="sidebar-stat-value">
              <span className={`badge ${job.status === 1 ? 'badge-active' : 'badge-inactive'}`}>
                {job.status === 1 ? 'Đang tuyển' : 'Đã đóng'}
              </span>
            </span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-label">Mã công việc</span>
            <span className="sidebar-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <code style={{ background: '#f4f5f7', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>
                {job.jobCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(job.jobCode);
                  setMessage('✅ Đã copy mã công việc!');
                  setTimeout(() => setMessage(''), 2000);
                }}
                style={{ background: 'none', border: '1px solid #dfe1e6', borderRadius: '4px', cursor: 'pointer', padding: '2px 8px', fontSize: '12px', color: '#5e6c84' }}
              >
                📋 Copy
              </button>
            </span>
          </div>
        </div>

        <div style={{ marginTop: '40px' }}>
          {message && (
            <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center', background: message.includes('🎉') ? '#e8f5e9' : '#ffebee', color: message.includes('🎉') ? '#2e7d32' : '#c62828', fontWeight: '500' }}>
              {message}
            </div>
          )}
          
          {user?.role === 'candidate' ? (
            <button className="btn btn-primary apply-button-large" onClick={() => setShowApplyModal(true)} disabled={job.status !== 1}>
              {job.status === 1 ? '🚀 Ứng tuyển ngay' : '🔒 Đã đóng tuyển dụng'}
            </button>
          ) : !user ? (
            <button className="btn btn-primary apply-button-large" onClick={() => navigate('/login')}>
              Đăng nhập để ứng tuyển
            </button>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
              Nhà tuyển dụng không thể ứng tuyển.
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Apply Modal */}
      {showApplyModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 30, 66, 0.54)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            width: '100%', 
            maxWidth: '600px', 
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #ebecf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderRadius: '12px 12px 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#172b4d' }}>Ứng tuyển vị trí</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', color: '#5e6c84', cursor: 'pointer', padding: '0 8px' }} onClick={() => setShowApplyModal(false)}>×</button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px', padding: '16px', background: '#f4f5f7', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#172b4d', marginBottom: '8px' }}>{job.title}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#5e6c84' }}>{job.companyName}</p>
              </div>

              <form onSubmit={handleApply}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#172b4d', marginBottom: '16px', borderBottom: '2px solid #ed1b2f', display: 'inline-block', paddingBottom: '4px' }}>Thông tin liên hệ</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '14px', color: '#42526e', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Họ và tên</label>
                    <input type="text" className="form-control" value={user?.name || ''} disabled style={{ backgroundColor: '#f4f5f7', color: '#5e6c84', borderColor: '#dfe1e6' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '14px', color: '#42526e', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Email</label>
                    <input type="email" className="form-control" value={user?.email || ''} disabled style={{ backgroundColor: '#f4f5f7', color: '#5e6c84', borderColor: '#dfe1e6' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '13px', color: '#5e6c84', margin: 0 }}><em>* Thông tin này được lấy từ hồ sơ cá nhân của bạn.</em></p>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#172b4d', marginBottom: '16px', borderBottom: '2px solid #ed1b2f', display: 'inline-block', paddingBottom: '4px' }}>Hồ sơ ứng tuyển</h4>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '14px', color: '#42526e', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Tải lên CV của bạn <span style={{ color: '#ed1b2f' }}>*</span>
                  </label>
                  <div style={{ border: '1px dashed #c1c7d0', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fafbfc' }}>
                    <input type="file" name="cv" accept=".pdf,.doc,.docx" required style={{ width: '100%' }} />
                    <p style={{ fontSize: '12px', color: '#7a869a', marginTop: '10px', marginBottom: 0 }}>Hỗ trợ định dạng .PDF, .DOC, .DOCX. Tối đa 5MB.</p>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '14px', color: '#42526e', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Thư giới thiệu (Cover Letter) <span style={{ fontSize: '12px', color: '#7a869a', fontWeight: 'normal' }}>- Không bắt buộc</span>
                  </label>
                  <textarea 
                    name="coverLetter" 
                    className="form-control" 
                    placeholder="Viết đôi dòng giới thiệu bản thân, lý do bạn phù hợp với vị trí này hoặc những kỹ năng nổi bật..." 
                    rows="4"
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '16px', paddingTop: '20px', borderTop: '1px solid #ebecf0' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '12px' }} onClick={() => setShowApplyModal(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '12px', fontSize: '16px', fontWeight: '600' }} disabled={applying}>
                    {applying ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#fff' }}></div> Đang gửi hồ sơ...
                      </span>
                    ) : (
                      '🚀 Gửi hồ sơ ứng tuyển'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default JobDetail;
