import { Link } from 'react-router-dom';

function JobCard({ job }) {
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    if (logoPath.startsWith('/images/')) return logoPath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${logoPath}`;
  };

  return (
    <div className="job-card">
      <div className="job-card-logo">
        {job.companyLogo ? (
          <img src={getLogoUrl(job.companyLogo)} alt={job.companyName} />
        ) : (
          <span className="job-card-logo-text">
            {job.companyName ? job.companyName.charAt(0).toUpperCase() : '?'}
          </span>
        )}
      </div>

      <div className="job-card-content">
        <h3 className="job-card-title">
          <Link to={`/jobs/${job.id}`}>
            {job.title}
          </Link>
        </h3>
        <p className="job-card-company">{job.companyName}</p>
        
        <div className="job-card-meta">
          <div className="job-card-salary">
            💰 {job.salary || 'Thỏa thuận'}
          </div>
          <div className="job-card-info">
            📍 {job.locationAddress || job.location || 'Chưa cập nhật'}
          </div>
          <div className="job-card-info">
            💼 {job.jobType === 'full-time' ? 'Toàn thời gian' : job.jobType}
          </div>
        </div>

        <div className="job-card-tags">
           <span className="job-card-tag">
             {job.experienceLevel === 'senior' ? 'Senior (Kinh nghiệm)' : job.experienceLevel === 'mid' ? 'Mid-level' : 'Fresher/Junior'}
           </span>
           {job.categoryName && (
             <span className="job-card-tag">
               🚀 {job.categoryName}
             </span>
           )}
        </div>
      </div>
    </div>
  );
}

export default JobCard;
