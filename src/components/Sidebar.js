import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBoxes,
  faUsers,
  faBoxArchive,
  faBlog,
  faExchangeAlt,
  faSignOutAlt,
  faBars,
  faChevronLeft,
  faComments,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import '../public/styles/Slidebar.css';

const Sidebar = () => {
  const [open, setOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(open));
  }, [open]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && open) {
        setOpen(false);
      }
    };
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      setOpen(false);
    }
  };

  const menuItems = [
    { path: '/home', icon: faHome, text: 'Trang chủ' },
    { path: '/products', icon: faBoxes, text: 'Quản Lý Dịch Vụ' },
    { path: '/accounts', icon: faUsers, text: 'Quản Lý Tài Khoản' },
    { path: '/user-status', icon: faUserCheck, text: 'Đang Online' },
    { path: '/plans', icon: faBoxArchive, text: 'Quản Lý Kế Hoạch' },
    { path: '/blog', icon: faBlog, text: 'Blog' },
    { path: '/transaction', icon: faExchangeAlt, text: 'Giao Dịch' },
    { path: '/admin-chat', icon: faComments, text: 'Chat Với Khách Hàng' },
    { path: '/', icon: faSignOutAlt, text: 'Đăng xuất' },
  ];

  return (
    <div className={`sidebar ${open ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        {open ? (
          <div className="logo-container">
            <h2 className="logo">Wedding Admin</h2>
            <button
              className="collapse-btn"
              onClick={toggleSidebar}
              aria-label="Thu gọn sidebar"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          </div>
        ) : (
          <button
            className="expand-btn"
            onClick={toggleSidebar}
            aria-label="Mở rộng sidebar"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        )}
      </div>

      <div className="sidebar-content">
        <ul className="menu-list">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <a
                href="#!"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.path);
                }}
                title={!open ? item.text : ''}
                aria-label={item.text}
              >
                <span className="menu-icon">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                {open && <span className="menu-text">{item.text}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);