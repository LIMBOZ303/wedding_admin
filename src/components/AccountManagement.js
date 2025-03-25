import React, { useEffect, useState } from 'react';
import { fetchAccounts, deleteAccount } from '../api/users_api';
import '../public/styles/AccountManagement.css';

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);

    // Lấy danh sách tài khoản từ API
    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const data = await fetchAccounts();
                setAccounts(data);
                setFilteredAccounts(data);
            } catch (err) {
                setError('Không thể tải dữ liệu tài khoản.');
            } finally {
                setLoading(false);
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

    const handleConfirmDelete = async () => {
        if (!accountToDelete) return;
        
        try {
            await deleteAccount(accountToDelete);
            setAccounts(accounts.filter((account) => account._id !== accountToDelete));
            setShowConfirmDialog(false);
            setAccountToDelete(null);
        } catch (err) {
            setError('Không thể xóa tài khoản.');
        }
    };

    const handleDeleteClick = (id) => {
        setAccountToDelete(id);
        setShowConfirmDialog(true);
    };

    const handleEditAccount = (id) => {
        console.log("Chỉnh sửa tài khoản:", id);
    };

    if (loading) return (
        <div className="loading">
            <div className="loader"></div>
            <p className="loading-text">Đang tải dữ liệu...</p>
        </div>
    );

    if (error) return (
        <div className="account-management-container">
            <div className="error-message">
                <i className="fa fa-exclamation-circle"></i>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
        </div>
    );

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
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.map((account) => (
                            <tr key={account._id}>
                                <td>{account.name}</td>
                                <td className="email-cell">{account.email}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEditAccount(account._id)}
                                        >
                                            <i className="fa fa-edit"></i> Sửa
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteClick(account._id)}
                                        >
                                            <i className="fa fa-trash"></i> Xóa
                                        </button>
                                    </div>
                                </td>
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
            
            {showConfirmDialog && (
                <div className="confirmation-dialog">
                    <div className="dialog-content">
                        <h4>Xác nhận xóa</h4>
                        <p>Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể hoàn tác.</p>
                        <div className="dialog-buttons">
                            <button 
                                className="cancel-btn"
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    setAccountToDelete(null);
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                className="confirm-btn"
                                onClick={handleConfirmDelete}
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountManagement;