import React, { useState, useEffect } from 'react';
import { getOnlineUsers } from '../api/users_api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCircle, faClock, faSync, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import '../public/styles/UserStatusDashboard.css';

const UserStatusDashboard = () => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Hàm tải danh sách người dùng đang online
    const fetchOnlineUsers = async () => {
        try {
            setLoading(true);
            const response = await getOnlineUsers();
            
            if (response && response.status) {
                setOnlineUsers(response.data || []);
                setLastRefresh(new Date());
            } else {
                console.error('Lỗi dữ liệu:', response);
                setError('Không thể tải danh sách người dùng online');
            }
        } catch (err) {
            console.error('Lỗi khi lấy danh sách người dùng online:', err);
            setError('Không thể kết nối tới máy chủ');
        } finally {
            setLoading(false);
        }
    };

    // Tự động cập nhật mỗi 30 giây
    useEffect(() => {
        fetchOnlineUsers();
        
        let intervalId;
        if (autoRefresh) {
            intervalId = setInterval(() => {
                fetchOnlineUsers();
            }, 30000); // 30 giây
        }
        
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [autoRefresh]);

    // Hàm thiết lập tự động làm mới
    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
        Swal.fire({
            icon: 'info',
            title: !autoRefresh ? 'Đã bật tự động làm mới' : 'Đã tắt tự động làm mới',
            text: !autoRefresh 
                ? 'Dữ liệu sẽ được cập nhật mỗi 30 giây.' 
                : 'Dữ liệu sẽ không tự động cập nhật.',
            timer: 2000,
            showConfirmButton: false
        });
    };

    // Hàm thực hiện làm mới thủ công
    const handleManualRefresh = () => {
        fetchOnlineUsers();
        Swal.fire({
            icon: 'success',
            title: 'Đã làm mới',
            text: 'Dữ liệu đã được cập nhật.',
            timer: 1500,
            showConfirmButton: false
        });
    };

    // Format thời gian
    const formatTime = (date) => {
        if (!date) return '';
        
        const formattedDate = new Date(date);
        return formattedDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="user-status-dashboard">
            <div className="dashboard-header">
                <div className="title-section">
                    <h2>
                        <FontAwesomeIcon icon={faUserCheck} className="title-icon" />
                        Trạng thái người dùng
                    </h2>
                    <div className="online-count">
                        <span className="count">{onlineUsers.length}</span>
                        <span className="label">người dùng đang online</span>
                    </div>
                </div>
                
                <div className="control-section">
                    <div className="last-update">
                        <FontAwesomeIcon icon={faClock} />
                        <span>Cập nhật lần cuối: {formatTime(lastRefresh)}</span>
                    </div>
                    
                    <div className="refresh-controls">
                        <button 
                            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
                            onClick={toggleAutoRefresh}
                            title={autoRefresh ? 'Tắt tự động làm mới' : 'Bật tự động làm mới'}
                        >
                            <FontAwesomeIcon icon={faSync} className={autoRefresh ? 'rotating' : ''} />
                            <span>{autoRefresh ? 'Tự động làm mới' : 'Làm mới thủ công'}</span>
                        </button>
                        
                        <button 
                            className="manual-refresh-btn"
                            onClick={handleManualRefresh}
                            disabled={loading}
                            title="Làm mới ngay"
                        >
                            <FontAwesomeIcon icon={faSync} className={loading ? 'rotating' : ''} />
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="online-users-container">
                <h3>
                    <FontAwesomeIcon icon={faUsers} />
                    <span>Người dùng đang hoạt động</span>
                </h3>
                
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải danh sách người dùng...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={handleManualRefresh}>Thử lại</button>
                    </div>
                ) : onlineUsers.length === 0 ? (
                    <div className="empty-state">
                        <p>Không có người dùng nào đang hoạt động</p>
                    </div>
                ) : (
                    <div className="users-grid">
                        {onlineUsers.map(user => (
                            <div key={user._id} className="user-card">
                                <div className="user-avatar">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name || 'User'} />
                                    ) : (
                                        <div className="default-avatar">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                    <span className="status-dot">
                                        <FontAwesomeIcon icon={faCircle} />
                                    </span>
                                </div>
                                <div className="user-info">
                                    <h4>{user.name || 'Unknown User'}</h4>
                                    <p className="user-email">{user.email || 'No email'}</p>
                                    <div className="last-active-info">
                                        <FontAwesomeIcon icon={faClock} />
                                        <span>{formatTime(user.lastActive)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserStatusDashboard; 