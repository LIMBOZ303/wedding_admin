// src/components/AccountManagement.js
import React, { useEffect, useState } from 'react';
import { fetchAccounts, getUserStatus } from '../api/users_api';
import Swal from 'sweetalert2';
import '../public/styles/AccountManagement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faExclamationCircle, faUsers, faCircle, faClock } from '@fortawesome/free-solid-svg-icons';

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Lấy danh sách tài khoản từ API
    useEffect(() => {
        const loadAccounts = async () => {
            // Hiển thị SweetAlert2 Loading
            Swal.fire({
                title: 'Đang tải dữ liệu...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
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
                                    // Đã loại bỏ inactiveTimeFormatted
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
            } catch (err) {
                setError('Không thể tải dữ liệu tài khoản.');
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể tải dữ liệu tài khoản.',
                });
            } finally {
                Swal.close();
            }
        };

        loadAccounts();
    }, []);

    // Lọc tài khoản khi người dùng tìm kiếm
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
            <h2>Quản Lý Tài Khoản</h2>
            <h3>Danh Sách Tài Khoản Người Dùng</h3>
            
            <div className="search-container">
                <div className="search-box">
                    <FontAwesomeIcon icon={faSearch} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên hoặc email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredAccounts.length > 0 ? (
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
