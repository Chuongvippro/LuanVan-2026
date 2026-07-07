import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';

function JobMatchPanel({ onBack }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [jobs, setJobs] = useState(null); // null | [] | [JobPostResponse...]
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { alert('Chỉ hỗ trợ file PDF hoặc DOCX!'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File tối đa 5MB!'); return; }
    setUploadedFile(file);
    setJobs(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSearch = async () => {
    if (!uploadedFile) { alert('Vui lòng upload CV của bạn!'); return; }
    setLoading(true);
    setJobs(null);

    try {
      // Bước 1: AI trả về danh sách mã bài đăng
      const formData = new FormData();
      formData.append('cv', uploadedFile);
      const res = await api.post('/ai/find-matching-jobs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!res.data.success) { setJobs([]); return; }

      const codes = JSON.parse(res.data.data);
      if (!codes || codes.length === 0) { setJobs([]); return; }

      // Bước 2: Fetch chi tiết từng bài đăng theo job_code
      const jobDetails = await Promise.all(
        codes.map(async (code) => {
          try {
            const r = await api.get(`/jobs/by-code/${code}`);
            return r.data.success ? r.data.data : { jobCode: code, title: code, _codeOnly: true };
          } catch {
            // Fallback: hiển thị mã nếu chưa có endpoint by-code (cần restart backend)
            return { jobCode: code, title: code, _codeOnly: true };
          }
        })
      );

      setJobs(jobDetails.filter(Boolean));

    } catch (err) {
      console.error(err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (job) => {
    navigate(`/jobs/${job.id}`);
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666', padding: '0 4px', lineHeight: 1 }} title="Quay lại">
          ←
        </button>
        <div>
          <div style={{ fontWeight: '700', fontSize: '15px', color: '#222' }}>🔎 Tìm việc phù hợp</div>
          <div style={{ fontSize: '12px', color: '#888' }}>AI gợi ý việc làm dựa trên CV của bạn</div>
        </div>
      </div>

      {/* Upload CV */}
      <div>
        <label style={labelStyle}>Tải lên CV của bạn</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            ...dropzone,
            borderColor: dragOver ? '#ed1b2f' : uploadedFile ? '#22c55e' : '#d1d5db',
            background: dragOver ? '#fff5f5' : uploadedFile ? '#f0fdf4' : '#fafafa',
          }}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
          {uploadedFile ? (
            <>
              <span style={{ fontSize: '28px' }}>✅</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>{uploadedFile.name}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{(uploadedFile.size / 1024).toFixed(0)} KB</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setJobs(null); }}
                style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                Xóa và chọn lại
              </button>
            </>
          ) : (
            <>
              <span style={{ fontSize: '32px' }}>📂</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#444' }}>Kéo thả hoặc bấm để chọn file</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>PDF hoặc DOCX · Tối đa 5MB</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nút tìm */}
      <button
        onClick={handleSearch}
        disabled={loading || !uploadedFile}
        style={{
          padding: '13px', background: (loading || !uploadedFile) ? '#fca5a5' : '#ed1b2f',
          color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
          cursor: (loading || !uploadedFile) ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'background 0.2s',
        }}
      >
        {loading ? (
          <>
            <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'mi-spin 0.7s linear infinite', display: 'inline-block' }} />
            Đang phân tích CV...
          </>
        ) : '🔍 Tìm việc phù hợp'}
      </button>

      {/* Kết quả */}
      {jobs !== null && (
        jobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#444' }}>
              ✨ Tìm thấy <span style={{ color: '#ed1b2f' }}>{jobs.length}</span> bài đăng phù hợp với bạn:
            </div>
            {jobs.map((job) => (
              job._codeOnly ? (
                // Fallback: chưa có chi tiết (cần restart backend)
                <div
                  key={job.jobCode}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px', background: '#f0fdf4',
                    border: '1.5px solid #86efac', borderRadius: '12px',
                  }}
                >
                  <div>
                    <code style={{ fontWeight: '700', fontSize: '15px', letterSpacing: 1 }}>{job.jobCode}</code>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: 2 }}>Restart backend để xem chi tiết</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(job.jobCode)}
                    style={{ fontSize: '12px', padding: '6px 12px', background: '#ed1b2f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    📋 Copy mã
                  </button>
                </div>
              ) : (

              <div
                key={job.id}
                onClick={() => handleJobClick(job)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  padding: '14px', background: '#fff',
                  border: '1.5px solid #e5e5e5', borderRadius: '12px',
                  cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#ed1b2f';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(237,27,47,0.12)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Company row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.companyName}
                      style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', border: '1px solid #f0f0f0', background: '#fff' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      🏢
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: '#888', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.companyName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#bbb', fontFamily: 'monospace' }}>{job.jobCode}</div>
                  </div>
                  <span style={{ fontSize: '14px', color: '#ccc' }}>→</span>
                </div>

                {/* Job title */}
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#121212', lineHeight: 1.3 }}>
                  {job.title}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {job.salary && (
                    <span style={tagStyle('#fef3c7', '#92400e')}>💰 {job.salary}</span>
                  )}
                  {job.location && (
                    <span style={tagStyle('#eff6ff', '#1d4ed8')}>📍 {job.location}</span>
                  )}
                  {job.jobType && (
                    <span style={tagStyle('#f0fdf4', '#15803d')}>⏱ {job.jobType}</span>
                  )}
                </div>

                {/* CTA hint */}
                <div style={{ fontSize: '11px', color: '#ed1b2f', fontWeight: 600 }}>
                  Nhấn để xem chi tiết →
                </div>
              </div>
              )
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px 16px', textAlign: 'center', background: '#fafafa', borderRadius: '10px', color: '#888', fontSize: '13px', lineHeight: 1.6 }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤷</div>
            Hiện tại không có bài đăng phù hợp với CV của bạn.<br />
            Hãy cập nhật CV và thử lại!
          </div>
        )
      )}
    </div>
  );
}

const tagStyle = (bg, color) => ({
  fontSize: '11px', fontWeight: '600', padding: '3px 8px',
  borderRadius: '20px', background: bg, color,
  whiteSpace: 'nowrap',
});

const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: '700', color: '#555',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
};

const dropzone = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: '10px', padding: '28px 16px', border: '2px dashed', borderRadius: '10px',
  cursor: 'pointer', transition: 'all 0.2s',
};

export default JobMatchPanel;