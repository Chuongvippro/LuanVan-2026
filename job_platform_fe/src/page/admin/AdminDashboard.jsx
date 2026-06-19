import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);

  const [user] = useState(() => {
    const token = localStorage.getItem('accessToken');
    return token ? decodeToken(token) : null;
  });

  // ===== FETCH FUNCTIONS =====

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data?.success) setStats(res.data.data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải thống kê!');
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await api.get('/admin/users/candidates');
      console.log('[candidates raw]', res.data.data); // debug tạm
      if (res.data?.success) setCandidates(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách ứng viên!');
    }
  };

  const fetchRecruiters = async () => {
    try {
      const res = await api.get('/admin/users/recruiters');
      console.log('[recruiters raw]', res.data.data); // debug tạm
      if (res.data?.success) setRecruiters(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách nhà tuyển dụng!');
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/admin/jobs?size=50');
      if (res.data?.success) setJobs(res.data.data?.content || res.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách bài đăng!');
    }
  };

  const fetchErrorLogs = async () => {
    try {
      const res = await api.get('/admin/error-logs');
      if (res.data?.success) setErrorLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Không thể tải nhật ký lỗi!');
    }
  };

  // ===== ACTION FUNCTIONS =====

  const toggleUserStatus = async (userId, currentStatus, type) => {
    try {
      const nextStatus = currentStatus === 1 ? 0 : 1;
      await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      if (type === 'candidate') fetchCandidates();
      else fetchRecruiters();
    } catch (err) {
      console.error(err);
      alert('Cập nhật trạng thái thất bại!');
    }
  };

  const toggleJobStatus = async (jobId, status) => {
    try {
      await api.put(`/admin/jobs/${jobId}/status`, { status });
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert('Cập nhật trạng thái bài đăng thất bại!');
    }
  };

  const updateLogStatus = async (logId, status) => {
    try {
      await api.put(`/admin/error-logs/${logId}/status`, { status });
      fetchErrorLogs();
    } catch (err) {
      console.error(err);
      alert('Cập nhật trạng thái lỗi thất bại!');
    }
  };

  // ===== HOOKS =====

  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'admin') {
      navigate('/login');
      return;
    }
    fetchStats();
  }, [navigate, user]);

  useEffect(() => {
    if (activeTab === 'candidates') fetchCandidates();
    else if (activeTab === 'recruiters') fetchRecruiters();
    else if (activeTab === 'jobs') fetchJobs();
    else if (activeTab === 'bugs') fetchErrorLogs();
  }, [activeTab]);

  const menuItems = [
    { key: 'stats',      icon: '📊', label: 'Thống kê tổng quan' },
    { key: 'candidates', icon: '👨‍🎓', label: 'Quản lý Ứng viên' },
    { key: 'recruiters', icon: '🏢', label: 'Quản lý Nhà tuyển dụng' },
    { key: 'jobs',       icon: '📋', label: 'Quản lý bài đăng' },
    { key: 'bugs',       icon: '🐛', label: 'Nhật ký lỗi hệ thống' },
  ];

  // Helper hiển thị statusTrust recruiter
  const trustLabel = (val) => {
    if (!val) return 'Chưa có';
    if (val === 'verified') return '✅ Đã xác minh';
    if (val === 'banned')   return '🚫 Bị cấm';
    return `⏳ ${val}`;
  };
  const trustBadge = (val) => {
    if (val === 'verified') return 'badge-active';
    if (val === 'banned')   return 'badge-inactive';
    return 'badge-pending';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h3 style={{ padding: '0 24px 20px', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
          🛡️ Admin Panel
        </h3>
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`admin-sidebar-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => setActiveTab(item.key)}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </aside>

      <main className="admin-content">

        {/* TAB 1: THỐNG KÊ */}
        {activeTab === 'stats' && (
          <>
            <h2 style={{ marginBottom: '24px' }}>📊 Thống kê tổng quan</h2>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.totalUsers || 0}</div>
                <div className="stat-label">👥 Tổng tài khoản</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalJobs || 0}</div>
                <div className="stat-label">📋 Tổng bài đăng</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalApplications || 0}</div>
                <div className="stat-label">📨 Tổng lượt ứng tuyển</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.pendingBugs || 0}</div>
                <div className="stat-label">🐛 Lỗi hệ thống chờ xử lý</div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: ỨNG VIÊN */}
        {activeTab === 'candidates' && (
          <>
            <h2 style={{ marginBottom: '24px' }}>👨‍🎓 Quản lý tài khoản Ứng viên</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Trạng thái tài khoản</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.status === 1 ? 'badge-active' : 'badge-inactive'}`}>
                          {u.status === 1 ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleUserStatus(u.id, u.status, 'candidate')}
                        >
                          {u.status === 1 ? '🔒 Khóa' : '🔓 Mở'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 3: NHÀ TUYỂN DỤNG */}
        {activeTab === 'recruiters' && (
          <>
            <h2 style={{ marginBottom: '24px' }}>🏢 Quản lý tài khoản Nhà tuyển dụng</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Tên công ty</th>
                    <th>Mã số thuế</th>
                    <th>Xác minh DN</th>
                    <th>TK</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {recruiters.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><strong>{u.companyName || '-'}</strong></td>
                      <td>
                        <code style={{ background: '#f4f4f5', padding: '2px 6px', borderRadius: '4px' }}>
                          {u.taxCode || '-'}
                        </code>
                      </td>
                      <td>
                        {/* statusTrust từ bảng recruiters */}
                        <span className={`badge ${trustBadge(u.statusTrust)}`}>
                          {trustLabel(u.statusTrust)}
                        </span>
                      </td>
                      <td>
                        {/* status từ bảng users: 1=active, 0=locked */}
                        <span className={`badge ${u.status === 1 ? 'badge-active' : 'badge-inactive'}`}>
                          {u.status === 1 ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleUserStatus(u.id, u.status, 'recruiter')}
                        >
                          {u.status === 1 ? '🔒 Khóa' : '🔓 Mở'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 4: BÀI ĐĂNG */}
        {activeTab === 'jobs' && (
          <>
            <h2 style={{ marginBottom: '24px' }}>📋 Quản lý bài đăng</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Công ty</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id}>
                      <td>{j.id}</td>
                      <td>{j.title}</td>
                      <td>{j.companyName}</td>
                      <td>
                        <span className={`badge ${j.status === 1 ? 'badge-active' : 'badge-inactive'}`}>
                          {j.status === 1 ? 'Hiển thị' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleJobStatus(j.id, j.status === 1 ? 0 : 1)}
                        >
                          {j.status === 1 ? '👁️ Ẩn' : '👁️ Hiện'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 5: NHẬT KÝ LỖI */}
        {activeTab === 'bugs' && (
          <>
            <h2 style={{ marginBottom: '24px' }}>🐛 Nhật ký lỗi AI & hệ thống</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID Log</th>
                    <th>User ID</th>
                    <th>Mã lỗi</th>
                    <th>Chi tiết lỗi</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {errorLogs.map(log => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td><strong>{log.user ? log.user.id : 'N/A'}</strong></td>
                      <td>
                        <span className="badge" style={{ background: '#ffebee', color: '#c62828' }}>
                          {log.errorName}
                        </span>
                      </td>
                      <td style={{ maxWidth: '350px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {log.notes}
                      </td>
                      <td>
                        <span className={`badge ${log.status === 'resolved' ? 'badge-active' : 'badge-pending'}`}>
                          {log.status === 'resolved' ? 'Đã xử lý' : 'Đang chờ'}
                        </span>
                      </td>
                      <td>
                        {log.status === 'pending' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => updateLogStatus(log.id, 'resolved')}
                          >
                            ✔️ Xác nhận sửa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default AdminDashboard;