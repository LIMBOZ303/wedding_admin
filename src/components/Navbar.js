// src/components/Navbar.js
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faBell, 
  faUser, 
  faSignOutAlt,
  faCog,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';
import '../public/styles/Navbar.css';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { user, unreadMessages, markAllMessagesAsRead } = useContext(AppContext);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleLogout = () => {
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

  const navigateToChat = () => {
    navigate('/admin-chat');
    markAllMessagesAsRead();
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
      <div className="navbar-actions">
        <div className="chat-container">
          <button 
            className="chat-button" 
            onClick={navigateToChat}
            aria-label="Chat với khách hàng"
          >
            <FontAwesomeIcon icon={faComments} />
            {unreadMessages > 0 && (
              <span className="notification-badge">{unreadMessages}</span>
            )}
          </button>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;