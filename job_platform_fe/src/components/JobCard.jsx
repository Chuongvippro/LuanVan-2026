import { Link } from 'react-router-dom';

function JobCard({ job }) {
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    if (logoPath.startsWith('/images/')) return logoPath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${logoPath}`;
  };

  // ITviec style Job Card
  return (
    <div className="card d-flex gap-3 mb-3" style={{ border: '1px solid #e5e5e5', transition: 'border 0.2s', padding: '20px' }}>
      <div style={{ width: '100px', height: '100px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '8px', padding: job.companyLogo ? '8px' : '0' }}>
        {job.companyLogo ? (
          <img src={getLogoUrl(job.companyLogo)} alt={job.companyName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <span className="text-muted" style={{ fontSize: '24px', fontWeight: '700', textAlign: 'center', color: '#ed1b2f' }}>
            {job.companyName ? job.companyName.charAt(0).toUpperCase() : '?'}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
          <Link to={`/jobs/${job.id}`} style={{ color: '#121212', textDecoration: 'none' }}>
            {job.title}
          </Link>
        </h3>
        <p style={{ margin: '0 0 10px 0', color: '#4a4a4a', fontSize: '15px' }}>{job.companyName}</p>
        
        <div className="d-flex align-items-center gap-4 mb-2">
          <span style={{ color: '#00b14f', fontWeight: '500', fontSize: '16px' }}>
             {job.salary || 'Thỏa thuận'}
          </span>
          <span className="text-muted" style={{ fontSize: '14px' }}>
            📍 {job.location || 'Chưa cập nhật'}
          </span>
          <span className="text-muted" style={{ fontSize: '14px' }}>
            💼 {job.jobType === 'full-time' ? 'Toàn thời gian' : job.jobType}
          </span>
        </div>

        <div className="d-flex gap-2 mt-3">
           <span style={{ border: '1px solid #e5e5e5', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', color: '#4a4a4a' }}>
             {job.experienceLevel === 'senior' ? 'Senior' : job.experienceLevel === 'mid' ? 'Mid-level' : 'Fresher/Junior'}
           </span>
           {job.categoryName && (
             <span style={{ border: '1px solid #e5e5e5', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', color: '#4a4a4a' }}>
               {job.categoryName}
             </span>
           )}
        </div>
      </div>
    </div>
  );
}

export default JobCard;
