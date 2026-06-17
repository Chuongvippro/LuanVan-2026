import { useState } from 'react';
import axios from 'axios';
import './Register.css'; // ◄ Import file CSS để áp dụng kiểu dáng cho trang đăng ký

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [message, setMessage] = useState('');

  // Các trường bổ sung cho Candidate
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Các trường bổ sung cho Recruiter
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    const payload = {
      name, email, password, role,
      ...(role === 'candidate' ? { phone, address } : { companyName, companyEmail })
    };

    try {
      const endpoint = `${import.meta.env.VITE_API_BASE_URL}/auth/register`; 
      const response = await axios.post(endpoint, payload);
      setMessage(`🎉 ${response.data}`);
    } catch (error) {
      setMessage('❌ Lỗi kết nối tới Backend!');
      console.error(error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">ĐĂNG KÝ TÀI KHOẢN</h2>
        
        {/* Nút Tab chuyển đổi quyền hạn */}
        <div className="tab-container">
          <button 
            type="button"
            onClick={() => setRole('candidate')}
            className={`tab-button ${role === 'candidate' ? 'active-candidate' : ''}`}
          >
            Ứng Viên
          </button>
          <button 
            type="button"
            onClick={() => setRole('recruiter')}
            className={`tab-button ${role === 'recruiter' ? 'active-recruiter' : ''}`}
          >
            Nhà Tuyển Dụng
          </button>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="section-title">Thông tin tài khoản chung</div>
          <input type="text" placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} required className="register-input" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="register-input" />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required className="register-input" />

          {/* FORM BỔ SUNG CHO CANDIDATE */}
          {role === 'candidate' && (
            <div className="dynamic-section">
              <div className="section-title candidate-color">Thông tin cá nhân ứng viên</div>
              <input type="text" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} className="register-input" />
              <input type="text" placeholder="Địa chỉ nhà" value={address} onChange={(e) => setAddress(e.target.value)} className="register-input" />
            </div>
          )}

          {/* FORM BỔ SUNG CHO RECRUITER */}
          {role === 'recruiter' && (
            <div className="dynamic-section">
              <div className="section-title recruiter-color">Thông tin doanh nghiệp</div>
              <input type="text" placeholder="Tên công ty" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="register-input" />
              <input type="email" placeholder="Email công ty (nếu có)" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="register-input" />
            </div>
          )}

          <button 
            type="submit" 
            className={`submit-button ${role === 'candidate' ? 'btn-candidate' : 'btn-recruiter'}`}
          >
            Đăng ký ngay
          </button>
        </form>

        {/* Khối thông báo Alert */}
        {message && (
          <div className={`register-alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;