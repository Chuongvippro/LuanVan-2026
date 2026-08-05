import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="premium-footer">
      <div className="container">
        
        <div className="footer-grid">
          
          <div className="footer-brand">
            <h3><span>Job</span>Platform</h3>
            <p className="footer-brand-desc">
              Hệ sinh thái tuyển dụng thông minh hàng đầu. Quy tụ hàng ngàn việc làm IT chất lượng cao và kết nối nhân tài với các nhà tuyển dụng uy tín nhất.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-icon">F</a>
              <a href="#" className="footer-social-icon">L</a>
              <a href="#" className="footer-social-icon">X</a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Ứng Viên</h4>
            <ul className="footer-links">
              <li><Link to="/jobs">Tìm việc làm IT</Link></li>
              <li><Link to="/companies">Công ty hàng đầu</Link></li>
              <li><Link to="/cv">Tạo CV chuyên nghiệp</Link></li>
              <li><Link to="/profile">Hồ sơ của tôi</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Nhà Tuyển Dụng</h4>
            <ul className="footer-links">
              <li><Link to="/post-job">Đăng tin tuyển dụng</Link></li>
              <li><Link to="/my-posts">Quản lý bài đăng</Link></li>
              <li><Link to="#">Tìm kiếm ứng viên</Link></li>
              <li><Link to="#">Bảng giá dịch vụ</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Hỗ trợ & Hợp tác</h4>
            <ul className="footer-links">
              <li><Link to="/bug-report">Báo cáo sự cố</Link></li>
              <li><Link to="#">Trung tâm trợ giúp</Link></li>
              <li><Link to="#">Điều khoản sử dụng</Link></li>
              <li><Link to="#">Chính sách bảo mật</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} JobPlatform. Hệ thống được phát triển cho Luận văn tốt nghiệp STU.</span>
          <span>Designed with ❤️ cho cộng đồng IT Việt Nam</span>
        </div>
        
      </div>
    </footer>
  );
}

export default Footer;
