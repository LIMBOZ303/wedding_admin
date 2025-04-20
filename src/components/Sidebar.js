import React, { useState, useEffect, useContext } from 'react';
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
import { AppContext } from '../AppContext';
import Swal from 'sweetalert2';

const Sidebar = () => {
  const [open, setOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AppContext);

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

  const handleNavigation = async (path) => {
    if (path === '/') {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn đăng xuất?',
        text: "Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng hệ thống.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đăng xuất',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        // Xóa thông tin người dùng khỏi localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        
        // Xóa thông tin người dùng khỏi context
        setUser(null);
        
        // Chuyển hướng về trang đăng nhập
        navigate('/');
      }
    } else {
      navigate(path);
      if (window.innerWidth <= 768) {
        setOpen(false);
      }
    }
  };

  const menuItems = [
    { path: '/home', icon: faHome, text: 'Trang chủ' },
    { path: '/products', icon: faBoxes, text: 'Quản Lý Dịch Vụ' },
    { path: '/accounts', icon: faUsers, text: 'Quản Lý Tài Khoản' },
    { path: '/user-status', icon: faUserCheck, text: 'Đang Online' },
    { path: '/plans', icon: faBoxArchive, text: 'Quản Lý Kế Hoạch' },
    { path: '/combo', icon: faBoxArchive, text: 'Quản lý Combo'},
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