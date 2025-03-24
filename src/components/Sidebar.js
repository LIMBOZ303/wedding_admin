// src/components/Sidebar.js
import React from 'react';
import { Link} from 'react-router-dom';
import '../public/styles/Slidebar.css';

const Sidebar = ({ isOpen }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <ul>
                <li><Link to="/home">Trang chủ</Link></li>
                <li><Link to="/categories">Quản Lý Danh Mục</Link></li>
                <li><Link to="/products">Quản Lý Sản Phẩm</Link></li>
                <li><Link to="/accounts">Quản Lý Tài Khoản</Link></li>
                <li><Link to="/combos">Quản Lý Combo</Link></li>
                <li><Link to="/statistics">Thống Kê</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/transaction">Giao Dịch</Link></li>
                <li><Link to="#">Đăng xuất</Link></li>

                
            </ul>
        </div>
    );
};

export default Sidebar;