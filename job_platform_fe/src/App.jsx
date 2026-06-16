// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './page/Register';

// Sau này có thêm trang nào thì import vô đây, ví dụ:
// import Login from './pages/Login';
// import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Định nghĩa: Khi gõ http://localhost:5173/register thì ôm trang Register ra hiển thị */}
        <Route path="/register" element={<Register />} />
        
        {/* Sau này mày viết thêm trang đăng nhập thì chỉ cần nhét thêm dòng dưới này */}
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;