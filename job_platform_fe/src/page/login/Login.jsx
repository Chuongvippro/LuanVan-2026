import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { decodeToken } from '../../service/api';
import api from '../../service/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('login'); // 'login' or 'forgotPassword'

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if(forgotCooldown<=0)return;
    const timer = setInterval(() => {
      setForgotCooldown((prev)=>(prev<=1?0:prev-1));
    },1000);
    return ()=>clearInterval(timer);
  }, [forgotCooldown]);
  const switchView = (mode) => {
    setViewMode(mode);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.accessToken) {
        const { accessToken, refreshToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        window.dispatchEvent(new Event('auth-changed'));
        
        const decoded = decodeToken(accessToken);
        const role = (decoded?.role || decoded?.roles || '').toUpperCase();
        if (role === 'ADMIN') navigate('/admin');
        else if (role === 'RECRUITER') navigate('/my-posts');
        else navigate('/');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if(!email) {
      setError('Vui lòng nhập email để nhận mã OTP.');
      return;
    }
    setError('');
    setSuccess('');
    try{
      setLoading(true);
      const res = await api.post('/auth/forgot-password', null, { params: { email } });
      const message = typeof res.data === 'string' ? res.data : res.data.message;

      if(message?.includes('Đã gửi mã OTP')|| message?.includes('gửi về gmail')) {
        setSuccess(message);
        setForgotCooldown(30);
        switchView('forgot_reset');
      }else{
        setError(message||"Không gửi được OTP");
      }
    }catch(err){
      setError(err.response?.data.message||err.response?.data||"Không gửi được!!!");
      console.log(err);
    }finally{
      setLoading(false);
    }
  };

  const handleResetPassword = async(e)=>{
    e.preventDefault();
    setError('');
    setSuccess('');

    if(!otp||otp.length<6){
      setError("Vui lòng nhập đủ 6 số OTP!!!");
      return;
    }

    const minLength = /^.{8,}$/;
    const hasUpper = /[A-Z]/;
    const hasLower = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if (!minLength.test(newPassword)) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (!hasUpper.test(newPassword)) {
      setError("Mật khẩu phải chứa ít nhất 1 chữ hoa.");
      return;
    }
    if (!hasLower.test(newPassword)) {
      setError("Mật khẩu phải chứa ít nhất 1 chữ thường.");
      return;
    }
    if (!hasNumber.test(newPassword)) {
      setError("Mật khẩu phải chứa ít nhất 1 chữ số.");
      return;
    }
    if (!hasSpecial.test(newPassword)) {
      setError("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.");
      return;
    }

    if(newPassword!= confirmNewPassword){
      setError("Mật khẩu nhập lại không đúng!!!");
      return;
    }

    try{
      setLoading(true);
      const res = await api.post('/auth/reset-password', null,{params:{email, otp, newPassword}});
      const message = typeof res.data ==='string'?res.data:res.data?.message;

      if(message?.includes('thành công')){
        setSuccess("Đổi mật khẩu thành công, vui lòng đăng nhập lại!!!");
        setTimeout(()=>{
          setPassword('');
          switchView('login');
        }, 2000);
      }else{
        setError(message||"Xác thực OTP thất bại!!!");
      }
    }catch(err){
      setError(err.response?.data?.message|| err.response?.data||"Đổi mật khẩu thất bại!!!");
    }finally{
      setLoading(false)
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: '#fff', justifyContent: 'center' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '1200px', padding: '40px 20px' }}>
        
        {/* CỘT TRÁI - FORM ĐIỀU KIỆN ẨN / HIỆN */}
        <div style={{ flex: 1, maxWidth: '500px', paddingRight: '40px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px' }}>
            {viewMode === 'login' && <>Chào mừng bạn đến với <span style={{ color: 'var(--primary-color)' }}>JobPlatform</span></>}
            {viewMode === 'forgot_email' && <>Quên mật khẩu?</>}
            {viewMode === 'forgot_reset' && <>Đặt lại mật khẩu mới</>}
          </h1>

          <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', marginBottom: '25px' }}>
            {viewMode === 'login' && 'Nhập email và mật khẩu của bạn để truy cập hệ thống.'}
            {viewMode === 'forgot_email' && 'Nhập Email tài khoản của bạn. Hệ thống sẽ gửi mã OTP xác thực về Gmail.'}
            {viewMode === 'forgot_reset' && <>Mã OTP đã gửi tới <strong>{email}</strong>. Vui lòng nhập OTP và mật khẩu mới.</>}
          </p>

          {/* HIỂN THỊ THÔNG BÁO LỖI HOẶC THÀNH CÔNG */}
          {error && <div className="text-danger mb-3" style={{ fontSize: '14px', fontWeight: '500' }}>{error}</div>}
          {success && <div className="text-success mb-3" style={{ fontSize: '14px', fontWeight: '500' }}>{success}</div>}

          {/* ================= FORM 1: MÀN HÌNH ĐĂNG NHẬP ================= */}
          {viewMode === 'login' && (
            <>
              <form onSubmit={handleLogin}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Email <span className="text-danger">*</span></label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="Email"
                    style={{ padding: '12px 15px' }}
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>Mật khẩu <span className="text-danger">*</span></label>
                    <button 
                      type="button" 
                      onClick={() => switchView('forgot_email')}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: '14px', color: '#0d6efd', cursor: 'pointer' }}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Mật khẩu"
                    style={{ padding: '12px 15px' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700' }} disabled={loading}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập bằng Email'}
                </button>
              </form>

              <div className="text-center" style={{ marginTop: '25px', fontSize: '14px' }}>
                <span>Bạn chưa có tài khoản? </span>
                <Link to="/register" style={{ color: '#0d6efd', fontWeight: '600', textDecoration: 'none' }}>Đăng ký ngay</Link>
              </div>
            </>
          )}

          {/* ================= FORM 2: QUÊN MẬT KHẨU - BƯỚC 1 (NHẬP EMAIL) ================= */}
          {viewMode === 'forgot_email' && (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Email tài khoản <span className="text-danger">*</span></label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Nhập email tài khoản của bạn"
                  style={{ padding: '12px 15px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700', marginBottom: '15px' }} disabled={loading}>
                {loading ? 'Đang gửi mã OTP...' : 'Gửi mã OTP về Gmail'}
              </button>

              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => switchView('login')}
                  style={{ background: 'none', border: 'none', color: '#6c757d', fontSize: '14px', cursor: 'pointer' }}
                >
                  ← Quay lại Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* ================= FORM 3: QUÊN MẬT KHẨU - BƯỚC 2 (NHẬP OTP & PASS MỚI) ================= */}
          {viewMode === 'forgot_reset' && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Mã OTP (6 số) <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  maxLength={6}
                  className="form-control" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                  required 
                  placeholder="Nhập 6 số OTP"
                  style={{ padding: '12px 15px', letterSpacing: '2px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Mật khẩu mới <span className="text-danger">*</span></label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  placeholder="Nhập mật khẩu mới"
                  style={{ padding: '12px 15px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Xác nhận mật khẩu mới <span className="text-danger">*</span></label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={confirmNewPassword} 
                  onChange={(e) => setConfirmNewPassword(e.target.value)} 
                  required 
                  placeholder="Xác nhận mật khẩu mới"
                  style={{ padding: '12px 15px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700', marginBottom: '15px' }} disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  disabled={loading || forgotCooldown > 0}
                  style={{ background: 'none', border: 'none', color: forgotCooldown > 0 ? '#999' : '#0d6efd', cursor: 'pointer' }}
                >
                  {forgotCooldown > 0 ? `Gửi lại OTP (${forgotCooldown}s)` : 'Không nhận được OTP? Gửi lại'}
                </button>

                <button 
                  type="button" 
                  onClick={() => switchView('login')}
                  style={{ background: 'none', border: 'none', color: '#6c757d', cursor: 'pointer' }}
                >
                  ← Hủy & Quay lại
                </button>
              </div>
            </form>
          )}
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

export default Login;