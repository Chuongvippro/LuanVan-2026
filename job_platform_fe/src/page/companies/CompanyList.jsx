import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../service/api';
import './CompanyList.css';

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      if (res.data.success) {
        setCompanies(res.data.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách công ty:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    if (logoPath.startsWith('/images/')) return logoPath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${logoPath}`;
  };

  return (
    <div className="company-list-page">
      {/* Hero Section */}
      <section className="company-hero">
        <div className="company-hero-content">
          <h1>Danh sách công ty IT hàng đầu</h1>
          <p>Khám phá văn hóa, môi trường làm việc và cơ hội nghề nghiệp tại các công ty công nghệ lớn nhất hiện nay.</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="company-container">
        {loading ? (
          <div className="company-loading">
            Đang tải dữ liệu các công ty...
          </div>
        ) : companies.length > 0 ? (
          <div className="company-grid">
            {companies.map(company => (
              <div key={company.id} className="company-card">
                <div className="company-card-header">
                  <div className="company-card-logo-wrapper">
                    {company.logo ? (
                      <img src={getLogoUrl(company.logo)} alt={company.companyName} />
                    ) : (
                      <span className="company-card-logo-placeholder">
                        {company.companyName ? company.companyName.charAt(0).toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="company-card-body">
                  <Link to={`/companies/${company.id}`} className="company-card-link">
                    <h3 className="company-card-title">{company.companyName}</h3>
                  </Link>
                  
                  <div className="company-card-website">
                    🔗 {company.websiteUrl ? (
                      <a href={company.websiteUrl} target="_blank" rel="noreferrer">
                        {company.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    ) : (
                      <span>Chưa cập nhật website</span>
                    )}
                  </div>

                  <div className="company-card-tags">
                    <span className="company-card-tag">IT Services</span>
                    <span className="company-card-tag">Verified ✅</span>
                  </div>

                  <div className="company-card-footer">
                    <Link to={`/companies/${company.id}`} className="company-btn">
                      Xem chi tiết công ty
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="company-empty">
            <div className="company-empty-icon">🏢</div>
            <h3>Chưa có công ty nào</h3>
            <p>Hệ thống chưa có công ty nào được đăng ký và xác duyệt.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyList;
