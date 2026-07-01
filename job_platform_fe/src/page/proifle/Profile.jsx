import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { decodeToken } from '../../service/api';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      let token = localStorage.getItem('accessToken');
      if (!token) { navigate('/login'); return; }
      const user = decodeToken(token);
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
      const token = localStorage.getItem('accessToken');
      const user = decodeToken(token);
      await api.put(`/profile/${user.id}/${profileData.role}`, updatedData);
      setNotify({ type: 'success', msg: 'Đã lưu thay đổi!' });
      setTimeout(() => setNotify({ type: '', msg: '' }), 2000);
      const reload = await api.get(`/profile/${user.id}/${profileData.role}`);
      setProfileData(reload.data);
    } catch {
      setNotify({ type: 'error', msg: 'Lỗi lưu dữ liệu!' });
    }
  };

  const handleVerifySingleField = async (fieldType, value) => {
    if (!value?.trim()) {
      alert("Điền dữ liệu vào ô trước khi quét!");
      return;
    }
    setAiLoadingField(fieldType);
    setNotify({ type: 'info', msg: 'Đang xác thực với AI...' });

    try {
      const token = localStorage.getItem('accessToken');
      const user = decodeToken(token);

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
  const isLowTrust = isRecruiter && currentPoint <= 80;

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
          <ReadOnlyField label="Vai trò" value={profileData.role} />
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
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;