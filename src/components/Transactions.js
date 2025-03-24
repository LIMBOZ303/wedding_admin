import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
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

    // Hàm lấy danh sách giao dịch
    const getTransactions = async () => {
        try {
            setLoading(true);
            const data = await fetchTransaction(userId, userRole);
            if (data.status) {
                setTransactions(data.data || []);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Đã tải dữ liệu',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    width: 'auto',
                    padding: '0.5em',
                    customClass: {
                        container: 'mini-alert-container',
                        popup: 'mini-alert-popup',
                        title: 'mini-alert-title'
                    }
                });
            } else {
                Swal.fire({
                    title: 'Lỗi!',
                    text: data.message || 'Không lấy được danh sách giao dịch.',
                    icon: 'error',
                });
            }
        } catch (err) {
            Swal.fire({
                title: 'Lỗi!',
                text: `Không lấy được danh sách giao dịch. Chi tiết: ${err.message}`,
                icon: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    // Hàm xác nhận giao dịch với hiệu ứng loading của SweetAlert2
    const confirmTransaction = async (transactionId) => {
        try {
            setLoading(true);
            // Hiển thị SweetAlert2 loading
            Swal.fire({
                title: 'Đang xác nhận giao dịch...',
                text: 'Vui lòng đợi một chút...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
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
            // Tắt loading alert
            Swal.close();

            if (response.data.status) {
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Giao dịch đã được xác nhận!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });
                // Cập nhật lại danh sách giao dịch
                getTransactions();
            } else {
                Swal.fire({
                    title: 'Lỗi!',
                    text: response.data.message || 'Không thể xác nhận giao dịch.',
                    icon: 'error',
                });
            }
        } catch (err) {
            Swal.close();
            Swal.fire({
                title: 'Lỗi!',
                text: `Lỗi khi xác nhận giao dịch: ${err.message}`,
                icon: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    // Tìm kiếm và lọc giao dịch
    const filteredTransactions = transactions.filter((tx) => {
        const matchesSearch = 
            (tx._id && tx._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.userId?.name && tx.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.userId?.email && tx.userId.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Sắp xếp giao dịch
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
                
                // Handle nested properties like userId.name
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

    // Hiển thị icon phân loại
    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    // Hiển thị status badge với màu sắc
    const getStatusBadge = (status) => {
        switch(status) {
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
                <h2><FontAwesomeIcon icon={faSync} /> Quản lý Giao dịch</h2>
                <button 
                    className="refresh-button"
                    onClick={getTransactions}
                    disabled={loading}
                >
                    <FontAwesomeIcon icon={faSync} spin={loading} /> Làm mới
                </button>
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

            <style jsx>{`
                .transactions-container {
                    padding: 24px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    max-width: 1300px;
                    margin: 0 auto;
                }
                
                .transactions-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .transactions-header h2 {
                    margin: 0;
                    color: #343a40;
                    font-size: 1.75rem;
                }

                .refresh-button {
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .refresh-button:hover {
                    background-color: #5a6268;
                }
                
                .refresh-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .filters-container {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                
                .search-container, .filter-container {
                    display: flex;
                    align-items: center;
                    background-color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .search-icon, .filter-icon {
                    color: #6c757d;
                    margin-right: 8px;
                }
                
                .search-input, .filter-select {
                    border: none;
                    outline: none;
                    padding: 4px;
                    flex-grow: 1;
                }
                
                .table-responsive {
                    overflow-x: auto;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    border-radius: 8px;
                    background-color: white;
                }
                
                .transactions-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .transactions-table th, .transactions-table td {
                    padding: 12px 16px;
                    text-align: left;
                    border-bottom: 1px solid #e9ecef;
                }
                
                .transactions-table th {
                    background-color: #f1f3f5;
                    color: #495057;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .transactions-table th:hover {
                    background-color: #e9ecef;
                }
                
                .transactions-table tr:last-child td {
                    border-bottom: none;
                }
                
                .transactions-table tr:hover {
                    background-color: #f8f9fa;
                }
                
                .transaction-id {
                    font-family: monospace;
                    font-size: 0.9em;
                    color: #495057;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.85em;
                    font-weight: 500;
                }
                
                .status-active {
                    background-color: #d4edda;
                    color: #155724;
                }
                
                .status-pending {
                    background-color: #fff3cd;
                    color: #856404;
                }
                
                .button-confirm, .button-confirmed {
                    border: none;
                    border-radius: 4px;
                    padding: 8px 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .button-confirm {
                    background-color: #007bff;
                    color: white;
                }
                
                .button-confirm:hover {
                    background-color: #0069d9;
                }
                
                .button-confirmed {
                    background-color: #28a745;
                    color: white;
                    opacity: 0.8;
                    cursor: default;
                }
                
                .loading-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 300px;
                }
                
                .no-data {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 24px;
                    color: #6c757d;
                    text-align: center;
                }
                
                .no-data p {
                    margin-top: 12px;
                    font-size: 1.1em;
                }
                
                @media (max-width: 768px) {
                    .transactions-container {
                        padding: 16px;
                    }
                    
                    .transactions-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    
                    .filters-container {
                        flex-direction: column;
                        width: 100%;
                    }
                    
                    .search-container, .filter-container {
                        width: 100%;
                    }
                    
                    .transactions-table th, .transactions-table td {
                        padding: 8px 12px;
                    }
                }
            `}</style>
            {/* Styles cho SweetAlert2 mini notifications */}
            <style global jsx>{`
                /* Tùy chỉnh SweetAlert2 cho thông báo nhỏ gọn */
                .mini-alert-container {
                    z-index: 9999;
                }
                
                .mini-alert-popup {
                    font-size: 0.85rem !important;
                    max-width: 200px !important;
                    padding: 8px 10px !important;
                    border-radius: 4px !important;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
                }
                
                .mini-alert-title {
                    font-size: 0.9rem !important;
                    margin: 0 !important;
                    padding: 5px !important;
                }
                
                .swal2-icon {
                    margin: 0.3em auto 0.5em !important;
                    height: 2em !important;
                    width: 2em !important;
                }
                
                .swal2-icon-content {
                    font-size: 1.5em !important;
                }
                
                .swal2-success-ring {
                    width: 2em !important;
                    height: 2em !important;
                }
            `}</style>
        </div>
    );
}

export default Transactions;
