import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [bugReports, setBugReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('accessToken');
  const user = token ? decodeToken(token) : null;

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'jobs') fetchJobs();
    else if (activeTab === 'bugs') fetchBugReports();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) setStats(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/admin/jobs?size=50');
      if (res.data.success) setJobs(res.data.data?.content || []);
    } catch (err) { console.error(err); }
  };

  const fetchBugReports = async () => {
    try {
      const res = await api.get('/admin/bug-reports');
      if (res.data.success) setBugReports(res.data.data);
    } catch (err) { console.error(err); }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: currentStatus === 1 ? 0 : 1 });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const toggleJobStatus = async (jobId, status) => {
    try {
      await api.put(`/admin/jobs/${jobId}/status`, { status });
      fetchJobs();
    } catch (err) { console.error(err); }
  };

  const updateBugStatus = async (bugId, status) => {
    try {
      await api.put(`/admin/bug-reports/${bugId}/status`, { status });
      fetchBugReports();
    } catch (err) { console.error(err); }
  };

  const menuItems = [
    { key: 'stats', icon: '📊', label: 'Thống kê tổng quan' },
    { key: 'users', icon: '👥', label: 'Quản lý tài khoản' },
    { key: 'jobs', icon: '📋', label: 'Quản lý bài đăng' },
    { key: 'bugs', icon: '🐛', label: 'Báo cáo lỗi' },
  ];

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

      {/* Content */}
      <main className="admin-content">
        {/* THỐNG KÊ */}
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
                <div className="stat-label">🐛 Báo cáo lỗi chờ xử lý</div>
              </div>
            </div>
          </>
        )}

        {/* QUẢN LÝ TÀI KHOẢN */}
        {activeTab === 'users' && (
          <>
            <h2 style={{ marginBottom: '24px' }}>👥 Quản lý tài khoản</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="badge badge-active">{u.role}</span></td>
                      <td>
                        <span className={`badge ${u.status === 1 ? 'badge-active' : 'badge-inactive'}`}>
                          {u.status === 1 ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleUserStatus(u.id, u.status)}>
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

        {/* QUẢN LÝ BÀI ĐĂNG */}
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
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleJobStatus(j.id, j.status === 1 ? 0 : 1)}>
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

        {/* BÁO CÁO LỖI */}
        {activeTab === 'bugs' && (
          <>
            <h2 style={{ marginBottom: '24px' }}>🐛 Báo cáo lỗi</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {bugReports.map(bug => (
                    <tr key={bug.id}>
                      <td>{bug.id}</td>
                      <td>{bug.title}</td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bug.description}</td>
                      <td>
                        <span className={`badge ${bug.status === 'resolved' ? 'badge-active' : 'badge-pending'}`}>
                          {bug.status === 'resolved' ? 'Đã xử lý' : bug.status === 'rejected' ? 'Từ chối' : 'Đang chờ'}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '4px' }}>
                        {bug.status === 'pending' && (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => updateBugStatus(bug.id, 'resolved')}>✅</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => updateBugStatus(bug.id, 'rejected')}>❌</button>
                          </>
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
