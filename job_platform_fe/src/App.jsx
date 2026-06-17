import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Register from './page/register/Register';
import Login from './page/login/Login'; // ◄ Import trang Login từ thư mục mới của mày nè
import { checkToken } from './service/api'; // ◄ Import hàm quét mã tự động tối thượng vào

function App() {
  const [currentUser, setCurrentUser] = useState(null); // Lưu thông tin đăng nhập { id, name, role } toàn hệ thống
  const [loading, setLoading] = useState(true); // Trạng thái đợi hệ thống check xong token dưới LocalStorage rồi mới mở web

  useEffect(() => {
    const initAuth = async () => {
      // Mỗi lần reload trang hoặc vừa mở web, hàm này tự động chạy ngầm để quét token
      const user = await checkToken();
      if (user) {
        setCurrentUser(user); // Nạp trọn vẹn data giải mã (id, name, role) vào State
      } else {
        setCurrentUser(null);
      }
      setLoading(false); // Check xong rồi, tắt màn hình chờ để hiển thị giao diện web
    };

    initAuth();
  }, []); // Mảng rỗng đảm bảo luồng này chỉ chạy đúng 1 lần duy nhất khi load/reload trang

  // Trong lúc hệ thống đang bóc tách token ẩn ngầm bên dưới, hiển thị màn hình chờ (tránh bị lỗi giao diện giật lag)
  if (loading) {
    return (
      <div style={{ 
        color: '#fff', 
        backgroundColor: '#121212', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        fontFamily: 'sans-serif'
      }}>
        <h3>Đang kiểm tra trạng thái đăng nhập...</h3>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn trang Đăng Ký */}
        <Route path="/register" element={<Register />} />
        
        {/* Đường dẫn trang Đăng Nhập */}
        <Route path="/login" element={<Login />} />

        {/* Mấy trang sau này mày làm thêm như Home hay Dashboard thì nhét ở dưới này */}
        {/* Ví dụ kiểm tra quyền hạn (Role-based Routing) ngay tại đây: */}
        {/* <Route path="/home" element={currentUser ? <Home /> : <Navigate to="/login" />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;