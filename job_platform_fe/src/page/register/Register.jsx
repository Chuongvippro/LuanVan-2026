import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../service/api';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate',
    companyName: '',  // Thêm state lưu Tên công ty
    companyEmail: ''  // Giữ lại Email công ty
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Đóng gói payload gửi lên Spring Boot khớp với DTO
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyName: formData.role === 'recruiter' ? formData.companyName : '',
        companyEmail: formData.role === 'recruiter' ? formData.companyEmail : '',
        phone: '',
        address: '',
        taxCode: '',
        websiteUrl: ''
      };

      const res = await api.post('/auth/register', payload);
      if (res.status === 200 || res.status === 201) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: '#fff', justifyContent: 'center' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '1200px', padding: '40px 20px' }}>
        
        {/* CỘT TRÁI - FORM ĐĂNG KÝ */}
        <div style={{ flex: 1, maxWidth: '500px', paddingRight: '40px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px' }}>
            Đăng ký tài khoản <span style={{ color: 'var(--primary-color)' }}>JobPlatform</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', marginBottom: '30px' }}>
            Bằng việc đăng ký, bạn đồng ý với các <a href="#" style={{ color: '#0d6efd', textDecoration: 'none' }}>Điều khoản dịch vụ</a> và <a href="#" style={{ color: '#0d6efd', textDecoration: 'none' }}>Chính sách quyền riêng tư</a> của JobPlatform.
          </p>

          <form onSubmit={handleRegister}>
            {error && <div className="text-danger mb-3" style={{ fontSize: '14px', fontWeight: '500' }}>{error}</div>}
            {success && <div style={{ color: '#00b14f', marginBottom: '15px', fontSize: '14px', fontWeight: '500' }}>{success}</div>}
            
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Họ và Tên <span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
                placeholder="VD: Nguyễn Văn A"
                style={{ padding: '12px 15px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Email tài khoản <span className="text-danger">*</span></label>
              <input 
                type="email" 
                className="form-control" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
                placeholder="Email dùng để đăng nhập"
                style={{ padding: '12px 15px' }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Mật khẩu <span className="text-danger">*</span></label>
              <input 
                type="password" 
                className="form-control" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
                placeholder="Mật khẩu"
                style={{ padding: '12px 15px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Xác nhận mật khẩu <span className="text-danger">*</span></label>
              <input 
                type="password" 
                className="form-control" 
                value={formData.confirmPassword} 
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                required 
                placeholder="Xác nhận mật khẩu"
                style={{ padding: '12px 15px' }}
              />
            </div>

            {/* CHỌN VAI TRÒ */}
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Bạn là: <span className="text-danger">*</span></label>
              <div className="d-flex gap-4" style={{ marginTop: '5px' }}>
                <label className="d-flex align-items-center gap-2" style={{ fontWeight: 'normal', cursor: 'pointer', fontSize: '15px' }}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="candidate" 
                    checked={formData.role === 'candidate'} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                  /> 
                  Ứng viên
                </label>
                <label className="d-flex align-items-center gap-2" style={{ fontWeight: 'normal', cursor: 'pointer', fontSize: '15px' }}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="recruiter" 
                    checked={formData.role === 'recruiter'} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                  /> 
                  Nhà tuyển dụng
                </label>
              </div>
            </div>

            {/* PHẦN HIỂN THỊ THÊM KHI CHỌN RECRUITER */}
            {formData.role === 'recruiter' && (
              <div style={{ padding: '10px 0', borderTop: '1px dashed #eee', marginBottom: '10px' }}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Tên công ty <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.companyName} 
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
                    required={formData.role === 'recruiter'} 
                    placeholder="VD: Thế Giới Di Động"
                    style={{ padding: '12px 15px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Email công ty <span className="text-danger">*</span></label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={formData.companyEmail} 
                    onChange={(e) => setFormData({...formData, companyEmail: e.target.value})} 
                    required={formData.role === 'recruiter'} 
                    placeholder="VD: hr@tgdd.com"
                    style={{ padding: '12px 15px' }}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700' }}>
              Đăng ký tài khoản
            </button>
          </form>

          <div className="text-center" style={{ marginTop: '25px', fontSize: '14px' }}>
            <span>Đã có tài khoản? </span>
            <Link to="/login" style={{ color: '#0d6efd', fontWeight: '600', textDecoration: 'none' }}>Đăng nhập ngay</Link>
          </div>
        </div>

        {/* CỘT PHẢI - THÔNG TIN */}
        <div style={{ flex: 1, paddingLeft: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="d-none d-lg-flex">
          <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.4', marginBottom: '30px', color: '#121212' }}>
            Đăng nhập để truy cập ngay vào hàng ngàn đánh giá và dữ liệu lương thị trường IT
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Xem trước mức lương để có thể lợi thế khi thoả thuận lương',
              'Tìm hiểu về phúc lợi, con người, văn hóa công ty qua các đánh giá chân thật',
              'Dễ dàng ứng tuyển chỉ với một thao tác',
              'Quản lý hồ sơ và quyền riêng tư của bạn'
            ].map((text, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px' }}>
                <span style={{ color: '#00b14f', fontSize: '18px', marginTop: '-2px' }}>✓</span>
                <span style={{ fontSize: '16px', color: '#121212', lineHeight: '1.5' }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </div>
  );
}

export default Register;