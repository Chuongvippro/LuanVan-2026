import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../service/api';
import JobCard from '../../components/JobCard';
import './JobList.css';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [searchParams] = useSearchParams();

  // Filter states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [industryId, setIndustryId] = useState(searchParams.get('industryId') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [page, setPage] = useState(0);

  const fetchIndustries = async () => {
    try {
      const res = await api.get('/industries');
      if (res.data.success) setIndustries(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobTypes = async () => {
    try {
      const res = await api.get('/job-types');
      if (res.data.success) setJobTypes(res.data.data || []);
    } catch (err) {
      console.error(err);
    } 
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (industryId) params.append('industryId', industryId);
      if (categoryId) params.append('categoryId', categoryId);
      if (location) params.append('location', location);
      if (jobType) params.append('jobType', jobType);
      params.append('page', page);
      params.append('size', 12);

      const res = await api.get(`/jobs?${params.toString()}`);
      if (res.data.success) {
        setJobs(res.data.data?.content || []);
        setTotalPages(res.data.data?.totalPages || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchIndustries();
    fetchJobTypes();
  }, []);

  useEffect(() => {
    fetchJobs();
    // scrollToTop if page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, keyword, categoryId, industryId, location, jobType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchJobs();
  };

  const clearFilters = () => {
    setKeyword('');
    setCategoryId('');
    setIndustryId('');
    setLocation('');
    setJobType('');
    setPage(0);
  };

  return (
    <div className="job-list-page">
      <div className="job-list-container">
        
        {/* SIDEBAR BỘ LỌC */}
        <aside className="job-filter-sidebar">
          <h3><span style={{ fontSize: '20px' }}>⚡</span> Bộ lọc nâng cao</h3>

          <form onSubmit={handleSearch}>
            <div className="filter-group">
              <label>Từ khóa / Vai trò</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Vị trí, kỹ năng, công ty..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Ngành nghề chính</label>
              <select 
                className="filter-select" 
                value={industryId} 
                onChange={(e) => {
                  setIndustryId(e.target.value);
                  setCategoryId('');
                }}
              >
                <option value="">Tất cả ngành nghề</option>
                {industries.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Chuyên môn (Lĩnh vực nhỏ)</label>
              <select 
                className="filter-select" 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Tất cả chuyên môn</option>
                {industryId ? (
                  categories
                    .filter(cat => cat.industry && Number(cat.industry.id) === Number(industryId))
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="filter-group">
              <label>Địa điểm</label>
              <select className="filter-select" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Toàn quốc</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Khác">Khu vực khác</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Hình thức làm việc</label>
              <select className="filter-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="">Tất cả hình thức</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="filter-btn-submit">
              🔍 Tìm kiếm việc làm
            </button>
            <button type="button" className="filter-btn-clear" onClick={clearFilters}>
              Xóa thiết lập lọc
            </button>
          </form>
        </aside>

        {/* DANH SÁCH VIỆC LÀM */}
        <main className="job-list-main">
          <div className="job-list-header">
            <h2>Hàng ngàn việc làm IT chất lượng</h2>
            <p className="job-list-count">
              {jobs.length > 0 ? `Chúng tôi đã tìm thấy ${jobs.length} cơ hội tốt nhất dành cho bạn` : 'Không có việc làm phù hợp với tiêu chí của bạn.'}
            </p>
          </div>

          {loading ? (
            <div className="company-loading" style={{ marginTop: '20px' }}>
              Đang tải danh sách việc làm tốt nhất...
            </div>
          ) : (
            <>
              <div>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="job-pagination">
                  <button 
                    className="job-pagination-btn wide" 
                    disabled={page === 0} 
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Lùi
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => {
                    // Hiển thị max 5 trang cho gọn
                    if (i === 0 || i === totalPages - 1 || Math.abs(page - i) <= 1) {
                      return (
                        <button 
                          key={i} 
                          className={`job-pagination-btn ${page === i ? 'active' : ''}`}
                          onClick={() => setPage(i)}
                        >
                          {i + 1}
                        </button>
                      );
                    } else if (i === 1 && page > 2) {
                      return <span key={i} style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>...</span>;
                    } else if (i === totalPages - 2 && page < totalPages - 3) {
                      return <span key={i} style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>...</span>;
                    }
                    return null;
                  })}
                  
                  <button 
                    className="job-pagination-btn wide" 
                    disabled={page >= totalPages - 1} 
                    onClick={() => setPage(p => p + 1)}
                  >
                    Tiến →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default JobList;
