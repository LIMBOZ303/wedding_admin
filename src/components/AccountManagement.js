import React, { useEffect, useState } from 'react';
import { fetchAccounts, getUserStatus } from '../api/users_api';
import { fetchPlanswithUser } from '../api/plan_api';
import '../public/styles/AccountManagement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faExclamationCircle, faUsers, faCircle, faClock, faSync, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from './LoadingSpinner';

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [showUserDetailModal, setShowUserDetailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPlans, setUserPlans] = useState([]);
    const [loadingUserDetails, setLoadingUserDetails] = useState(false);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const data = await fetchAccounts();

            // Lọc chỉ lấy tài khoản có role là 'user'
            const userAccounts = data.filter(account => account.role === 'user');

            // Thêm thông tin trạng thái từ API
            const accountsWithStatus = await Promise.all(
                userAccounts.map(async (account) => {
                    try {
                        const statusResponse = await getUserStatus(account._id);
                        if (statusResponse && statusResponse.status) {
                            return {
                                ...account,
                                isOnline: statusResponse.data.isOnline,
                                lastActive: statusResponse.data.lastActive
                            };
                        }
                        return account;
                    } catch (err) {
                        console.error(`Lỗi khi lấy trạng thái cho người dùng ${account._id}:`, err);
                        return account;
                    }
                })
            );

            setAccounts(accountsWithStatus);
            setFilteredAccounts(accountsWithStatus);
            setError('');
        } catch (err) {
            setError('Không thể tải dữ liệu tài khoản.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredAccounts(accounts);
        } else {
            const filtered = accounts.filter(
                account =>
                    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    account.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredAccounts(filtered);
        }
    }, [searchTerm, accounts]);

    // Format thời gian hoạt động
    const formatLastActive = (lastActive) => {
        if (!lastActive) return 'Không có dữ liệu';

        const date = new Date(lastActive);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openUserDetailModal = async (account) => {
        setSelectedUser(account);
        setLoadingUserDetails(true);
        try {
            const plans = await fetchPlanswithUser();
            const userPlans = plans.filter(plan => plan.UserId?._id === account._id);
            setUserPlans(userPlans);
            setShowUserDetailModal(true);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách kế hoạch:', err);
        } finally {
            setLoadingUserDetails(false);
        }
    };

    const closeUserDetailModal = () => {
        setShowUserDetailModal(false);
        setSelectedUser(null);
        setUserPlans([]);
    };

    if (error) {
        return (
            <div className="account-management-container">
                <div className="error-message">
                    <FontAwesomeIcon icon={faExclamationCircle} />
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Thử lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="account-management-container">
            <div className="header-wrapper">
                <div className="header-container">
                    <div className="header-title">
                        <h2>Quản Lý Tài Khoản</h2>
                        <button
                            className="refresh-button"
                            onClick={loadAccounts}
                            title="Làm mới dữ liệu"
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={faSync} />
                        </button>
                    </div>
                </div>

                <div className="search-container">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    </div>
                </div>
            </div>

            <h3>Danh Sách Tài Khoản Người Dùng</h3>

            {loading ? (
                <LoadingSpinner size="large" text="Đang tải dữ liệu..." />
            ) : filteredAccounts.length > 0 ? (
                <table className="account-table">
                    <thead>
                        <tr>
                            <th>Trạng thái</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Xem chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.map((account) => (
                            <tr key={account._id}>
                                <td className="status-cell-prominent">
                                    <div className="status-indicator">
                                        <FontAwesomeIcon
                                            icon={faCircle}
                                            className={account.isOnline ? "status-online" : "status-offline"}
                                        />
                                        <span>{account.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}</span>
                                    </div>
                                </td>
                                <td>{account.name}</td>
                                <td className="email-cell">{account.email}</td>
                                <td className="view-details-cell">
                                    <button 
                                        className="view-details-button"
                                        onClick={() => openUserDetailModal(account)}
                                        title="Xem chi tiết"
                                    >
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                        <span>Xem chi tiết</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="empty-state">
                    <FontAwesomeIcon icon={faUsers} />
                    <p>Không tìm thấy tài khoản nào.</p>
                </div>
            )}

            {/* User Detail Modal */}
            {showUserDetailModal && (
                <div className="modal-overlay" onClick={closeUserDetailModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi Tiết Người Dùng</h2>
                            <button className="close-btn" onClick={closeUserDetailModal}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        {loadingUserDetails ? (
                            <LoadingSpinner size="medium" text="Đang tải chi tiết..." />
                        ) : (
                            <div className="user-details-content">
                                <div className="user-info-section">
                                    <h3>Thông Tin Cơ Bản</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="label">Tên:</span>
                                            <span className="value">{selectedUser.name}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Email:</span>
                                            <span className="value">{selectedUser.email}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Trạng thái:</span>
                                            <span className={`value status ${selectedUser.isOnline ? 'online' : 'offline'}`}>
                                                {selectedUser.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Hoạt động lần cuối:</span>
                                            <span className="value">{formatLastActive(selectedUser.lastActive)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="user-plans-section">
                                    <h3>Danh Sách Kế Hoạch Đã Đặt Cọc</h3>
                                    {userPlans.length > 0 ? (
                                        <div className="plans-list">
                                            {userPlans.map(plan => (
                                                <div key={plan._id} className="plan-item">
                                                    <div className="plan-image-container">
                                                        <img
                                                            src={plan.SanhId?.imageUrl || 'https://via.placeholder.com/120'}
                                                            alt={plan.name}
                                                            className="plan-image"
                                                        />
                                                    </div>
                                                    <div className="plan-details">
                                                        <h4>{plan.name}</h4>
                                                        <p><strong>Sảnh:</strong> {plan.SanhId?.name || 'N/A'}</p>
                                                        <p><strong>Tổng giá:</strong> {plan.totalPrice.toLocaleString()} VNĐ</p>
                                                        <p><strong>Ngày sự kiện:</strong> {plan.plandateevent ? new Date(plan.plandateevent).toLocaleDateString('vi-VN') : 'Chưa xác định'}</p>
                                                        <p>
                                                            <strong>Trạng thái:</strong>
                                                            <span className={`status ${plan.status === 'Đã đặt cọc' ? 'deposited' : 'not-deposited'}`}>
                                                                {plan.status}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-plans">
                                            <p>Người dùng chưa có kế hoạch nào đã đặt cọc.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountManagement;