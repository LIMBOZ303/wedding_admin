// src/components/Navbar.js
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faBell, 
  faUser, 
  faSignOutAlt,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';
import '../public/styles/Navbar.css';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AppContext);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    // Implement logout
    navigate('/');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  // Sample notifications
  const notifications = [
    { id: 1, message: 'Có đơn hàng mới #WD1208', time: '5 phút trước', read: false },
    { id: 2, message: 'Khách hàng Nguyễn Văn A đã thanh toán', time: '30 phút trước', read: false },
    { id: 3, message: 'Đã có 3 đơn đặt hàng mới', time: '2 giờ trước', read: true },
    { id: 4, message: 'Bài viết "Xu hướng cưới 2023" đã được phê duyệt', time: '1 ngày trước', read: true },
  ];

  const unreadNotifications = notifications.filter(notification => !notification.read).length;

  return (
    <nav className="navbar">
      <div className="navbar-search">
        <form onSubmit={handleSearch}>
          <div className="search-input">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="navbar-actions">
        <div className="notification-container">
          <button 
            className="notification-button" 
            onClick={toggleNotifications}
            aria-label="Thông báo"
          >
            <FontAwesomeIcon icon={faBell} />
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-menu notification-menu">
              <div className="dropdown-header">
                <h3>Thông báo</h3>
                <button className="mark-as-read">Đánh dấu đã đọc</button>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="no-notifications">Không có thông báo mới</p>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    >
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-container">
          <button 
            className="profile-button" 
            onClick={toggleUserMenu}
            aria-label="Menu người dùng"
          >
            <div className="avatar">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <span className="username">{user?.name || 'Admin'}</span>
          </button>

          {showUserMenu && (
            <div className="dropdown-menu profile-menu">
              <div className="menu-item">
                <FontAwesomeIcon icon={faUser} />
                <span>Hồ sơ</span>
              </div>
              <div className="menu-item">
                <FontAwesomeIcon icon={faCog} />
                <span>Cài đặt</span>
              </div>
              <div className="menu-item logout" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Đăng xuất</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;