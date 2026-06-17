import axios from 'axios';

// 1. Khởi tạo cấu hình Axios instance lấy URL gốc từ file .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Hàm Helper tự chế để giải mã phần mã hóa (Payload) của JWT lấy id, name, role, exp
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1]; // Bốc phần payload nằm giữa 2 dấu chấm của chuỗi JWT
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Lỗi giải mã chuỗi Token lỏ:', error);
    return null;
  }
};

// 3. Hàm kiểm tra mã Token  (Silent Refresh Logic)
export const checkToken = async () => {
  let accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  // Bước 1: Nếu có Access Token -> Kiểm tra thời hạn 7 phút
  if (accessToken) {
    const userData = decodeToken(accessToken);
    const currentTime = Date.now() / 1000; // Đổi thời gian hiện tại sang giây

    if (userData && userData.exp > currentTime) {
      // Access Token còn hạn -> Đính vào Header Axios để các API sau xài ké
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      return userData; // Trả về thông tin { id, name, role } lập tức
    } else {
      // Access Token hết hạn -> Xóa đi để xuống bước dưới đổi Refresh Token
      localStorage.removeItem('accessToken');
    }
  }

  // Bước 2: Access Token tèo nhưng còn Refresh Token (Hạn 5 ngày)
  if (refreshToken) {
    try {
      // Âm thầm bắn một API POST lên Backend để đổi Refresh Token lấy Access Token mới
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
        token: refreshToken,
      });

      const newAccessToken = response.data.accessToken;

      // Lưu cái mã 7 phút mới tinh này vào lại LocalStorage
      localStorage.setItem('accessToken', newAccessToken);

      // Đính mã mới vào Header Axios
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

      console.log('🔄 Access Token hết hạn 7 phút. Đã âm thầm đổi Token mới thành công!');
      return decodeToken(newAccessToken); // Giải mã trả về data user mới
    } catch (error) {
      // Hậu quả: Thằng Refresh Token dưới DB cũng hết hạn 5 ngày hoặc bị sửa đổi lỏ
      console.log('❌ Chưa đăng nhập!');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.error(error);
    }
  }

  // Bước 3: Trắng tay cả 2 mã hoặc cả 2 đều đã hết hạn hoàn toàn
  console.log('Chưa đăng nhập!');
  return null;
};

export default api;