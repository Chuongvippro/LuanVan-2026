import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { checkToken } from '../../service/api';
import './profile.css';

function EditableField({ label, value, onSave, icon = "✏️" }) {
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
    <div className="profile-field-modern editable">
      <span className="field-label-modern">{icon} {label}:</span>
      {isEditing ? (
        <input
          type="text"
          className="field-input-modern"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlurOrEnter}
          onKeyDown={(e) => e.key === 'Enter' && handleBlurOrEnter()}
          autoFocus
        />
      ) : (
        <div className={`field-value-display editable-text ${value ? '' : 'field-empty'}`} onClick={() => setIsEditing(true)}>
          {value || `(Bấm vào đây để bổ sung ${label.toLowerCase()})`}
        </div>
      )}
    </div>
  );
}

function ReadOnlyField({ label, value, icon = "📌" }) {
  return (
    <div className="profile-field-modern">
      <span className="field-label-modern">{icon} {label}:</span>
      <div className={`field-value-display ${value ? '' : 'field-empty'}`}>
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passWordData, setPassWordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passWordLoading, setPassWordLoading] = useState(false);
  
  const [cvFile, setCvFile] = useState(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvBlobUrl, setCvBlobUrl] = useState('');
  const [cvBlobLoading, setCvBlobLoading] = useState(false);

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

  useEffect(() => {
    return () => {
      if (cvBlobUrl) URL.revokeObjectURL(cvBlobUrl);
    };
  }, [cvBlobUrl]);

  const handleUpdateField = async (fieldName, updatedValue) => {
    const updatedData = { ...profileData, [fieldName]: updatedValue };
    try {
      const user = await checkToken();
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

      const updatedData = { ...profileData, [fieldType]: value };
      await api.put(`/profile/${user.id}/${profileData.role}`, updatedData);

      const response = await api.post(`/profile/verify-field/${user.id}`, {
        fieldType: fieldType,
        value: value
      });

      if (response.data && response.data.status === "SUCCESS") {
        const reload = await api.get(`/profile/${user.id}/${profileData.role}`);
        setProfileData(reload.data);
        setNotify({ type: 'success', msg: `✅ Duyệt thành công!` });
      } else {
        setNotify({ type: 'error', msg: `❌ Từ chối: ${response.data.reason || 'Dữ liệu không khớp'}` });
      }
    } catch (err) {
      setNotify({ type: 'error', msg: 'Lỗi hệ thống!' });
      console.error(err);
    } finally {
      setAiLoadingField('');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passWordData.oldPassword || !passWordData.newPassword || !passWordData.confirmPassword) {
      setNotify({ type: 'error', msg: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }
    if(passWordData.newPassword !== passWordData.confirmPassword) {
      setNotify({ type: 'error', msg: 'Mật khẩu mới và xác nhận không khớp!' });
      return;
    }
    if(passWordData.newPassword.length < 6) {
      setNotify({ type: 'error', msg: 'Mật khẩu mới phải từ 6 ký tự!' });
      return;
    }
    setPassWordLoading(true);
    try{
      const user = await checkToken();
      if (!user) { navigate('/login'); return; }

      await api.post(`/profile/change-password/${user.id}`, {
        oldPassword: passWordData.oldPassword, 
        newPassword: passWordData.newPassword
      });
      setPassWordData({oldPassword: '', newPassword: '', confirmPassword: ''});
      setShowPasswordModal(false);
      setNotify({ type: 'success', msg: 'Đổi mật khẩu thành công!' });
      setTimeout(() => setNotify({ type: '', msg: '' }), 2000);
    }catch(err){
      const errMsg = err.response?.data?.message || 'Lỗi đổi mật khẩu!';
      setNotify({ type: 'error', msg: errMsg });
    }finally{
      setPassWordLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    if (!status || status === 'pending') return { class: 'status-default', text: 'Chưa xác thực (60đ)' };
    let parts = [];
    if (status.includes('name')) parts.push('Tên');
    if (status.includes('tax')) parts.push('Thuế');
    if (status.includes('website')) parts.push('Web');
    if (parts.length === 3) return { class: 'status-approved', text: 'Đã xác thực toàn bộ (100đ) ✓' };
    return { class: 'status-pending', text: `Xác thực 1 phần (${parts.join(',')})` };
  };

  if (loading) return <div className="profile-wrapper"><div style={{textAlign: 'center', padding: '40px'}}>Đang tải dữ liệu...</div></div>;
  if (!profileData) return null;

  const isRecruiter = profileData.role === 'recruiter';
  const badge = renderStatusBadge(profileData.status);
  
  const isNameVerified = profileData.status?.includes('name');
  const isTaxVerified = profileData.status?.includes('tax');
  const isWebVerified = profileData.status?.includes('website');
  
  const canVerifyTax = !!profileData.companyName;
  const canVerifyWeb = !!profileData.companyName && !!profileData.taxCode;
  
  const currentPoint = profileData.point ?? 80;
  const isLowTrust = isRecruiter && currentPoint <= 90;

  const cvExt = profileData.cvFileName ? profileData.cvFileName.substring(profileData.cvFileName.lastIndexOf('.')).toLowerCase() : '';
  const isCvPdf = cvExt === '.pdf';

  return (
    <div className="profile-wrapper">
      
      {/* Header Profile Glass */}
      <div className="profile-header-glass">
        <div className="profile-avatar-placeholder">
          {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="profile-header-info">
          <h2>{isRecruiter ? 'Hồ Sơ Nhà Tuyển Dụng' : 'Hồ Sơ Ứng Viên'}</h2>
          <div className="profile-email">{profileData.email}</div>
          {isRecruiter && (
            <span className={`status-badge-glass ${badge.class}`}>{badge.text}</span>
          )}
        </div>
      </div>

      {!showPasswordModal && notify.msg && (
        <div className={`notify-box nt-${notify.type}`}>
          {notify.type === 'success' && '✅ '}
          {notify.type === 'error' && '❌ '}
          {notify.type === 'info' && 'ℹ️ '}
          {notify.msg}
        </div>
      )}

      {isLowTrust && (
        <div className="trust-warning-banner">
          <strong>⚠️ Điểm tin cậy: {currentPoint}đ</strong> — Cần cung cấp đầy đủ thông tin doanh nghiệp (Tên công ty, Mã số thuế, Website) và vượt qua xác thực AI để đảm bảo đăng tin tuyển dụng không bị hạn chế.
        </div>
      )}

      {/* Main Content Grid */}
      <div className="profile-grid">
        
        {/* Card 1: Account Information */}
        <div className="profile-card">
          <h3>Thông tin tài khoản</h3>
          <div>
            <ReadOnlyField label="Tên tài khoản" value={profileData.name} icon="👤" />
            <ReadOnlyField label="Email đăng ký" value={profileData.email} icon="✉️" />
            <ReadOnlyField label="Vai trò" value={isRecruiter ? "Nhà tuyển dụng" : "Ứng viên"} icon="🛡️" />
            {isRecruiter && <ReadOnlyField label="Email công ty" value={profileData.companyEmail} icon="🏢" />}
            
            <button 
              className="glass-btn btn-secondary mt-3" 
              onClick={() => { setShowPasswordModal(true); setNotify({ type: '', msg: '' }); }}
              style={{ width: '100%' }}
            >
              🔐 Thay đổi mật khẩu
            </button>
          </div>
        </div>

        {/* Card 2: Verification / Contact */}
        <div className="profile-card">
          <h3>{isRecruiter ? 'Xác thực doanh nghiệp (AI)' : 'Thông tin liên hệ & CV'}</h3>
          
          {isRecruiter ? (
            <div>
              <div className="verify-row-layout">
                <EditableField label="Tên công ty" value={profileData.companyName} onSave={(val) => handleUpdateField('companyName', val)} icon="🏢" />
                <button className="glass-btn btn-primary" onClick={() => handleVerifySingleField('companyName', profileData.companyName)} disabled={!!aiLoadingField}>
                  {aiLoadingField === 'companyName' ? '⏳...' : (isNameVerified ? '✅ Đã duyệt' : 'Duyệt')}
                </button>
              </div>

              <div className="verify-row-layout">
                <EditableField label="Mã số thuế (MST)" value={profileData.taxCode} onSave={(val) => handleUpdateField('taxCode', val)} icon="📑" />
                <button className="glass-btn btn-primary" onClick={() => handleVerifySingleField('taxCode', profileData.taxCode)} disabled={!canVerifyTax || !!aiLoadingField}>
                  {aiLoadingField === 'taxCode' ? '⏳...' : (isTaxVerified ? '✅ Đã duyệt' : 'Duyệt')}
                </button>
              </div>

              <div className="verify-row-layout">
                <EditableField label="Website công ty" value={profileData.websiteUrl} onSave={(val) => handleUpdateField('websiteUrl', val)} icon="🌐" />
                <button className="glass-btn btn-primary" onClick={() => handleVerifySingleField('websiteUrl', profileData.websiteUrl)} disabled={!canVerifyWeb || !!aiLoadingField}>
                  {aiLoadingField === 'websiteUrl' ? '⏳...' : (isWebVerified ? '✅ Đã duyệt' : 'Duyệt')}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <EditableField label="Số điện thoại" value={profileData.phone} onSave={(val) => handleUpdateField('phone', val)} icon="📞" />
              <EditableField label="Địa chỉ" value={profileData.address} onSave={(val) => handleUpdateField('address', val)} icon="📍" />
              
              <div className="cv-section-modern">
                <span className="field-label-modern">📎 CV đính kèm:</span>
                
                {profileData.cvFileName ? (
                  <div style={{ marginTop: '10px', marginBottom: '16px' }}>
                    {isCvPdf ? (
                      <button type="button" className="cv-link" onClick={openCvPreview} disabled={cvBlobLoading}>
                        {cvBlobLoading ? '⏳ Đang tải bản xem trước...' : '📄 Xem CV hiện tại (PDF)'}
                      </button>
                    ) : (
                      <button type="button" className="cv-link" onClick={downloadCvWord} disabled={cvBlobLoading}>
                        {cvBlobLoading ? '⏳ Đang tải file...' : '📄 Tải xuống CV (Word)'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="field-empty" style={{ margin: '8px 0 16px' }}>
                    (Chưa có CV nào được tải lên)
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvChange}
                    id="cv-file-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="cv-file-input" className="cv-choose-btn">
                    Tải file mới...
                  </label>
                  {cvFile && <span className="cv-filename" title={cvFile.name}>{cvFile.name}</span>}
                  
                  <button
                    className="glass-btn btn-primary"
                    onClick={handleUploadCv}
                    disabled={!cvFile || uploadingCv}
                    style={{ marginLeft: 'auto', padding: '8px 16px', height: '40px' }}
                  >
                    {uploadingCv ? '⏳...' : 'Lưu CV'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="cv-preview-overlay" onClick={() => { setShowPasswordModal(false); setNotify({ type: '', msg: '' }); }}>
          <div className="cv-preview-modal" 
                style={{ maxWidth: '420px', height: 'auto', padding: '0 0 20px 0' }} 
                onClick={(e) => e.stopPropagation()}>
            <div className="cv-preview-header">
              <span style={{ fontSize: '18px' }}>Đổi Mật Khẩu</span>
              <button className="cv-preview-close" onClick={() => { setShowPasswordModal(false); setNotify({ type: '', msg: '' }); }}>✕</button>
            </div>
            
            {notify.msg && (
              <div className={`notify-box nt-${notify.type}`} style={{ margin: '20px 24px 0', marginBottom: '-4px' }}>
                {notify.type === 'success' && '✅ '}
                {notify.type === 'error' && '❌ '}
                {notify.type === 'info' && 'ℹ️ '}
                {notify.msg}
              </div>
            )}
            
            <form onSubmit={handlePasswordChange} style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="field-label-modern">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="field-input-modern"
                  value={passWordData.oldPassword}
                  onChange={(e) => setPassWordData({ ...passWordData, oldPassword: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="field-label-modern">Mật khẩu mới</label>
                <input
                  type="password"
                  className="field-input-modern"
                  value={passWordData.newPassword}
                  onChange={(e) => setPassWordData({ ...passWordData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="field-label-modern">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  className="field-input-modern"
                  value={passWordData.confirmPassword}
                  onChange={(e) => setPassWordData({ ...passWordData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="glass-btn btn-primary" 
                style={{ width: '100%', marginTop: '8px', padding: '12px' }}
                disabled={passWordLoading}
              >
                {passWordLoading ? '⏳ Đang xử lý...' : 'Lưu Thay Đổi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CV Preview Modal */}
      {showCvPreview && (
        <div className="cv-preview-overlay" onClick={closeCvPreview}>
          <div className="cv-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cv-preview-header">
              <span style={{ fontSize: '18px' }}>Xem trước CV</span>
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