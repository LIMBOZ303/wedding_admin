// src/components/AccountManagement.js
import React, { useEffect, useState } from 'react';
import { fetchAccounts } from '../api/users_api';
import Swal from 'sweetalert2';
import '../public/styles/AccountManagement.css';

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
                setAccounts(data);
                setFilteredAccounts(data);
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

    if (error) {
        return (
            <div className="account-management-container">
                <div className="error-message">
                    <i className="fa fa-exclamation-circle"></i>
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
                    <i className="fa fa-search"></i>
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
                            <th>Tên</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.map((account) => (
                            <tr key={account._id}>
                                <td>{account.name}</td>
                                <td className="email-cell">{account.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="empty-state">
                    <i className="fa fa-users"></i>
                    <p>Không tìm thấy tài khoản nào.</p>
                </div>
            )}
        </div>
    );
};

export default AccountManagement;
