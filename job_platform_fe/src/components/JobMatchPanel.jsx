import { useState, useRef } from 'react';
import api from '../service/api';

function JobMatchPanel({ onBack }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null); // null | [] | [codes...]
  const fileInputRef = useRef(null);
  const [copiedCode, setCopiedCode] = useState(null);


  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      alert('Chỉ hỗ trợ file PDF hoặc DOCX!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File tối đa 5MB!');
      return;
    }
    setUploadedFile(file);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSearch = async () => {
    if (!uploadedFile) {
      alert('Vui lòng upload CV của bạn!');
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('cv', uploadedFile);
      const res = await api.post('/ai/find-matching-jobs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        const codes = JSON.parse(res.data.data);
        setResult(codes);
      } else {
        setResult([]);
      }
    } catch (err) {
        console.error(err);
        setResult([]);
    } finally {
      setLoading(false);
    }
  };


  const handleCopy = async (code) => {
    try {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 1500);
    } catch (err) {
        console.error('Copy thất bại:', err);
    }
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
            borderColor: dragOver ? 'var(--primary-color, #6366f1)' : uploadedFile ? '#22c55e' : '#d1d5db',
            background: dragOver ? '#f5f3ff' : uploadedFile ? '#f0fdf4' : '#fafafa',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {uploadedFile ? (
            <>
              <span style={{ fontSize: '28px' }}>✅</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>{uploadedFile.name}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{(uploadedFile.size / 1024).toFixed(0)} KB</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setResult(null); }}
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
        disabled={loading}
        style={{
          padding: '13px', background: loading ? '#a5b4fc' : 'var(--primary-color, #6366f1)',
          color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
            Đang tìm kiếm...
          </>
        ) : (
          '🔍 Tìm việc phù hợp'
        )}
      </button>

      {/* Kết quả */}
      {result !== null && (
        result.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#444' }}>
              Tìm thấy {result.length} bài đăng phù hợp:
            </div>
            {result.map((code) => (
                <div key={code} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px',
                }}>
                    <code style={{ fontWeight: '700', fontSize: '14px' }}>{code}</code>
                    <button
                    onClick={() => handleCopy(code)}
                    style={{
                        fontSize: '12px', padding: '6px 12px',
                        background: copiedCode === code ? '#22c55e' : 'var(--primary-color, #6366f1)',
                        color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    >
                    {copiedCode === code ? '✓ Đã copy' : '📋 Copy mã'}
                    </button>
                </div>
                ))}
          </div>
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', background: '#fafafa', borderRadius: '10px', color: '#888', fontSize: '13px' }}>
            Hiện tại không có bài đăng phù hợp với yêu cầu CV của bạn, hãy thử lại ở các khung giờ khác.
          </div>
        )
      )}
    </div>
  );
}

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