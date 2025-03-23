import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import '../public/styles/Login_style.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        Swal.fire({
            title: 'Đang xử lý...',
            text: 'Vui lòng đợi một chút.',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        // Kiểm tra thông tin đăng nhập
        if (email === 'admin' && password === 'admin123') {
            Swal.close();
            Swal.fire({
                title: 'Đăng nhập thành công!',
                text: 'Chào mừng bạn đến với trang Admin.',
                icon: 'success',
                timer: 1500,
                timerProgressBar: true,
                willClose: () => {
                    navigate('/home');
                }
            });
        } else {
            Swal.close();
            Swal.fire({
                title: 'Lỗi!',
                text: 'Thông tin đăng nhập không đúng. Vui lòng kiểm tra lại.',
                icon: 'error',
            });
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
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Mật khẩu:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                </button>
            </form>
        </div>
    );
};

export default Login;