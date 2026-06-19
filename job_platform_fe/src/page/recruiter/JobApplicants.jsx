import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';

function JobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('accessToken');
  const user = token ? decodeToken(token) : null;

  useEffect(() => {
    if (!user || user.role !== 'recruiter') {
      navigate('/login');
      return;
    }
    fetchJobAndApplicants();
  }, [jobId]);

  const fetchJobAndApplicants = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications/job/${jobId}`)
      ]);
      
      if (jobRes.data.success) setJob(jobRes.data.data);
      if (appsRes.data.success) setApplications(appsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      fetchJobAndApplicants(); // reload
    } catch (err) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!job) return <div className="page-container"><p>Không tìm thấy bài đăng.</p></div>;

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <button className="btn btn-ghost" onClick={() => navigate('/my-posts')} style={{ marginBottom: '20px' }}>
        ← Quay lại danh sách bài đăng
      </button>

      <div className="section-header">
        <div>
          <h2 className="section-title">Danh sách ứng viên</h2>
          <p className="section-subtitle">Bài đăng: <strong>{job.title}</strong></p>
        </div>
        <span className="badge badge-active">{applications.length} Ứng tuyển</span>
      </div>

      {applications.length === 0 ? (
        <div className="page-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Chưa có ứng viên nào nộp hồ sơ vào vị trí này.</p>
        </div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Ứng viên</th>
                <th>Email</th>
                <th>CV File</th>
                <th>AI Match</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.candidate.user.name}</strong>
                    {app.coverLetter && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '6px', fontStyle: 'italic', maxWidth: '250px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={app.coverLetter}>
                        "{app.coverLetter}"
                      </div>
                    )}
                  </td>
                  <td>{app.candidate.user.email}</td>
                  <td>
                    <a 
                      href={`${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${app.cvPath}`} 
                      target="_blank" rel="noreferrer"
                      style={{ color: 'var(--primary)', fontWeight: '600' }}
                    >
                      📄 Xem CV
                    </a>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                      🤖 Chưa phân tích
                    </span>
                  </td>
                  <td>
                    {app.status === 1 ? <span className="badge badge-active">✅ Đã duyệt</span> : 
                     app.status === -1 ? <span className="badge badge-inactive">❌ Từ chối</span> : 
                     <span className="badge badge-pending">⏳ Đang chờ</span>}
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    {app.status === 0 && (
                      <>
                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => updateStatus(app.id, 1)}>Duyệt</button>
                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => updateStatus(app.id, -1)}>Từ chối</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default JobApplicants;
