import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../../service/api'; // ◄ CHỖ NÀY PHẢI LÀ ../../ NHA MÀY!
import './Login.css'; // Nếu mày có làm file CSS riêng cho trang Login thì import ở đây

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // Gọi API đăng nhập lên Backend
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        email,
        password
      });

      // Backend trả về cặp đôi hoàn cảnh: { accessToken: "...", refreshToken: "..." }
      const data = response.data;

      // Đăng nhập thành công là găm thẳng 2 cục này vào LocalStorage liền
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Giải mã token chu kỳ ngắn để lấy Role nhằm điều hướng trang cho đúng
      const user = decodeToken(data.accessToken);
      if (user && user.role === 'recruiter') {
        navigate('/recruiter-dashboard'); // Nhà tuyển dụng qua trang dashboard quản lý
      } else {
        navigate('/home'); // Ứng viên nhảy về trang chủ tìm việc
      }

    } catch (error) {
      // Bắt các lỗi 400, 401, 500 từ Backend khạc về để hiển thị lên UI
      if (error.response && error.response.data) {
        setMessage(`❌ ${error.response.data}`);
      } else {
        setMessage('❌ Lỗi kết nối server!');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">ĐĂNG NHẬP</h2>
        
        <form onSubmit={handleLogin} className="login-form">
          <input 
            type="email" 
            placeholder="Nhập Email tài khoản" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="login-input" 
          />
          <input 
            type="password" 
            placeholder="Nhập Mật khẩu" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="login-input" 
          />

          <button type="submit" className="login-submit-button">
            Đăng nhập ngay
          </button>
        </form>

        {/* Thông báo Alert khi dính lỗi */}
        {message && (
          <div className="login-alert alert-error">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;