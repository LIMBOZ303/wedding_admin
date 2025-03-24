import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../public/styles/Slidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const [open, setOpen] = useState(isOpen);
  const navigate = useNavigate();

  useEffect(() => {
    // Update parent component when sidebar state changes
    if (onToggle) {
      onToggle(open);
    }
  }, [open, onToggle]);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    // On smaller screens, close the sidebar after clicking a link
    if (window.innerWidth <= 768) {
      setOpen(false);
    }
    navigate(path);
  };

  return (
    <div className={`sidebar ${open ? 'open' : 'closed'}`}>
      <button className="menu-button" onClick={toggleSidebar}>
        ☰
      </button>
      {open && (
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/home'); }}>Trang chủ</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/categories'); }}>Quản Lý Danh Mục</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/products'); }}>Quản Lý Sản Phẩm</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/accounts'); }}>Quản Lý Tài Khoản</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/combos'); }}>Quản Lý Combo</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/statistics'); }}>Thống Kê</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/blog'); }}>Blog</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/transaction'); }}>Giao Dịch</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('/'); }}>Đăng xuất</a></li>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
