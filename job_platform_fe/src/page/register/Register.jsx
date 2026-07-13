import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../service/api';
import './Register.css';

function Register() {
  // step: 'form' -> đang nhập thông tin đăng ký | 'otp' -> đang chờ nhập mã OTP tài khoản
  const [step, setStep] = useState('form');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate',
    companyName: '',  // Thêm state lưu Tên công ty
    companyEmail: ''  // Giữ lại Email công ty
  });

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ============ XÁC THỰC EMAIL CÔNG TY (chỉ dành cho recruiter) ============
  const [companyOtp, setCompanyOtp] = useState('');
  const [companyOtpSent, setCompanyOtpSent] = useState(false);
  const [companyOtpVerified, setCompanyOtpVerified] = useState(false);
  const [companyOtpLoading, setCompanyOtpLoading] = useState(false);
  const [companyOtpMessage, setCompanyOtpMessage] = useState('');

  const handleCompanyEmailChange = (value) => {
    setFormData({ ...formData, companyEmail: value });
    // Đổi email công ty thì reset lại trạng thái xác thực
    setCompanyOtpSent(false);
    setCompanyOtpVerified(false);
    setCompanyOtp('');
    setCompanyOtpMessage('');
  };

  const handleSendCompanyOtp = async () => {
    if (!formData.companyEmail) {
      setCompanyOtpMessage('Vui lòng nhập email công ty trước');
      return;
    }
    setCompanyOtpMessage('');
    try {
      setCompanyOtpLoading(true);
      const res = await api.post('/auth/company-email/send-otp', null, {
        params: { companyEmail: formData.companyEmail }
      });
      const message = typeof res.data === 'string' ? res.data : res.data?.message;
      setCompanyOtpMessage(message);
      setCompanyOtpSent(true);
    } catch (err) {
      setCompanyOtpMessage(err.response?.data?.message || err.response?.data || 'Không gửi được OTP');
    } finally {
      setCompanyOtpLoading(false);
    }
  };

  const handleVerifyCompanyOtp = async () => {
    if (!companyOtp || companyOtp.length < 6) {
      setCompanyOtpMessage('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    try {
      setCompanyOtpLoading(true);
      const res = await api.post('/auth/company-email/verify-otp', null, {
        params: { companyEmail: formData.companyEmail, otp: companyOtp }
      });
      const message = typeof res.data === 'string' ? res.data : res.data?.message;
      if (message?.includes('thành công')) {
        setCompanyOtpVerified(true);
        setCompanyOtpMessage(message);
      } else {
        setCompanyOtpMessage(message || 'Xác thực thất bại');
      }
    } catch (err) {
      setCompanyOtpMessage(err.response?.data?.message || err.response?.data || 'Xác thực thất bại');
    } finally {
      setCompanyOtpLoading(false);
    }
  };

  // ============ BƯỚC 1: GỬI FORM ĐĂNG KÝ -> BACKEND GỬI OTP TÀI KHOẢN ============
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.role === 'recruiter' && !companyOtpVerified) {
      setError('Vui lòng xác thực email công ty trước khi đăng ký');
      return;
    }

    try {
      setLoading(true);

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
      const message = typeof res.data === 'string' ? res.data : res.data?.message;

      if (res.status === 200 && message?.toLowerCase().includes('otp')) {
        setSuccess(message);
        setStep('otp'); // Chuyển sang bước nhập OTP, không redirect ngay
      } else {
        setError(message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ============ BƯỚC 2: XÁC THỰC OTP TÀI KHOẢN -> BACKEND MỚI THỰC SỰ TẠO USER ============
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length < 6) {
      setError('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/auth/verify-otp', null, {
        params: { email: formData.email, otp }
      });

      const message = typeof res.data === 'string' ? res.data : res.data?.message;

      if (res.status === 200 && message?.includes('thành công')) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(message || 'Xác thực OTP thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    try {
      setLoading(true);
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
      const message = typeof res.data === 'string' ? res.data : res.data?.message;
      setSuccess(message || 'Đã gửi lại mã OTP');
    } catch (err) {
      setError(err.response?.data?.message || 'Không gửi lại được OTP');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || (formData.role === 'recruiter' && !companyOtpVerified);

  return (
    <div className="register-page">
      <div className="register-wrapper">

        {/* CỘT TRÁI - FORM ĐĂNG KÝ */}
        <div className="register-left">
          <h1 className="register-heading">
            Đăng ký tài khoản <span className="brand">JobPlatform</span>
          </h1>
          <p className="register-terms">
            Bằng việc đăng ký, bạn đồng ý với các <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách quyền riêng tư</a> của JobPlatform.
          </p>

          {error && <div className="text-danger register-error">{error}</div>}
          {success && <div className="register-success">{success}</div>}

          {/* ================= BƯỚC 1: FORM ĐĂNG KÝ ================= */}
          {step === 'form' && (
            <form onSubmit={handleRegister}>
              <div className="register-field">
                <label>Họ và Tên <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>

              <div className="register-field">
                <label>Email tài khoản <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="Email dùng để đăng nhập"
                />
              </div>

              <div className="register-field">
                <label>Mật khẩu <span className="text-danger">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  placeholder="Mật khẩu"
                />
              </div>

              <div className="register-field">
                <label>Xác nhận mật khẩu <span className="text-danger">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  placeholder="Xác nhận mật khẩu"
                />
              </div>

              {/* CHỌN VAI TRÒ */}
              <div className="register-field last">
                <label>Bạn là: <span className="text-danger">*</span></label>
                <div className="d-flex gap-4 register-role-options">
                  <label className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="candidate"
                      checked={formData.role === 'candidate'}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    />
                    Ứng viên
                  </label>
                  <label className="d-flex align-items-center gap-2">
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
                <div className="register-company-section">
                  <div className="register-field">
                    <label>Tên công ty <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      required={formData.role === 'recruiter'}
                      placeholder="VD: Thế Giới Di Động"
                    />
                  </div>

                  <div className="register-field">
                    <label>Email công ty <span className="text-danger">*</span></label>
                    <div className="input-with-button">
                      <input
                        type="email"
                        className="form-control"
                        value={formData.companyEmail}
                        onChange={(e) => handleCompanyEmailChange(e.target.value)}
                        required={formData.role === 'recruiter'}
                        placeholder="VD: hr@tgdd.com"
                        disabled={companyOtpVerified}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary otp-action-btn"
                        onClick={handleSendCompanyOtp}
                        disabled={companyOtpLoading || companyOtpVerified || !formData.companyEmail}
                      >
                        {companyOtpVerified
                          ? '✓ Đã xác thực'
                          : companyOtpLoading && !companyOtpSent
                          ? 'Đang gửi...'
                          : companyOtpSent
                          ? 'Gửi lại'
                          : 'Lấy OTP'}
                      </button>
                    </div>

                    {/* Ô nhập OTP công ty, chỉ hiện sau khi bấm Lấy OTP và chưa xác thực xong */}
                    {companyOtpSent && !companyOtpVerified && (
                      <div className="input-with-button otp-row">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          className="form-control register-otp-input"
                          value={companyOtp}
                          onChange={(e) => setCompanyOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="Nhập mã OTP đã gửi tới email công ty"
                        />
                        <button
                          type="button"
                          className="btn btn-primary otp-action-btn"
                          onClick={handleVerifyCompanyOtp}
                          disabled={companyOtpLoading || companyOtp.length < 6}
                        >
                          {companyOtpLoading ? 'Đang xác thực...' : 'Xác thực'}
                        </button>
                      </div>
                    )}

                    {companyOtpVerified && (
                      <div className="otp-verified-badge">✓ Email công ty đã được xác thực</div>
                    )}
                    {!companyOtpVerified && companyOtpMessage && (
                      <div className="otp-hint-message">{companyOtpMessage}</div>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary register-submit-btn" disabled={isSubmitDisabled}>
                {loading ? 'Đang gửi mã OTP...' : 'Đăng ký tài khoản'}
              </button>
            </form>
          )}

          {/* ================= BƯỚC 2: NHẬP OTP TÀI KHOẢN ================= */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <p className="register-otp-hint">
                Nhập mã OTP đã được gửi tới <strong>{formData.email}</strong>
              </p>

              <div className="register-field">
                <label>Mã OTP <span className="text-danger">*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-control register-otp-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="Nhập 6 số"
                />
              </div>

              <button type="submit" className="btn btn-primary register-submit-btn with-margin" disabled={loading}>
                {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
              </button>

              <div className="register-otp-actions">
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Không nhận được mã? Gửi lại
                </button>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setStep('form')}
                >
                  ← Quay lại sửa thông tin
                </button>
              </div>
            </form>
          )}

          {step === 'form' && (
            <div className="text-center register-footer">
              <span>Đã có tài khoản? </span>
              <Link to="/login">Đăng nhập ngay</Link>
            </div>
          )}
        </div>

        {/* CỘT PHẢI - THÔNG TIN */}
        <div className="register-right d-none d-lg-flex">
          <h2 className="register-right-heading">
            Đăng nhập để truy cập ngay vào hàng ngàn đánh giá và dữ liệu lương thị trường IT
          </h2>
          <ul className="register-benefit-list">
            {[
              'Xem trước mức lương để có thể lợi thế khi thoả thuận lương',
              'Tìm hiểu về phúc lợi, con người, văn hóa công ty qua các đánh giá chân thật',
              'Dễ dàng ứng tuyển chỉ với một thao tác',
              'Quản lý hồ sơ và quyền riêng tư của bạn'
            ].map((text, idx) => (
              <li key={idx} className="register-benefit-item">
                <span className="register-benefit-check">✓</span>
                <span className="register-benefit-text">{text}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default Register;