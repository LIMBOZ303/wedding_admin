import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBoxes, 
  faUsers, 
  faBoxArchive, 
  faChartBar, 
  faBlog, 
  faExchangeAlt, 
  faSignOutAlt,
  faMoon,
  faSun,
  faBars,
  faChevronLeft,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import '../public/styles/Slidebar.css';
import { AppContext } from '../AppContext';

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, setDarkMode } = useContext(AppContext) || { darkMode: false, setDarkMode: () => {} };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    if (window.innerWidth <= 768) {
      setOpen(false);
    }
    navigate(path);
  };

  const toggleDarkMode = () => {
    if (setDarkMode) {
      setDarkMode(!darkMode);
      if (!darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  };

  // Define menu items with icons
  const menuItems = [
    { path: '/home', icon: faHome, text: 'Trang chủ' },
    { path: '/products', icon: faBoxes, text: 'Quản Lý Dịch Vụ' },
    { path: '/accounts', icon: faUsers, text: 'Quản Lý Tài Khoản' },
    { path: '/plans', icon: faBoxArchive, text: 'Quản Lý Kế Hoạch' },
    { path: '/statistics', icon: faChartBar, text: 'Thống Kê' },
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
            <button className="collapse-btn" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          </div>
        ) : (
          <button className="expand-btn" onClick={toggleSidebar}>
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
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  handleNavigation(item.path); 
                }}
                title={!open ? item.text : ''}
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
      
      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleDarkMode} title={open ? '' : (darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode')}>
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          {open && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
