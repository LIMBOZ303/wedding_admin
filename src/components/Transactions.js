import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../public/styles/Transaction.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import { fetchTransaction } from '../api/transaction_api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSync,
    faCheckCircle,
    faExclamationTriangle,
    faSearch,
    faFilter
} from '@fortawesome/free-solid-svg-icons';

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        getTransactions();
        // eslint-disable-next-line
    }, []);

    const getTransactions = async () => {
        try {
            setLoading(true);
            Swal.fire({
                title: 'Đang tải dữ liệu giao dịch...',
                position: 'center',
                width: '300px',
                allowOutsideClick: false,
                showConfirmButton: false,
                background: '#fff',
                customClass: {
                    popup: 'swal2-small-popup'
                },
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const data = await fetchTransaction(userId, userRole);
            if (data.status) {
                setTransactions(data.data || []);
                Swal.fire({
                    toast: true,
                    position: 'center',
                    icon: 'success',
                    title: 'Đã tải dữ liệu',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    width: '300px',
                    customClass: {
                        popup: 'swal2-small-popup'
                    }
                });
            } else {
                Swal.fire({
                    title: 'Lỗi!',
                    text: data.message || 'Không lấy được danh sách giao dịch.',
                    icon: 'error',
                    position: 'center',
                    width: '300px',
                    timer: 3000,
                    toast: true,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            Swal.fire({
                title: 'Lỗi!',
                text: `Không lấy được danh sách giao dịch. Chi tiết: ${err.message}`,
                icon: 'error',
                position: 'center',
                width: '300px',
                timer: 3000,
                toast: true,
                showConfirmButton: false
            });
        } finally {
            setLoading(false);
            Swal.close();
        }
    };

    const confirmTransaction = async (transactionId) => {
        try {
            setLoading(true);
            Swal.fire({
                title: 'Đang xác nhận giao dịch...',
                text: 'Vui lòng đợi một chút...',
                position: 'center',
                width: '300px',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const response = await axios.patch(
                `https://apidatn.onrender.com/users/transactions/${transactionId}/confirm`,
                {},
                {
                    headers: {
                        'user-id': userId,
                        'user-role': userRole,
                    },
                }
            );
            Swal.close();

            if (response.data.status) {
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Giao dịch đã được xác nhận!',
                    icon: 'success',
                    position: 'center',
                    width: '300px',
                    timer: 1500,
                    toast: true,
                    showConfirmButton: false
                });
                getTransactions();
            } else {
                Swal.fire({
                    title: 'Lỗi!',
                    text: response.data.message || 'Không thể xác nhận giao dịch.',
                    icon: 'error',
                    position: 'center',
                    width: '300px',
                    timer: 3000,
                    toast: true,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            Swal.close();
            Swal.fire({
                title: 'Lỗi!',
                text: `Lỗi khi xác nhận giao dịch: ${err.message}`,
                icon: 'error',
                position: 'center',
                width: '300px',
                timer: 3000,
                toast: true,
                showConfirmButton: false
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter((tx) => {
        const matchesSearch =
            (tx._id && tx._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.userId?.name && tx.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.userId?.email && tx.userId.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = React.useMemo(() => {
        let sortableItems = [...filteredTransactions];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'userName') {
                    aValue = a.userId?.name || '';
                    bValue = b.userId?.name || '';
                } else if (sortConfig.key === 'userEmail') {
                    aValue = a.userId?.email || '';
                    bValue = b.userId?.email || '';
                } else {
                    aValue = a[sortConfig.key] || '';
                    bValue = b[sortConfig.key] || '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredTransactions, sortConfig]);

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return (
                    <span className="status-badge status-active">
                        <FontAwesomeIcon icon={faCheckCircle} /> Đã xác nhận
                    </span>
                );
            case 'pending':
                return (
                    <span className="status-badge status-pending">
                        <FontAwesomeIcon icon={faExclamationTriangle} /> Chờ xác nhận
                    </span>
                );
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    return (
        <div className="transactions-container">
            <div className="transactions-header">
                <h2>
                    <FontAwesomeIcon icon={faSync} /> Quản lý Giao dịch
                </h2>
                <button
                    className="refresh-button"
                    onClick={getTransactions}
                    disabled={loading}
                >
                    <FontAwesomeIcon style={{width: 50, height: 50}} icon={faSync} spin={loading} /></button>
            </div>

            <div className="filters-container">
                <div className="search-container">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã, tên, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-container">
                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đã xác nhận</option>
                        <option value="pending">Chờ xác nhận</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="table-responsive">
                    {sortedTransactions.length === 0 ? (
                        <div className="no-data">
                            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
                            <p>Không tìm thấy giao dịch nào</p>
                        </div>
                    ) : (
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th onClick={() => requestSort('_id')}>
                                        Mã giao dịch {getSortIcon('_id')}
                                    </th>
                                    <th onClick={() => requestSort('userName')}>
                                        Người dùng {getSortIcon('userName')}
                                    </th>
                                    <th onClick={() => requestSort('userEmail')}>
                                        Email {getSortIcon('userEmail')}
                                    </th>
                                    <th onClick={() => requestSort('planId')}>
                                        Gói (planId) {getSortIcon('planId')}
                                    </th>
                                    <th onClick={() => requestSort('status')}>
                                        Trạng thái {getSortIcon('status')}
                                    </th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTransactions.map((tx) => (
                                    <tr key={tx._id}>
                                        <td className="transaction-id">{tx._id}</td>
                                        <td>{tx.userId?.name || 'N/A'}</td>
                                        <td>{tx.userId?.email || 'N/A'}</td>
                                        <td>{tx.planId || 'N/A'}</td>
                                        <td>{getStatusBadge(tx.status)}</td>
                                        <td>
                                            {tx.status === 'active' ? (
                                                <button className="button-confirmed" disabled>
                                                    <FontAwesomeIcon icon={faCheckCircle} /> Đã xác nhận
                                                </button>
                                            ) : (
                                                <button className="button-confirm" onClick={() => confirmTransaction(tx._id)}>
                                                    <FontAwesomeIcon icon={faCheckCircle} /> Xác nhận
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default Transactions;
