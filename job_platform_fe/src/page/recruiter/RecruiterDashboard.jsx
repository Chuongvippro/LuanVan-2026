import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';

function RecruiterDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('accessToken');
  const user = token ? decodeToken(token) : null;

  useEffect(() => {
    if (!user || user.role !== 'recruiter') {
      alert('Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với tài khoản nhà tuyển dụng.');
      navigate('/');
      return;
    }
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs/my-posts');
      if (res.data.success) setJobs(res.data.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách bài đăng', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      fetchMyJobs();
    } catch (err) {
      alert('Lỗi xóa bài đăng');
    }
  };

  const totalPosts = jobs.length;
  const activePosts = jobs.filter(j => j.status === 1).length;
  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0);

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: 'calc(100vh - 70px)', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#121212', marginBottom: '8px' }}>Quản lý bài đăng</h2>
            <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>Theo dõi và quản lý các chiến dịch tuyển dụng của bạn</p>
          </div>
          <button className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '15px', fontWeight: '600', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(237, 27, 47, 0.2)' }} onClick={() => navigate('/post-job')}>
            <span style={{ fontSize: '18px' }}>+</span> Tạo chiến dịch mới
          </button>
        </div>

        {/* Stats Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>📝</div>
            <div>
              <p style={{ fontSize: '14px', color: '#666', fontWeight: '500', marginBottom: '4px' }}>Tổng bài đăng</p>
              <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#121212', margin: 0 }}>{totalPosts}</h3>
            </div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🟢</div>
            <div>
              <p style={{ fontSize: '14px', color: '#666', fontWeight: '500', marginBottom: '4px' }}>Đang mở tuyển</p>
              <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#121212', margin: 0 }}>{activePosts}</h3>
            </div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👥</div>
            <div>
              <p style={{ fontSize: '14px', color: '#666', fontWeight: '500', marginBottom: '4px' }}>Tổng lượt ứng tuyển</p>
              <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#121212', margin: 0 }}>{totalApplications}</h3>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner"></div></div>
        ) : jobs.length === 0 ? (
          <div style={{ backgroundColor: '#fff', padding: '80px 20px', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '120px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '56px' }}>🚀</span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>Bắt đầu hành trình tìm kiếm nhân tài</h3>
            <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '400px', margin: '0 auto 30px', lineHeight: '1.6' }}>
              Bạn chưa có bất kỳ chiến dịch tuyển dụng nào. Hãy tạo ngay một bài đăng để tiếp cận hàng ngàn ứng viên tiềm năng trên hệ thống của chúng tôi.
            </p>
            <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px', fontWeight: '600', borderRadius: '8px', boxShadow: '0 4px 12px rgba(237, 27, 47, 0.25)' }} onClick={() => navigate('/post-job')}>
              Đăng tin tuyển dụng ngay
            </button>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Chi tiết công việc</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Hiệu quả</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Trạng thái</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', cursor: 'pointer', marginBottom: '6px' }} onClick={() => navigate(`/jobs/${job.id}`)}>
                        {job.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>Mã ID: #{job.id}</span>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span>
                        <span>Đăng ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '8px 16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontWeight: '700', fontSize: '18px', color: '#166534' }}>{job.applicationCount || 0}</span>
                        <span style={{ fontSize: '12px', color: '#166534', fontWeight: '500' }}>Hồ sơ</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '13px', 
                        fontWeight: '600',
                        backgroundColor: job.status === 1 ? '#dcfce7' : '#f1f5f9',
                        color: job.status === 1 ? '#15803d' : '#64748b'
                      }}>
                        {job.status === 1 ? 'Đang mở' : 'Đã đóng'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button style={{ border: 'none', background: 'transparent', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', color: '#2563eb', cursor: 'pointer' }} onClick={() => navigate(`/job-applicants/${job.id}`)}>
                          Xem CV
                        </button>
                        <button style={{ border: 'none', background: 'transparent', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', color: '#475569', cursor: 'pointer' }} onClick={() => navigate(`/edit-job/${job.id}`)}>
                          Sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;
