import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{ backgroundColor: '#121212', color: '#a6a6a6', padding: '60px 0 30px', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', borderBottom: '1px solid #333', paddingBottom: '40px', marginBottom: '30px' }}>

          <div>
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '15px' }}>
              <span style={{ color: '#ed1b2f' }}>Job</span>Platform
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              Nền tảng tuyển dụng thông minh tích hợp AI, kết nối ứng viên và nhà tuyển dụng một cách nhanh chóng và hiệu quả.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '20px' }}>Ứng viên</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/jobs" style={{ color: '#a6a6a6' }}>Tìm việc làm</Link></li>
              <li><Link to="/cv" style={{ color: '#a6a6a6' }}>Quản lý CV</Link></li>
              <li><Link to="/profile" style={{ color: '#a6a6a6' }}>Hồ sơ cá nhân</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '20px' }}>Nhà tuyển dụng</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/post-job" style={{ color: '#a6a6a6' }}>Đăng tin tuyển dụng</Link></li>
              <li><Link to="/my-posts" style={{ color: '#a6a6a6' }}>Quản lý bài đăng</Link></li>
              <li><Link to="#" style={{ color: '#a6a6a6' }}>Hồ sơ công ty</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '20px' }}>Hỗ trợ</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/bug-report" style={{ color: '#a6a6a6' }}>Báo cáo lỗi</Link></li>
              <li><Link to="#" style={{ color: '#a6a6a6' }}>Điều khoản sử dụng</Link></li>
              <li><Link to="#" style={{ color: '#a6a6a6' }}>Chính sách bảo mật</Link></li>
            </ul>
          </div>

        </div>

        <div className="text-center" style={{ fontSize: '13px' }}>
          &copy; {new Date().getFullYear()} JobPlatform - Luận văn tốt nghiệp STU. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
