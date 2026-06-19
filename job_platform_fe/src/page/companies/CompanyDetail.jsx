import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../service/api';

function CompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyDetail();
  }, [id]);

  const fetchCompanyDetail = async () => {
    try {
      const res = await api.get(`/companies/${id}`);
      if (res.data.success) {
        setCompany(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết công ty:', err);
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

  if (loading) return <div className="text-center" style={{ padding: '50px' }}>Đang tải thông tin công ty...</div>;
  if (!company) return <div className="text-center" style={{ padding: '50px' }}>Công ty không tồn tại!</div>;

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 70px)', paddingBottom: '40px' }}>
      {/* Banner & Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '40px 0' }}>
        <div className="container d-flex align-items-center gap-4">
          <div style={{ width: '140px', height: '140px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: company.logo ? '10px' : '0' }}>
            {company.logo ? (
              <img src={getLogoUrl(company.logo)} alt={company.companyName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <span className="text-muted" style={{ fontSize: '36px', fontWeight: '700', color: '#ed1b2f' }}>
                {company.companyName ? company.companyName.charAt(0).toUpperCase() : '?'}
              </span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '10px' }}>{company.companyName}</h1>
            <div style={{ display: 'flex', gap: '20px', color: '#666', fontSize: '15px' }}>
              {company.websiteUrl && (
                <span className="d-flex align-items-center gap-2">
                  <span>🌐</span> <a href={company.websiteUrl} target="_blank" rel="noreferrer" style={{ color: '#0d6efd', textDecoration: 'none' }}>{company.websiteUrl}</a>
                </span>
              )}
              {company.companyEmail && (
                <span className="d-flex align-items-center gap-2">
                  <span>✉️</span> {company.companyEmail}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          <div className="col-lg-8">
            <div className="card" style={{ padding: '30px', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                Giới thiệu công ty
              </h2>
              <div style={{ lineHeight: '1.6', color: '#333' }}>
                <p><strong>Tên công ty:</strong> {company.companyName}</p>
                <p><strong>Mã số thuế:</strong> {company.taxCode || 'Đang cập nhật'}</p>
                <p><strong>Email liên hệ:</strong> {company.companyEmail || 'Đang cập nhật'}</p>
                <p><strong>Website:</strong> {company.websiteUrl ? <a href={company.websiteUrl} target="_blank" rel="noreferrer">{company.websiteUrl}</a> : 'Đang cập nhật'}</p>
                
                <h4 style={{ marginTop: '25px', fontSize: '16px', fontWeight: '600' }}>Về chúng tôi:</h4>
                <p>
                  Hiện tại công ty chưa cập nhật bài viết giới thiệu chi tiết. Bạn có thể truy cập website của công ty hoặc liên hệ qua email để biết thêm thông tin chi tiết về văn hóa, môi trường làm việc cũng như các dự án đang phát triển.
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card" style={{ padding: '25px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#f9fcff' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: 'var(--primary-color)' }}>
                Trạng thái xác thực
              </h3>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: '24px' }}>🛡️</span>
                <span style={{ fontWeight: '600', color: company.statusTrust?.includes('name') || company.statusTrust?.includes('tax') ? '#00b14f' : '#666' }}>
                  {company.statusTrust?.includes('name') || company.statusTrust?.includes('tax') ? 'Đã xác thực' : 'Chưa xác thực đầy đủ'}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: 0 }}>
                Điểm tín nhiệm: <strong>{company.point || 60} / 100</strong>
              </p>
            </div>
            
            <Link to="/jobs" className="btn btn-outline" style={{ display: 'block', width: '100%', marginTop: '20px', padding: '12px', fontWeight: '600' }}>
              Tìm việc làm khác
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetail;
