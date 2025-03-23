import React, { useEffect, useState } from 'react';
import { fetchAccounts, deleteAccount } from '../api/api';
import '../public/styles/AccountManagement.css';

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Lấy danh sách tài khoản từ API
    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const data = await fetchAccounts();
                setAccounts(data);
            } catch (err) {
                setError('Không thể tải dữ liệu tài khoản.');
            } finally {
                setLoading(false);
            }
        };

        loadAccounts();
    }, []);

    const handleDeleteAccount = async (id) => {
        try {
            await deleteAccount(id);
            setAccounts(accounts.filter((account) => account._id !== id));
        } catch (err) {
            setError('Không thể xóa tài khoản.');
        }
    };

    if (loading) return (
        <div className="loading">
            <div className="loader"></div>
        </div>
    );

    if (error) return <div>{error}</div>;

    return (
        <div className="account-management-container">
            <h2>Quản Lý Tài Khoản</h2>
            <h3>Danh Sách Tài Khoản</h3>
            <table className="account-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((account) => (
                        <tr key={account._id}>
                            <td>{account.name}</td>
                            <td>{account.email}</td>
                            <td>
                                <button onClick={() => handleDeleteAccount(account._id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AccountManagement;