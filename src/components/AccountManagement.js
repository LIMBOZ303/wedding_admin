import React, { useEffect, useState } from 'react';
import { fetchAccounts, getUserStatus } from '../api/users_api';
import '../public/styles/AccountManagement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faExclamationCircle, faUsers, faCircle, faClock, faSync } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from './LoadingSpinner';

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const data = await fetchAccounts();

            // Thêm thông tin trạng thái từ API
            const accountsWithStatus = await Promise.all(
                data.map(async (account) => {
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
                            <th>Hoạt động lần cuối</th>
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
                                <td className="last-active-cell">
                                    <div className="last-active">
                                        <FontAwesomeIcon icon={faClock} />
                                        <span>{formatLastActive(account.lastActive)}</span>
                                    </div>
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
        </div>
    );
};

export default AccountManagement;
