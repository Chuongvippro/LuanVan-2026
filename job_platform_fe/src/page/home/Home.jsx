import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';
import JobCard from '../../components/JobCard';

function Home() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');
  let user = null;
  if (token) {
    try { user = decodeToken(token); } catch (e) { }
  }

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs/featured');
        if (res.data.success) {
          setFeaturedJobs(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      }
    };
    fetchJobs();
  }, []);

  // Calculate top employers dynamically from jobs, add mock skills to match UI
  const topEmployers = useMemo(() => {
    const employerMap = {};
    featuredJobs.forEach(job => {
      if (job.recruiterId) {
        if (!employerMap[job.recruiterId]) {
          // Gán mock skills để UI giống ITviec nhất có thể
          const mockSkills = job.recruiterId % 2 === 0
            ? ['Java', 'ReactJS', 'AWS', 'NodeJS']
            : ['Python', 'DevOps', 'Golang', 'C++'];

          employerMap[job.recruiterId] = {
            id: job.recruiterId,
            name: job.companyName,
            logo: job.companyLogo,
            jobCount: 0,
            skills: mockSkills,
            locations: ['TP Hồ Chí Minh', 'Hà Nội']
          };
        }
        employerMap[job.recruiterId].jobCount += 1;
      }
    });
    return Object.values(employerMap).sort((a, b) => b.jobCount - a.jobCount).slice(0, 3);
  }, [featuredJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      {/* HERO SECTION ITVIEC STYLE */}
      <section className="hero" style={{
        backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.7), rgba(18, 18, 18, 0.8)), url('/images/hero_bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '80px 0 60px',
        position: 'relative'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ marginBottom: '40px', fontSize: '28px', fontWeight: '700', color: '#fff', textAlign: 'left' }}>
            {featuredJobs.length > 0 ? featuredJobs.length * 100 + 32 : '832'} Việc Làm IT "Chất" Dành Cho {user ? user.name : 'Bạn'}
          </h1>

          <form className="hero-search-box" onSubmit={handleSearch} style={{ display: 'flex', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px', width: '100%', maxWidth: '100%', margin: '0 0 24px 0', padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 15px', borderRight: '1px solid #e5e5e5', backgroundColor: '#fff' }}>
              <span style={{ fontSize: '18px', color: '#a6a6a6' }}>📍</span>
              <select
                className="form-control"
                style={{ backgroundColor: 'transparent', cursor: 'pointer', border: 'none', padding: '15px 10px', width: '200px', outline: 'none', color: '#121212', fontWeight: '400', fontSize: '15px' }}
                value={location}
                onChange={e => setLocation(e.target.value)}
              >
                <option value="">Tất cả thành phố</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP.HCM">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>

            <input
              type="text"
              className="form-control"
              placeholder="Nhập từ khoá theo kỹ năng, chức vụ, công ty..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{ flex: 1, padding: '15px 20px', border: 'none', outline: 'none', fontSize: '15px' }}
            />

            <button type="submit" className="btn btn-primary" style={{ padding: '0 40px', fontSize: '16px', fontWeight: '600', borderRadius: '0', backgroundColor: '#ed1b2f', borderColor: '#ed1b2f' }}>
              🔍 Tìm Kiếm
            </button>
          </form>

          {/* Gợi ý từ khóa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <span style={{ color: '#fff', fontSize: '14px', marginRight: '5px' }}>Gợi ý cho bạn:</span>
            {['Java', 'ReactJS', '.NET', 'Tester', 'PHP', 'Business Analysis', 'NodeJS', 'Team Management'].map(tag => (
              <span key={tag} onClick={() => setKeyword(tag)} style={{
                border: '1px solid #4a4a4a', color: '#fff', padding: '6px 16px',
                borderRadius: '20px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: 'transparent'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#4a4a4a'; }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Thanh chữ chạy (Marquee) */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: '0 -15px', paddingLeft: '15px', paddingRight: '15px' }}>
            <span style={{ fontSize: '20px', marginRight: '16px' }}>📢</span>
            <div className="marquee-wrapper">
              <Link to="/jobs" className="marquee-content" style={{ color: '#b3b3b3', textDecoration: 'none', fontSize: '20px', fontWeight: '600', letterSpacing: '0.5px' }}>
                <span style={{ marginRight: '50px' }}><span style={{ color: '#fff', fontWeight: 'bold' }}>CÔNG VIỆC INTERNSHIP</span> đã có mặt trên JobPlatform | Bắt đầu sự nghiệp IT ngay với các cơ hội thực tập</span>
                <span style={{ marginRight: '50px' }}><span style={{ color: '#fff', fontWeight: 'bold' }}>CÔNG VIỆC INTERNSHIP</span> đã có mặt trên JobPlatform | Bắt đầu sự nghiệp IT ngay với các cơ hội thực tập</span>
                <span style={{ marginRight: '50px' }}><span style={{ color: '#fff', fontWeight: 'bold' }}>CÔNG VIỆC INTERNSHIP</span> đã có mặt trên JobPlatform | Bắt đầu sự nghiệp IT ngay với các cơ hội thực tập</span>
                <span style={{ marginRight: '50px' }}><span style={{ color: '#fff', fontWeight: 'bold' }}>CÔNG VIỆC INTERNSHIP</span> đã có mặt trên JobPlatform | Bắt đầu sự nghiệp IT ngay với các cơ hội thực tập</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINKS SECTION (ITVIEC STYLE) */}
      <section style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 0' }}>
            <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#121212', fontWeight: '500', fontSize: '15px', flex: 1, justifyContent: 'center', borderRight: '1px solid #f2f2f2' }}>
              <span style={{ fontSize: '20px' }}>💼</span> Tìm việc thụ động <span style={{ backgroundColor: '#ff9100', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>HOT</span>
            </Link>
            <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#121212', fontWeight: '500', fontSize: '15px', flex: 1, justifyContent: 'center', borderRight: '1px solid #f2f2f2' }}>
              <span style={{ fontSize: '20px' }}>📄</span> Mẫu CV chuẩn IT
            </Link>
            <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#121212', fontWeight: '500', fontSize: '15px', flex: 1, justifyContent: 'center', borderRight: '1px solid #f2f2f2' }}>
              <span style={{ fontSize: '20px' }}>🏆</span> Story Hub <span style={{ backgroundColor: '#00b14f', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>MỚI</span>
            </Link>
            <Link to="/companies" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#121212', fontWeight: '500', fontSize: '15px', flex: 1, justifyContent: 'center', borderRight: '1px solid #f2f2f2' }}>
              <span style={{ fontSize: '20px' }}>💬</span> Review công ty
            </Link>
            <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#121212', fontWeight: '500', fontSize: '15px', flex: 1, justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>📈</span> Báo cáo lương IT
            </Link>
          </div>
        </div>
      </section>

      {/* TOP EMPLOYERS SECTION */}
      <section style={{ padding: '60px 0', backgroundColor: '#fff' }}>
        <div className="container">
          <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '40px', color: '#121212' }}>Nhà tuyển dụng hàng đầu</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {topEmployers.map(emp => (
              <Link to={`/companies/${emp.id}`} key={emp.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="employer-card" style={{
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.3s ease',
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  <div style={{
                    padding: '30px 20px 20px',
                    background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
                    flex: 1
                  }}>
                    {/* Logo Box */}
                    <div style={{
                      width: '120px',
                      height: '120px',
                      margin: '0 auto',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px'
                    }}>
                      {emp.logo ? (
                        <img src={emp.logo} alt={emp.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '14px', color: '#888', textAlign: 'center', fontWeight: '500' }}>{emp.name}</span>
                      )}
                    </div>

                    {/* Company Name */}
                    <h3 style={{ textAlign: 'center', fontSize: '18px', marginTop: '24px', marginBottom: '16px', color: '#121212' }}>
                      {emp.name}
                    </h3>

                    {/* Skill Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                      {emp.skills.map((skill, idx) => (
                        <span key={idx} style={{
                          padding: '6px 16px',
                          backgroundColor: '#f2f2f2',
                          borderRadius: '20px',
                          fontSize: '13px',
                          color: '#4a4a4a'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Line */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderTop: '1px solid #e5e5e5',
                    backgroundColor: '#fafafa'
                  }}>
                    <span style={{ color: '#4a4a4a', fontSize: '14px' }}>
                      {emp.locations.join(' - ')}
                    </span>
                    <span style={{ color: '#121212', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#00b14f',
                        borderRadius: '50%',
                        display: 'inline-block',
                        marginRight: '8px'
                      }}></span>
                      {emp.jobCount} Việc làm &gt;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED JOBS SECTION */}
      <section style={{ padding: '60px 0', backgroundColor: '#f2f2f2' }}>
        <div className="container">
          <h2 style={{ fontSize: '28px', marginBottom: '30px', color: '#121212' }}>Việc làm IT nổi bật</h2>

          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {featuredJobs.length > 0 ? (
              featuredJobs.slice(0, 10).map(job => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <p>Không có việc làm nào nổi bật.</p>
            )}

            <div className="text-center" style={{ marginTop: '30px' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/jobs')}
                style={{ padding: '12px 40px', fontSize: '16px' }}
              >
                Xem tất cả việc làm IT
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
