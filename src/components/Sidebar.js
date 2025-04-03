import React, { useState, useContext, useEffect } from 'react';
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
  faMoon,
  faSun,
  faBars,
  faChevronLeft,
  faComments,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import '../public/styles/Slidebar.css';
import { AppContext } from '../AppContext';

const Sidebar = () => {
  // Lưu trạng thái sidebar vào localStorage để duy trì trạng thái giữa các lần tải lại
  const [open, setOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, setDarkMode } = useContext(AppContext) || { darkMode: false, setDarkMode: () => {} };

  // Lưu trạng thái sidebar mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(open));
  }, [open]);

  // Đóng sidebar tự động trên thiết bị di động
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && open) {
        setOpen(false);
      }
    };

    // Kiểm tra kích thước màn hình khi component được tạo
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Chỉ đóng sidebar khi ở màn hình nhỏ
    if (window.innerWidth <= 768) {
      setOpen(false);
    }
  };

  const toggleDarkMode = () => {
    if (setDarkMode) {
      const newMode = !darkMode;
      setDarkMode(newMode);
      
      if (newMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  };

  // Định nghĩa các mục menu với icons
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
    <div className={`sidebar ${open ? 'open' : 'closed'} ${darkMode ? 'dark-mode' : ''}`}>
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