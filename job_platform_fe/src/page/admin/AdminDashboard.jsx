import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';
import './AdminDashboard.css';
import { checkToken } from '../../service/api';


    //modal sửa dữ liệu
  const configByType = {
    candidate: {
      fields: [
        { key: 'name',  label: 'Tên' },
        { key: 'email', label: 'Email' },
      ]
    },

    recruiter: {
      fields: [
        { key: 'name',             label: 'Tên' },
        { key: 'email',            label: 'Email' },
        { key: 'companyName',      label: 'Tên công ty' },
        { key: 'taxCode',          label: 'Mã số thuế' },
        { key: 'websiteUrl',       label: 'Website' },
        { key: 'website_pending',  label: 'Website chờ duyệt' },
      ],
      // các field ràng buộc nhau → hiển thị dạng checkbox + badge
      trustGroup: {
        label: 'Xác thực doanh nghiệp',
        fields: [
          { key: 'companyName', label: 'Tên công ty' },
          { key: 'taxCode',     label: 'Mã số thuế' },
          { key: 'websiteUrl',     label: 'Website' },
        ],
        // nhận form, trả về { status, label, badge }
        compute: (form) => {
          if (form.companyName && form.taxCode && form.websiteUrl)
            return { status: 'verified', label: '✅ Đã xác minh', badge: 'badge-active' };
          return { status: 'pending', label: '⏳ Đang chờ', badge: 'badge-pending' };
        }
      }
    },

    job: {
      fields: [
        { key: 'title',       label: 'Tiêu đề' },
        { key: 'companyName', label: 'Công ty' },
      ]
    },

    industries: {
      fields: [
        { key: 'name', label: 'Tên ngành' },
      ]
    },

    categories: {
      fields: [
        { key: 'name', label: 'Tên danh mục' },
        { key: 'industryId', label: 'ID Ngành' },
      ]
    },
  };

  function EditModal({ item, onClose, onSave }) {
    const [form, setForm] = useState({ ...item.data });

    // Track verified riêng, parse từ statusTrust gốc
    const [verifiedFields, setVerifiedFields] = useState(() => {
      const st = item.data.statusTrust || '';
      return {
        companyName: st.includes('name') || st.includes('verified'),
        taxCode:     st.includes('tax')  || st.includes('verified'),
        websiteUrl:  st.includes('website') || st.includes('verified'),
      };
    }); 

    const config = configByType[item.type] || { fields: [] };
    // Tính trust dựa trên verifiedFields, không dựa vào form data
    const allVerified = verifiedFields.companyName && verifiedFields.taxCode && verifiedFields.websiteUrl;
    const trust = {
      status: allVerified ? 'verified' : 'pending',
      label:  allVerified ? '✅ Đã xác minh' : '⏳ Đang chờ',
      badge:  allVerified ? 'badge-active'   : 'badge-pending',
    };

    // Map key trustGroup field → key verifiedFields
    const fieldToVerifyKey = { companyName: 'companyName', taxCode: 'taxCode', websiteUrl: 'websiteUrl' };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <h3>{item.data.id ? '✏️ Chỉnh sửa' : '➕ Thêm mới'}</h3>

          {/* Render fields thường */}
          {config.fields.map(f => (
            <div key={f.key} className="form-group">
              <label>{f.label}</label>
              <input
                value={form[f.key] || ''}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}

          {/* Render trustGroup nếu có */}
          {config.trustGroup && (
            <div className="form-group">
              <label>{config.trustGroup.label}</label>
              {config.trustGroup.fields.map(f => (
                <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  checked={!!verifiedFields[f.key]}
                  style={{ accentColor: '#16a34a', width: '16px', height: '16px' }}
                  onChange={e => {
                    const newVerifiedFields = { ...verifiedFields, [f.key]: e.target.checked };
                    setVerifiedFields(newVerifiedFields);
                  }}
                />{f.label}
                </label>
              ))}
              <span className={`badge ${trust.badge}`} style={{ marginTop: '10px', display: 'inline-block' }}>
                {trust.label}
              </span>
            </div>
          )}

          <div className="modal-actions">
            <button
              className="btn btn-primary"
              onClick={() => onSave(item.type, {
                ...form,
                // nếu có trustGroup thì gửi kèm status đã tính
                ...(config.trustGroup && { 
                  verifiedName:    verifiedFields.companyName,
                  verifiedTax:     verifiedFields.taxCode,
                  verifiedWebsite: verifiedFields.websiteUrl, 
                })
              })}
            >
              💾 Lưu
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          </div>
        </div>
      </div>
    );
  }
  
function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddIndustry, setShowAddIndustry] = useState(false);

  const [user] = useState(() => {
    const token = localStorage.getItem('accessToken');
    return token ? decodeToken(token) : null;
  });

  const [editingItem, setEditingItem] = useState(null); // { type, data }

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

  const fetchBugs = async () => {
    try {
      const res = await api.get('/admin/bugs');
      if (res.data?.success) setBugs(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách bug!');
    }
  };

  const fetchIndustries = async () => {
    try {
      const res = await api.get('/admin/industries');
      if (res.data?.success) setIndustries(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách ngành!');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data?.success) setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh mục nghề!');
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

  const updateBugStatus = async (id, status) => {
    try {
      await api.put(`/admin/bugs/${id}/status`, { status });
      fetchBugs();
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại!');
    }
  };

  // ===== HOOKS =====

  useEffect(() => {
    const init = async () => {
      const userData = await checkToken();
      if (!userData || userData.role?.toLowerCase() !== 'admin') {
        alert('⚠️ Bạn không có quyền truy cập trang này!');
        navigate('/');
      }
      await fetchStats();
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'candidates') fetchCandidates();
    else if (activeTab === 'recruiters') fetchRecruiters();
    else if (activeTab === 'jobs') fetchJobs();
    else if (activeTab === 'industries') fetchIndustries(); 
    else if (activeTab === 'categories') fetchCategories();
    else if (activeTab === 'bugs') fetchBugs();
  }, [activeTab]);

  const menuItems = [
    { key: 'stats',      icon: '📊', label: 'Thống kê tổng quan' },
    { key: 'candidates', icon: '👨‍🎓', label: 'Quản lý Ứng viên' },
    { key: 'recruiters', icon: '🏢', label: 'Quản lý Nhà tuyển dụng' },
    { key: 'jobs',       icon: '📋', label: 'Quản lý bài đăng' },
    { key: 'industries', icon: '🏭', label: 'Quản lý Ngành' },       
    { key: 'categories', icon: '💼', label: 'Quản lý Danh mục nghề' },
    { key: 'bugs',       icon: '🐛', label: 'Nhật ký lỗi hệ thống' },
  ];

  const handleSave = async (type, form) => {
    const isNew = !form.id;

    const baseEndpoints  = {
      candidate: `/admin/users/${form.id}`,
      recruiter: `/admin/users/${form.id}`,
      job: `/admin/jobs/${form.id}`,
      industries: isNew ? `/admin/industries`        : `/admin/industries/${form.id}`,
      categories: isNew ? `/admin/categories`        : `/admin/categories/${form.id}`,
    };
    try {
      if (isNew) {
      await api.post(baseEndpoints[type], form);
    } else {
      await api.put(baseEndpoints[type], form);
    }   
      setEditingItem(null);
      // refetch theo type
      if (type === 'candidate') fetchCandidates();
      else if (type === 'recruiter') fetchRecruiters();
      else if (type === 'job') fetchJobs();
      else if (type === 'industries') fetchIndustries();
      else if (type === 'categories') fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Lưu thất bại!');
    }
  };

  // Helper hiển thị statusTrust recruiter
  const trustLabel = (val) => {
    if (!val) return 'Chưa có';
    if (val === 'verified' || val.includes('verified')) return '✅ Đã xác minh';
    if (val === 'banned')   return '🚫 Bị cấm';
    return `⏳ ${val}`;
  };
  const trustBadge = (val) => {
    if (val === 'verified' || val.includes('verified')) return 'badge-active';
    if (val === 'banned')   return 'badge-inactive';
    return 'badge-pending';
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await api.delete(`/admin/${type}/${id}`);
      if (type === 'industries') fetchIndustries();
      else if (type === 'categories') fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Xóa thất bại!');
    }
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
                    <th>SĐT</th>
                    <th>Địa chỉ</th>
                    <th>Skills</th>
                    <th>CV</th>
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
                      <td>{u.phone || '-'}</td>
                      <td>{u.address || '-'}</td>
                      <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={u.skills}>
                        {u.skills || '-'}
                      </td>
                      <td>
                        {u.cvPath 
                          ? <a href={u.cvPath} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>📄 Xem CV</a>
                          : '-'}
                      </td>
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
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingItem({ type: 'candidate', data: u })}>
                          ✏️ Sửa
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
                    <th>Email công ty</th>
                    <th>Tên công ty</th>
                    <th>Mã số thuế</th>
                    <th>Website</th>
                    <th>Xác minh DN</th>
                    <th>Điểm xác thực</th>
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
                      <td>{u.companyEmail || '-'}</td>
                      <td><strong>{u.companyName || '-'}</strong></td>
                      <td>
                        <code style={{ background: '#f4f4f5', padding: '2px 6px', borderRadius: '4px' }}>
                          {u.taxCode || '-'}
                        </code>
                      </td>
                      <td>
                        {u.websiteUrl 
                          ? <a href={u.websiteUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                              🔗 {u.websiteUrl}
                            </a> 
                          : '-'}
                      </td>
                      <td>
                        {/* statusTrust từ bảng recruiters */}
                        <span className={`badge ${trustBadge(u.statusTrust)}`}>
                          {trustLabel(u.statusTrust)}
                        </span>
                      </td>
                      <td>{u.point || '-'}</td>
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
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingItem({ type: 'recruiter', data: u })}>
                          ✏️ Sửa
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
                    <th>Lương</th>
                    <th>Địa điểm</th>
                    <th>JD</th>
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
                      <td>{j.salary || '-'}</td>
                      <td>{j.location || '-'}</td>
                      <td
                        title={j.jdText}
                        style={{
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}>
                        {j.jdText || '-'}
                      </td>
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

        {/* TAB: NGÀNH */}
        {activeTab === 'industries' && (
          <>
            <h2 style={{ marginBottom: '24px' }}>🏭 Quản lý Ngành</h2>
            <button className="btn btn-primary" onClick={() => setEditingItem({ type: 'industries', data: {} })}>
              ➕ Thêm ngành
            </button>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên ngành</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {industries.map(i => (
                    <tr key={i.id}>
                      <td>{i.id}</td>
                      <td>{i.name}</td>
                      <td>
                        <span className={`badge ${i.status === 1 ? 'badge-active' : 'badge-inactive'}`}>
                          {i.status === 1 ? 'Hoạt động' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => setEditingItem({ type: 'industries', data: i })}>
                          ✏️ Sửa
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }}
                          onClick={() => handleDelete('industries', i.id)}>
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      {/* TAB: DANH MỤC NGHỀ */}
      {activeTab === 'categories' && (
        <>
          <h2 style={{ marginBottom: '24px' }}>💼 Quản lý Danh mục nghề</h2>
          <button className="btn btn-primary" onClick={() => setEditingItem({ type: 'categories', data: {} })}>
            ➕ Thêm danh mục
          </button>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên danh mục</th>
                  <th>Ngành</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.industry?.name || '-'}</td>
                    <td>
                      <span className={`badge ${c.status === 1 ? 'badge-active' : 'badge-inactive'}`}>
                        {c.status === 1 ? 'Hoạt động' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => setEditingItem({ type: 'categories', data: c })}>
                        ✏️ Sửa
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }}
                        onClick={() => handleDelete('categories', c.id)}>
                        🗑️ Xóa
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
          <h2 style={{ marginBottom: '24px' }}>🐛 Quản lý Bug</h2>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Mô tả</th>
                  <th>Người báo cáo</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {bugs.map(bug => (
                  <tr key={bug.id}>
                    <td>{bug.id}</td>
                    <td>{bug.title}</td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={bug.description}>
                      {bug.description}
                    </td>
                    <td><strong>{bug.user ? bug.user.id : 'N/A'}</strong></td>
                    <td>
                      <span className={`badge ${
                        bug.status === 'resolved' ? 'badge-active' : 
                        bug.status === 'rejected' ? 'badge-inactive' : 'badge-pending'
                      }`}>
                        {bug.status === 'resolved' ? 'Đã xử lý' : 
                        bug.status === 'rejected' ? 'Từ chối' : 'Đang chờ'}
                      </span>
                    </td>
                    <td>
                      {bug.status === 'pending' && (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => updateBugStatus(bug.id, 'resolved')}>
                            ✔️ Xử lý
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => updateBugStatus(bug.id, 'rejected')}>
                            ❌ Từ chối
                          </button>
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

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSave}
          configByType={configByType}  
        />
      )}
    </div>
  );


}

export default AdminDashboard;