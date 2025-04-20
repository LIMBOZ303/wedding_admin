import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../public/styles/Login_style.css';
import { login } from '../api/users_api';
import { AppContext } from '../AppContext';

const Login = () => {
  const [email, setEmail] = useState('pebiwin956@evluence.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Trạng thái để điều khiển ẩn/hiện mật khẩu
  const navigate = useNavigate();
  const { setUser } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(email, password);

      if (response && response.status === true) {
        setUser(response.user);
        localStorage.setItem('userId', response.user._id);
        localStorage.setItem('userRole', response.user.role);
        navigate('/home');
      } else {
        throw new Error(response?.message || 'Thông tin đăng nhập không đúng.');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setError('Đăng nhập không thành công, vui lòng kiểm tra lại thông tin.');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <label htmlFor="email">Tên người dùng:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email hoặc tên người dùng"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Mật khẩu:</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
            <i
              className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading} className="submit-button">
          <span>{loading ? 'Đang xử lý...' : 'Đăng Nhập'}</span>
        </button>
      </form>
    </div>
  );
};

export default Login;