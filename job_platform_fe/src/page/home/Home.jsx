import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';
import JobCard from '../../components/JobCard';

function Home() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [industries, setIndustries] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, totalCompanies: 0, totalApplications: 0 });
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  
  // State lưu danh sách Nhà tuyển dụng uy tín (Point = 100)
  const [trustedRecruiters, setTrustedRecruiters] = useState([]);
  
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

    const fetchIndustries = async () => {
      try {
        const res = await api.get('/industries');
        if (res.data.success) setIndustries(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch industries', err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await api.get('/jobs/stats');
        if (res.data.success) setStats(res.data.data || {});
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };

    // Gọi API lấy danh sách nhà tuyển dụng uy tín và chỉ lấy tối đa 3 item
    const fetchTrustedRecruiters = async () => {
      try {
        const res = await api.get('/auth/recruiters/trusted');
        if (res.data.success) {
          const list = res.data.data || [];
          setTrustedRecruiters(list.slice(0, 3)); // ◄ Chỉ lấy 3 nhà tuyển dụng
        }
      } catch (err) {
        console.error('Failed to fetch trusted recruiters', err);
      }
    };

    fetchJobs();
    fetchIndustries();
    fetchStats();
    fetchTrustedRecruiters();
  }, []);

  // Calculate top employers dynamically from jobs
  const topEmployers = useMemo(() => {
    const employerMap = {};
    featuredJobs.forEach(job => {
      if (job.recruiterId) {
        if (!employerMap[job.recruiterId]) {
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
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url('/images/hero_bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '80px 0 100px', /* Increased bottom padding for floating bar */
        position: 'relative'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ marginBottom: '40px', fontSize: '28px', fontWeight: '700', color: '#fff', textAlign: 'left' }}>
            {stats.totalJobs || 0} Việc Làm IT "Chất" Dành Cho {user ? user.name : 'Bạn'}
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
                border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 16px',
                borderRadius: '20px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Thanh chữ chạy (Marquee) */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: '10px 0', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '20px', marginRight: '16px', marginLeft: '16px' }}>📢</span>
            <div className="marquee-wrapper">
              <Link to="/jobs" className="marquee-content" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>
                <span style={{ marginRight: '50px' }}><span style={{ color: '#fff', fontWeight: 'bold' }}>CÔNG VIỆC INTERNSHIP</span> đã có mặt trên JobPlatform | Bắt đầu sự nghiệp IT ngay với các cơ hội thực tập</span>
                <span style={{ marginRight: '50px' }}><span style={{ color: '#fff', fontWeight: 'bold' }}>CÔNG VIỆC INTERNSHIP</span> đã có mặt trên JobPlatform | Bắt đầu sự nghiệp IT ngay với các cơ hội thực tập</span>
                <span style={{ marginRight: '50px' }}><span style={{ color: '#fff', fontWeight: 'bold' }}>CÔNG VIỆC INTERNSHIP</span> đã có mặt trên JobPlatform | Bắt đầu sự nghiệp IT ngay với các cơ hội thực tập</span>
                <span style={{ marginRight: '50px' }}><span style={{ color: '#fff', fontWeight: 'bold' }}>CÔNG VIỆC INTERNSHIP</span> đã có mặt trên JobPlatform | Bắt đầu sự nghiệp IT ngay với các cơ hội thực tập</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINKS SECTION (FLOATING) */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        marginTop: '-40px', /* Pulls the section up to overlap the hero */
        marginBottom: '40px'
      }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            padding: '24px 32px',
            border: '1px solid rgba(255, 255, 255, 0.5)'
          }}>
            {[
              { to: '/jobs', icon: '💼', label: 'Tìm việc thụ động', badge: { text: 'HOT', color: '#f59e0b', bg: '#fef3c7' } },
              { to: '/jobs', icon: '📄', label: 'Mẫu CV chuẩn IT' },
              { to: '/jobs', icon: '🏆', label: 'Story Hub', badge: { text: 'MỚI', color: '#10b981', bg: '#d1fae5' } },
              { to: '/companies', icon: '💬', label: 'Review công ty' },
              { to: '/jobs', icon: '📈', label: 'Báo cáo lương IT' },
            ].map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                style={{
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: '8px',
                  textDecoration: 'none', 
                  color: '#475569',
                  fontWeight: '600', 
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  flex: 1
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.color = '#ed1b2f'; 
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.color = '#475569'; 
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#f1f5f9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '4px',
                  transition: 'background 0.3s'
                }} className="icon-box">
                  {item.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.label}
                  {item.badge && (
                    <span style={{
                      backgroundColor: item.badge.bg, 
                      color: item.badge.color,
                      fontSize: '10px', 
                      padding: '2px 6px',
                      borderRadius: '8px', 
                      fontWeight: '800'
                    }}>
                      {item.badge.text}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={{ padding: '40px 0', backgroundColor: '#0f172a' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#f5f5f5' }}>{stats.totalJobs || 0}</div>
              <div style={{ color: '#b3b3b3', fontSize: '15px', marginTop: '8px' }}>Việc làm đang tuyển</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#f5f5f5' }}>{stats.totalCompanies || 0}</div>
              <div style={{ color: '#b3b3b3', fontSize: '15px', marginTop: '8px' }}>Nhà tuyển dụng</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#f5f5f5' }}>{stats.totalApplications || 0}</div>
              <div style={{ color: '#b3b3b3', fontSize: '15px', marginTop: '8px' }}>Lượt ứng tuyển</div>
            </div>
          </div>
        </div>
      </section>

      {/* DUYỆT THEO NGÀNH NGHỀ SECTION */}
      <section style={{ padding: '60px 0', backgroundColor: '#fff' }}>
        <div className="container">
          <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '40px', color: '#121212' }}>
            Duyệt việc làm theo ngành nghề
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: showAllIndustries
              ? 'repeat(auto-fit, minmax(220px, 1fr))'
              : 'repeat(5, 1fr)',
            gap: '16px'
          }}>
            {(showAllIndustries ? industries : industries.slice(0, 4)).map(ind => (
              <Link
                key={ind.id}
                to={`/jobs?industryId=${ind.id}`}
                style={{
                  display: 'block',
                  padding: '20px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#121212',
                  fontWeight: '500',
                  fontSize: '15px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  backgroundColor: '#fafafa'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f5f5f5'; e.currentTarget.style.backgroundColor = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.backgroundColor = '#fafafa'; }}
              >
                {ind.name}
              </Link>
            ))}

            {!showAllIndustries && industries.length > 4 && (
              <button
                onClick={() => setShowAllIndustries(true)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '20px',
                  border: '1px dashed #e5e5e5',
                  borderRadius: '8px',
                  color: '#121212',
                  fontWeight: '600',
                  fontSize: '15px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '20px' }}>➕</span>
                Xem thêm ({industries.length - 4})
              </button>
            )}
          </div>

          {showAllIndustries && (
            <div style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <button
                onClick={() => setShowAllIndustries(false)}
                style={{
                  padding: '10px 32px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '20px',
                  color: '#666',
                  fontWeight: '500',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; e.currentTarget.style.borderColor = '#b0b0b0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#d0d0d0'; }}
              >
                ▲ Thu gọn
              </button>
            </div>
          )}
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

      {/* TRUSTED EMPLOYERS SECTION (POINT === 100) */}
      <section style={{ padding: '60px 0', backgroundColor: '#fafafa', borderTop: '1px solid #e5e5e5' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', color: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ color: '#ffb400' }}></span> Nhà tuyển dụng uy tín
            </h2>
            <p style={{ color: '#666', fontSize: '15px', marginTop: '8px' }}>
              Các công ty đạt độ tin cậy tối đa đã được hệ thống xác minh 
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {trustedRecruiters.length > 0 ? (
              trustedRecruiters.map(emp => (
                <Link to={`/companies/${emp.id}`} key={emp.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="employer-card" style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.3s ease',
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    position: 'relative'
                  }}>
                    {/* Badge Điểm Uy Tín góc phải */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#fff8e6',
                      border: '1px solid #ffe082',
                      color: '#b78103',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>⭐</span> {emp.point}/100
                    </div>

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
                          <img src={emp.logo} alt={emp.companyName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '14px', color: '#888', textAlign: 'center', fontWeight: '500' }}>{emp.companyName}</span>
                        )}
                      </div>

                      {/* Company Name */}
                      <h3 style={{ textAlign: 'center', fontSize: '18px', marginTop: '24px', marginBottom: '8px', color: '#121212' }}>
                        {emp.companyName}
                      </h3>

                      {/* Verified Badge Subtitle */}
                      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '13px', color: '#00b14f', fontWeight: '600' }}>
                          ✓ Đã xác minh (Verified)
                        </span>
                      </div>

                      {/* Info / Email Tag */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '6px 16px',
                          backgroundColor: '#f2f2f2',
                          borderRadius: '20px',
                          fontSize: '13px',
                          color: '#4a4a4a'
                        }}>
                          MST: {emp.taxCode || 'Đã cập nhật'}
                        </span>
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
                      <span style={{ color: '#4a4a4a', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                        {emp.websiteUrl ? emp.websiteUrl.replace(/^https?:\/\//, '') : 'Chưa cập nhật web'}
                      </span>
                      <span style={{ color: '#121212', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                        Chi tiết &gt;
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', padding: '20px 0' }}>
                Chưa có nhà tuyển dụng nào đạt 100 điểm uy tín.
              </div>
            )}
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