import { useState } from 'react';
import axios from 'axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8090/api/v1/auth/register', {
        name, email, password, role
      });
      setMessage(response.data);
    } catch (error) {
      setMessage('Lỗi kết nối tới Backend rồi mày ơi!');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h2>TRANG ĐĂNG KÝ TÀI KHOẢN</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
        <input type="text" placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="candidate">Người tìm việc (Candidate)</option>
          <option value="recruiter">Nhà tuyển dụng (Recruiter)</option>
        </select>

        <button type="submit" style={{ cursor: 'pointer', padding: '8px' }}>Đăng ký ngay</button>
      </form>
      {message && <p style={{ marginTop: '20px', color: 'blue', fontWeight: 'bold' }}>Kết quả: {message}</p>}
    </div>
  );
}

export default Register;