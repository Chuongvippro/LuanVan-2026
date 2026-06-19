import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../service/api';

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
    <div className="container" style={{ padding: '40px 15px' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>Danh sách các công ty IT hàng đầu</h1>
        <p className="text-muted" style={{ fontSize: '16px' }}>Khám phá văn hóa, môi trường làm việc và cơ hội nghề nghiệp tại các công ty</p>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}>Đang tải dữ liệu...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {companies.map(company => (
            <div key={company.id} className="card" style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '20px', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '100px', height: '100px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginBottom: '15px', padding: company.logo ? '8px' : '0' }}>
                {company.logo ? (
                  <img src={getLogoUrl(company.logo)} alt={company.companyName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span className="text-muted" style={{ fontSize: '24px', fontWeight: '700', color: '#ed1b2f' }}>
                    {company.companyName ? company.companyName.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', width: '100%' }}>
                <Link to={`/companies/${company.id}`} style={{ color: '#121212', textDecoration: 'none' }}>
                  {company.companyName}
                </Link>
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {company.websiteUrl ? <a href={company.websiteUrl} target="_blank" rel="noreferrer" style={{ color: '#0d6efd' }}>{company.websiteUrl}</a> : 'Chưa cập nhật website'}
              </p>
              
              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', width: '100%' }}>
                <Link to={`/companies/${company.id}`} className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '14px' }}>
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && companies.length === 0 && (
        <div className="text-center" style={{ padding: '40px', background: '#f9f9f9', borderRadius: '8px' }}>
          Chưa có công ty nào được xác thực trên hệ thống.
        </div>
      )}
    </div>
  );
}

export default CompanyList;
