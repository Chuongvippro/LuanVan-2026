import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../service/api';
import JobCard from '../../components/JobCard';

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [page, keyword, categoryId, location, jobType]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.code === 200) setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchJobs();
  };

  const clearFilters = () => {
    setKeyword('');
    setCategoryId('');
    setLocation('');
    setJobType('');
    setPage(0);
  };

  return (
    <div className="container" style={{ padding: '40px 15px' }}>
      <div className="d-flex" style={{ gap: '30px', alignItems: 'flex-start' }}>
        
        {/* SIDEBAR BỘ LỌC */}
        <aside className="card" style={{ width: '300px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #e5e5e5', paddingBottom: '10px' }}>
            🔍 Bộ lọc nâng cao
          </h3>

          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label>Từ khóa</label>
              <input
                type="text"
                className="form-control"
                placeholder="Vị trí, kỹ năng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Danh mục</label>
              <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Địa điểm</label>
              <select className="form-control" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="TP.HCM">TP.HCM</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label>Hình thức</label>
              <select className="form-control" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="remote">Remote</option>
                <option value="internship">Thực tập</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginBottom: '10px' }}>
              Tìm kiếm
            </button>
            <button type="button" className="btn btn-outline btn-block" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </form>
        </aside>

        {/* DANH SÁCH VIỆC LÀM */}
        <main style={{ flex: 1 }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>Danh sách việc làm</h2>
            <p className="text-muted">
              {jobs.length > 0 ? `Tìm thấy ${jobs.length} việc làm phù hợp` : 'Không tìm thấy kết quả phù hợp'}
            </p>
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>Đang tải dữ liệu...</div>
          ) : (
            <>
              <div>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-4" style={{ marginTop: '30px' }}>
                  <button 
                    className="btn btn-outline" 
                    disabled={page === 0} 
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Trước
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button 
                      key={i} 
                      className={`btn ${page === i ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    className="btn btn-outline" 
                    disabled={page >= totalPages - 1} 
                    onClick={() => setPage(p => p + 1)}
                  >
                    Sau →
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
