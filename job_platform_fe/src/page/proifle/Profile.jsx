import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken, checkToken } from '../../service/api';
import './profile.css';

function EditableField({ label, value, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [prevValue, setPrevValue] = useState(value);


  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value || '');
  }

  const handleBlurOrEnter = () => {
    setIsEditing(false);
    if (inputValue !== value) onSave(inputValue);
  };

  return (
    <div className="profile-field-item" style={{ flex: 1, marginBottom: 0 }}>
      <span className="field-label">{label}:</span>
      {isEditing ? (
        <input
          type="text"
          className="field-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlurOrEnter}
          onKeyDown={(e) => e.key === 'Enter' && handleBlurOrEnter()}
          autoFocus
        />
      ) : (
        <div className={`field-value-display ${value ? '' : 'field-empty'}`} onClick={() => setIsEditing(true)}>
          {value || `(Bấm vào đây để bổ sung ${label.toLowerCase()})`}
        </div>
      )}
    </div>
  );
}


function ReadOnlyField({ label, value }) {
  return (
    <div className="profile-field-item readonly" style={{ flex: 1, marginBottom: 0 }}>
      <span className="field-label">{label}:</span>
      <div className={`field-value-display readonly-value ${value ? '' : 'field-empty'}`}>
        {value || '(Chưa có dữ liệu)'}
      </div>
    </div>
  );
}

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState({ type: '', msg: '' });
  const [aiLoadingField, setAiLoadingField] = useState('');
  const [showCvPreview, setShowCvPreview] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = await checkToken();
      if (!user) { navigate('/login'); return; }
      try {
        const res = await api.get(`/profile/${user.id}/${user.role}`);
        setProfileData(res.data);
        setLoading(false);
      } catch {
        setNotify({ type: 'error', msg: 'Lỗi tải hồ sơ!' });
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleUpdateField = async (fieldName, updatedValue) => {
    const updatedData = { ...profileData, [fieldName]: updatedValue };
    try {
      const user = await checkToken(); // Kiểm tra token trước khi gửi request
      if (!user) { navigate('/login'); return; }
      await api.put(`/profile/${user.id}/${profileData.role}`, updatedData);
      setNotify({ type: 'success', msg: 'Đã lưu thay đổi!' });
      setTimeout(() => setNotify({ type: '', msg: '' }), 2000);
      const reload = await api.get(`/profile/${user.id}/${profileData.role}`);
      setProfileData(reload.data);
    } catch {
      setNotify({ type: 'error', msg: 'Lỗi lưu dữ liệu!' });
    }
  };

  const [cvFile, setCvFile] = useState(null);
  const [uploadingCv, setUploadingCv] = useState(false);

  // --- Blob CV (Hướng B: lấy file qua axios kèm token, không gọi thẳng URL) ---
  const [cvBlobUrl, setCvBlobUrl] = useState('');
  const [cvBlobLoading, setCvBlobLoading] = useState(false);

  // Dọn dẹp object URL khi unmount để tránh rò rỉ bộ nhớ
  useEffect(() => {
    return () => {
      if (cvBlobUrl) URL.revokeObjectURL(cvBlobUrl);
    };
  }, [cvBlobUrl]);

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExt = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExt.includes(ext)) {
      setNotify({ type: 'error', msg: 'Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)!' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotify({ type: 'error', msg: 'File tối đa 5MB!' });
      return;
    }
    setCvFile(file);
  };

  const handleUploadCv = async () => {
    if (!cvFile) {
      setNotify({ type: 'error', msg: 'Chưa chọn file CV!' });
      return;
    }
    setUploadingCv(true);
    try {
      const user = await checkToken();
      if (!user) { navigate('/login'); return; }

      const formData = new FormData();
      formData.append('file', cvFile);

      const res = await api.post(`/profile/${user.id}/upload-cv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfileData(res.data);
      setNotify({ type: 'success', msg: 'Tải CV lên thành công!' });
      setCvFile(null);

      // CV vừa đổi thì blob cũ (nếu đang mở) không còn hợp lệ nữa
      if (cvBlobUrl) {
        URL.revokeObjectURL(cvBlobUrl);
        setCvBlobUrl('');
      }
    } catch (err) {
      setNotify({ type: 'error', msg: 'Lỗi tải CV lên!' });
      console.error(err);
    } finally {
      setUploadingCv(false);
    }
  };

  // Lấy CV dưới dạng blob qua axios (tự động đính token như các API khác)
  const fetchCvBlob = async () => {
    if (!profileData?.cvFileName) return null;
    const user = await checkToken();
    if (!user) { navigate('/login'); return null; }

    try {
      const res = await api.get(`/files/cv/${profileData.cvFileName}`, {
        responseType: 'blob',
      });
      return res.data;
    } catch (err) {
      setNotify({ type: 'error', msg: 'Không thể tải CV!' });
      console.error(err);
      return null;
    }
  };

  const openCvPreview = async () => {
    setCvBlobLoading(true);
    const blob = await fetchCvBlob();
    setCvBlobLoading(false);
    if (!blob) return;

    // Ép đúng mime type PDF để iframe render đúng, tránh browser đoán sai
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    if (cvBlobUrl) URL.revokeObjectURL(cvBlobUrl);
    const url = URL.createObjectURL(pdfBlob);
    setCvBlobUrl(url);
    setShowCvPreview(true);
  };

  const closeCvPreview = () => {
    if (cvBlobUrl) URL.revokeObjectURL(cvBlobUrl);
    setCvBlobUrl('');
    setShowCvPreview(false);
  };

  const downloadCvWord = async () => {
    setCvBlobLoading(true);
    const blob = await fetchCvBlob();
    setCvBlobLoading(false);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = profileData.cvFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };


  const handleVerifySingleField = async (fieldType, value) => {
    if (!value?.trim()) {
      alert("Điền dữ liệu vào ô trước khi quét!");
      return;
    }
    setAiLoadingField(fieldType);
    setNotify({ type: 'info', msg: 'Đang xác thực với AI...' });

    try {
      const user = await checkToken();
      if (!user) { navigate('/login'); return; }

      // Đồng bộ trước khi quét
      const updatedData = { ...profileData, [fieldType]: value };
      await api.put(`/profile/${user.id}/${profileData.role}`, updatedData);

      const response = await api.post(`/profile/verify-field/${user.id}`, {
        fieldType: fieldType,
        value: value
      });

      if (response.data && response.data.status === "SUCCESS") {
        const reload = await api.get(`/profile/${user.id}/${profileData.role}`);
        setProfileData(reload.data);
        setNotify({ type: 'success', msg: `✅duyệt thành công!` });
      } else {
        setNotify({ type: 'error', msg: `❌Từ chối: ${response.data.reason || 'Dữ liệu không khớp'}` });
      }
    } catch (err) {
      setNotify({ type: 'error', msg: 'Lỗi hệ thống!' });
      console.error(err);
    } finally {
      setAiLoadingField('');
    }
  };

  const renderStatusBadge = (status) => {
    if (!status || status === 'pending') return { class: 'status-default', text: 'Chưa xác thực trường nào (60đ)' };
    let parts = [];
    if (status.includes('name')) parts.push('Tên cty');
    if (status.includes('tax')) parts.push('Mã số thuế');
    if (status.includes('website')) parts.push('Website');
    if (parts.length === 3) return { class: 'status-approved', text: 'Đã xác thực toàn bộ AI (100đ)' };
    return { class: 'status-pending', text: `Xác thực một phần (Duyệt: ${parts.join(', ')})` };
  };

  if (loading) return <div className="profile-loading">Đang tải...</div>;
  if (!profileData) return null;

  const isRecruiter = profileData.role === 'recruiter';

  const badge = renderStatusBadge(profileData.status);
  const isNameVerified = profileData.status?.includes('name');
  const isTaxVerified = profileData.status?.includes('tax');
  const isWebVerified = profileData.status?.includes('website');

  // Điều kiện để kích hoạt nút
  const canVerifyTax = !!profileData.companyName;
  const canVerifyWeb = !!profileData.companyName && !!profileData.taxCode;

  // Cảnh báo điểm tin cậy thấp, chỉ hiển thị, không chặn thao tác
  const currentPoint = profileData.point ?? 80;
  const isLowTrust = isRecruiter && currentPoint <= 90;

  // Hiển thị CV: không còn dùng URL trực tiếp (cvUrl) vì route yêu cầu token,
  // giờ lấy file qua axios (fetchCvBlob) rồi tạo blob URL tạm để xem/tải.
  const cvExt = profileData.cvFileName
    ? profileData.cvFileName.substring(profileData.cvFileName.lastIndexOf('.')).toLowerCase()
    : '';
  const isCvPdf = cvExt === '.pdf';

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h2>{isRecruiter ? 'HỒ SƠ NHÀ TUYỂN DỤNG' : 'HỒ SƠ ỨNG VIÊN'}</h2>
        {isRecruiter && (
          <span className={`status-badge ${badge.class}`}>Trạng thái: {badge.text}</span>
        )}
      </div>

      {notify.msg && <div className={`notify-box nt-${notify.type}`}>{notify.msg}</div>}

      {isLowTrust && (
        <div className="trust-warning-banner">
          ⚠️ Điểm tin cậy hiện tại: <strong>{currentPoint}đ</strong> — Vui lòng cung cấp đầy đủ và xác thực thông tin doanh nghiệp (Tên công ty, Mã số thuế, Website) để tránh ảnh hưởng đến việc đăng tin tuyển dụng.
        </div>
      )}

      <div className="profile-body" style={{ paddingTop: (notify.msg || isLowTrust) ? 0 : 25 }}>
        <div className="account-info-grid">
          <ReadOnlyField label="Tên tài khoản" value={profileData.name} />
          <ReadOnlyField label="Email đăng ký" value={profileData.email} />
          <ReadOnlyField label="Vai trò" value={profileData.role === "candidate" ? "Ứng viên" : "Nhà tuyển dụng"} />
          {isRecruiter && <ReadOnlyField label="Email công ty" value={profileData.companyEmail} />}
        </div>

        {isRecruiter ? (
          <>
            <div className="verify-row-layout" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '20px' }}>
              <EditableField label="Tên công ty" value={profileData.companyName} onSave={(val) => handleUpdateField('companyName', val)} />
              <button className="mini-verify-btn" onClick={() => handleVerifySingleField('companyName', profileData.companyName)} disabled={!!aiLoadingField}>
                {aiLoadingField === 'companyName' ? '⏳...' : (isNameVerified ? '✅ Đã duyệt' : '✓ Duyệt Tên')}
              </button>
            </div>

            <div className="verify-row-layout" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '20px' }}>
              <EditableField label="Mã số thuế" value={profileData.taxCode} onSave={(val) => handleUpdateField('taxCode', val)} />
              <button className="mini-verify-btn" onClick={() => handleVerifySingleField('taxCode', profileData.taxCode)} disabled={!canVerifyTax || !!aiLoadingField}>
                {aiLoadingField === 'taxCode' ? '⏳...' : (isTaxVerified ? '✅ Đã duyệt' : '✓ Duyệt Thuế')}
              </button>
            </div>

            <div className="verify-row-layout" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: 0 }}>
              <EditableField label="Website" value={profileData.websiteUrl} onSave={(val) => handleUpdateField('websiteUrl', val)} />
              <button className="mini-verify-btn" onClick={() => handleVerifySingleField('websiteUrl', profileData.websiteUrl)} disabled={!canVerifyWeb || !!aiLoadingField}>
                {aiLoadingField === 'websiteUrl' ? '⏳...' : (isWebVerified ? '✅ Đã duyệt' : '✓ Duyệt Web')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="verify-row-layout" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '20px' }}>
              <EditableField label="Số điện thoại" value={profileData.phone} onSave={(val) => handleUpdateField('phone', val)} />
            </div>

            <div className="verify-row-layout" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: 0 }}>
              <EditableField label="Địa chỉ" value={profileData.address} onSave={(val) => handleUpdateField('address', val)} />
            </div>
            {/* --- Phần CV --- */}
            <div className="cv-section" style={{ marginTop: '20px' }}>
              <span className="field-label">CV hiện tại:</span>

              {profileData.cvFileName ? (
                <div className="cv-current-display" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                  {isCvPdf ? (
                    <button type="button" className="cv-link" onClick={openCvPreview} disabled={cvBlobLoading}>
                      {cvBlobLoading ? '⏳ Đang tải...' : '📄 Xem CV đã tải lên'}
                    </button>
                  ) : (
                    <button type="button" className="cv-link" onClick={downloadCvWord} disabled={cvBlobLoading}>
                      {cvBlobLoading ? '⏳ Đang tải...' : '📄 Tải xuống để xem CV (Word)'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="field-empty" style={{ marginTop: '8px' }}>
                  (Chưa có CV nào được tải lên)
                </div>
              )}

              <div className="cv-upload-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  id="cv-file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="cv-file-input" className="cv-choose-btn" style={{ cursor: 'pointer' }}>
                  📎 Chọn file CV
                </label>

                {cvFile && <span className="cv-filename">{cvFile.name}</span>}

                <button
                  className="mini-verify-btn"
                  onClick={handleUploadCv}
                  disabled={!cvFile || uploadingCv}
                >
                  {uploadingCv ? '⏳ Đang tải...' : 'Tải lên'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {showCvPreview && (
        <div className="cv-preview-overlay" onClick={closeCvPreview}>
          <div className="cv-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cv-preview-header">
              <span>Xem CV</span>
              <button className="cv-preview-close" onClick={closeCvPreview}>✕</button>
            </div>
            {cvBlobUrl && <iframe src={cvBlobUrl} title="CV Preview" className="cv-preview-frame" />}
          </div>
        </div>
      )}
    </div>


  );
}

export default Profile;