import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';

function PostJob() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    salary: '',
    location: '',
    jobType: 'full-time',
    experienceLevel: 'junior',
    jdText: '',
    requirements: '',
    benefits: ''
  });

  const token = localStorage.getItem('accessToken');
  const user = token ? decodeToken(token) : null;

  useEffect(() => {
    if (!user || user.role !== 'recruiter') {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error('Lỗi tải danh mục', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/jobs', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: '🎉 Đăng bài thành công!' });
        setTimeout(() => navigate('/my-posts'), 2000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: `❌ ${err.response?.data?.message || 'Lỗi đăng bài!'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">✨ Khởi tạo chiến dịch mới</h2>
          <p className="section-subtitle">Mô tả công việc hấp dẫn sẽ thu hút được nhiều ứng viên tài năng</p>
        </div>
      </div>
        
      {message.text && (
        <div className={`toast toast-${message.type}`} style={{ padding: '16px', borderRadius: '8px', marginBottom: '24px', background: message.type === 'success' ? '#e8f5e9' : '#ffebee', color: message.type === 'success' ? '#2e7d32' : '#c62828', fontWeight: '500' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="post-job-grid">
        <div className="post-job-full">
          <label className="form-label">Tiêu đề công việc <span style={{ color: 'red' }}>*</span></label>
          <input className="form-input-premium" name="title" value={formData.title} onChange={handleChange} required placeholder="VD: Senior ReactJS Developer, Chuyên viên Marketing..." />
        </div>

        <div>
          <label className="form-label">Danh mục <span style={{ color: 'red' }}>*</span></label>
          <select className="form-input-premium" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
            <option value="">-- Lĩnh vực chuyên môn --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Mức lương</label>
          <input className="form-input-premium" name="salary" value={formData.salary} onChange={handleChange} placeholder="VD: 15 - 20 Triệu / Thỏa thuận" />
        </div>

        <div>
          <label className="form-label">Kinh nghiệm</label>
          <select className="form-input-premium" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
            <option value="fresher">Fresher / Thực tập sinh</option>
            <option value="junior">Junior (1-3 năm)</option>
            <option value="mid">Mid-level (3-5 năm)</option>
            <option value="senior">Senior (Trên 5 năm)</option>
          </select>
        </div>

        <div>
          <label className="form-label">Hình thức làm việc</label>
          <select className="form-input-premium" name="jobType" value={formData.jobType} onChange={handleChange}>
            <option value="full-time">Toàn thời gian (Full-time)</option>
            <option value="part-time">Bán thời gian (Part-time)</option>
            <option value="remote">Làm việc từ xa (Remote)</option>
            <option value="internship">Thực tập (Internship)</option>
          </select>
        </div>

        <div className="post-job-full">
          <label className="form-label">Địa điểm làm việc</label>
          <input className="form-input-premium" name="location" value={formData.location} onChange={handleChange} placeholder="Địa chỉ cụ thể văn phòng..." />
        </div>

        <div className="post-job-full">
          <label className="form-label">Mô tả công việc (JD) <span style={{ color: 'red' }}>*</span></label>
          <textarea className="form-input-premium" name="jdText" value={formData.jdText} onChange={handleChange} required placeholder="- Thiết kế và phát triển các tính năng...&#10;- Phối hợp cùng team Product..."></textarea>
        </div>

        <div className="post-job-full">
          <label className="form-label">Yêu cầu ứng viên</label>
          <textarea className="form-input-premium" style={{ minHeight: '120px' }} name="requirements" value={formData.requirements} onChange={handleChange} placeholder="- Có ít nhất 2 năm kinh nghiệm...&#10;- Thành thạo các ngôn ngữ..."></textarea>
        </div>

        <div className="post-job-full">
          <label className="form-label">Quyền lợi được hưởng</label>
          <textarea className="form-input-premium" style={{ minHeight: '120px' }} name="benefits" value={formData.benefits} onChange={handleChange} placeholder="- Mức lương cạnh tranh, review lương 2 lần/năm...&#10;- Bảo hiểm sức khỏe cao cấp..."></textarea>
        </div>

        <div className="post-job-full" style={{ marginTop: '10px' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '8px', fontWeight: '600' }} disabled={loading}>
            {loading ? '⏳ ĐANG XỬ LÝ...' : '🚀 XUẤT BẢN CHIẾN DỊCH NÀY'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostJob;
