import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../public/styles/Transaction.css';
import { fetchTransaction } from '../api/transaction_api';
import { fetchPlanById } from '../api/plan_api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSync,
    faCheckCircle,
    faExclamationTriangle,
    faSearch,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false); // Loading khi lấy danh sách
    const [loadingConfirm, setLoadingConfirm] = useState({}); // Loading riêng cho từng nút xác nhận
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [planNames, setPlanNames] = useState({});
    const [loadingPlanNames, setLoadingPlanNames] = useState({});
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    // Hàm lấy thông tin tên kế hoạch
    const fetchPlanName = async (planId) => {
        if (loadingPlanNames[planId] || planNames[planId]) return; 

        try {
            setLoadingPlanNames(prev => ({ ...prev, [planId]: true }));
            const response = await fetchPlanById(planId);
            if (response.status) {
                setPlanNames(prev => ({
                    ...prev,
                    [planId]: response.data.name
                }));
            }
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin kế hoạch ${planId}:`, error);
            setPlanNames(prev => ({
                ...prev,
                [planId]: null
            }));
        } finally {
            setLoadingPlanNames(prev => ({ ...prev, [planId]: false }));
        }
    };

    const getTransactions = useCallback(async () => {
        try {
            setLoadingTransactions(true);
            const data = await fetchTransaction(userId, userRole);
            if (data.status) {
                // Sắp xếp để giao dịch chờ xác nhận hiển thị đầu tiên
                const sortedData = [...(data.data || [])].sort((a, b) => {
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                setTransactions(sortedData);
                
                // Fetch plan names for new transactions only
                sortedData.forEach(tx => {
                    if (tx.planId && !planNames[tx.planId] && !loadingPlanNames[tx.planId]) {
                        fetchPlanName(tx.planId);
                    }
                });
            } else {
                console.error('Không lấy được danh sách giao dịch:', data.message);
            }
        } catch (err) {
            console.error('Lỗi khi lấy danh sách giao dịch:', err.message);
        } finally {
            setLoadingTransactions(false);
        }
    }, [userId, userRole]);

    useEffect(() => {
        getTransactions();
    }, [getTransactions]);

    const confirmTransaction = useCallback(async (transactionId) => {
        try {
            setLoadingConfirm(prev => ({ ...prev, [transactionId]: true }));
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

            if (response.data.status) {
                getTransactions();
            } else {
                console.error('Không thể xác nhận giao dịch:', response.data.message);
            }
        } catch (err) {
            console.error('Lỗi khi xác nhận giao dịch:', err.message);
        } finally {
            setLoadingConfirm(prev => ({ ...prev, [transactionId]: false }));
        }
    }, [userId, userRole, getTransactions]);

    const filteredTransactions = transactions.filter((tx) => {
        const matchesSearch =
            (tx._id && tx._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.userId?.name && tx.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.userId?.email && tx.userId.email.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
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
                // Luôn ưu tiên giao dịch chờ xác nhận lên đầu
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;

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

    // Format date function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format currency function
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Handle row click
    const handleRowClick = (transaction) => {
        setSelectedTransaction(transaction);
    };

    // Close modal
    const closeModal = () => {
        setSelectedTransaction(null);
    };

    return (
        <div className="transactions-container">
            <div className="transactions-header">
                <h2>Quản lý Giao dịch</h2>
                <button
                    className="refresh-button"
                    onClick={getTransactions}
                    disabled={loadingTransactions}
                >
                    <FontAwesomeIcon style={{ width: 30, height: 30 }} icon={faSync} spin={loadingTransactions} />
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
            </div>

            <div className="table-responsive">
                {loadingTransactions ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : sortedTransactions.length === 0 ? (
                    <div className="no-data">
                        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
                        <p>Không tìm thấy giao dịch nào</p>
                    </div>
                ) : (
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('index')}>
                                    STT {getSortIcon('index')}
                                </th>
                                <th onClick={() => requestSort('userName')}>
                                    Người dùng {getSortIcon('userName')}
                                </th>
                                <th onClick={() => requestSort('userEmail')}>
                                    Email {getSortIcon('userEmail')}
                                </th>
                                <th onClick={() => requestSort('planId')}>
                                    Tên kế hoạch {getSortIcon('planId')}
                                </th>
                                <th onClick={() => requestSort('status')}>
                                    Trạng thái {getSortIcon('status')}
                                </th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTransactions.map((tx, index) => (
                                <tr key={tx._id} onClick={() => handleRowClick(tx)}>
                                    <td className="index-column">
                                        {index + 1}
                                    </td>
                                    <td data-full-text={tx.userId?.name || 'N/A'}>
                                        {tx.userId?.name || 'N/A'}
                                    </td>
                                    <td data-full-text={tx.userId?.email || 'N/A'}>
                                        {tx.userId?.email || 'N/A'}
                                    </td>
                                    <td data-full-text={loadingPlanNames[tx.planId] ? 'Đang tải...' : 
                                                    planNames[tx.planId] === null ? 'Không có tên kế hoạch' :
                                                    planNames[tx.planId] || 'Không có tên kế hoạch'}>
                                        {loadingPlanNames[tx.planId] ? 'Đang tải...' : 
                                        planNames[tx.planId] === null ? 'Không có tên kế hoạch' :
                                        planNames[tx.planId] || 'Không có tên kế hoạch'}
                                    </td>
                                    <td>{getStatusBadge(tx.status)}</td>
                                    <td>
                                        {tx.status === 'active' || tx.status === 'Đã đặt cọc' ? (
                                            <button 
                                                className="button-disabled" 
                                                disabled 
                                                title={tx.status === 'Đã đặt cọc' ? 'Giao dịch đã được đặt cọc' : 'Giao dịch đã được xác nhận'}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FontAwesomeIcon icon={faCheckCircle} /> Xác nhận
                                            </button>
                                        ) : (
                                            <button
                                                className="button-confirm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    confirmTransaction(tx._id);
                                                }}
                                                disabled={loadingConfirm[tx._id]}
                                                title="Nhấn để xác nhận giao dịch"
                                            >
                                                {loadingConfirm[tx._id] ? (
                                                    <div className="spinner small"></div>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faCheckCircle} /> Xác nhận
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Transaction Detail Modal */}
            {selectedTransaction && (
                <div className="transaction-modal-overlay" onClick={closeModal}>
                    <div className="transaction-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết Giao dịch</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="transaction-details">
                            <div className="detail-group transaction-id-group">
                                <span className="detail-label">Mã giao dịch</span>
                                <span className="detail-value transaction-id">{selectedTransaction._id}</span>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Người đặt cọc</span>
                                <span className="detail-value">{selectedTransaction.userId?.name || 'N/A'}</span>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{selectedTransaction.userId?.email || 'N/A'}</span>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Tên kế hoạch</span>
                                <span className="detail-value">
                                    {loadingPlanNames[selectedTransaction.planId] ? 'Đang tải...' : 
                                    planNames[selectedTransaction.planId] === null ? 'Không có tên kế hoạch' :
                                    planNames[selectedTransaction.planId] || 'Không có tên kế hoạch'}
                                </span>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Trạng thái</span>
                                <span className="detail-value status">
                                    {getStatusBadge(selectedTransaction.status)}
                                </span>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Ngày tạo giao dịch</span>
                                <span className="detail-value date">
                                    {formatDate(selectedTransaction.createdAt)}
                                </span>
                            </div>
                            {selectedTransaction.status === 'pending' && userRole === 'admin' && (
                                <div className="detail-group">
                                    <button
                                        className="button-confirm"
                                        onClick={() => {
                                            confirmTransaction(selectedTransaction._id);
                                            closeModal();
                                        }}
                                        disabled={loadingConfirm[selectedTransaction._id]}
                                    >
                                        {loadingConfirm[selectedTransaction._id] ? (
                                            <div className="spinner small"></div>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faCheckCircle} /> Xác nhận giao dịch
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Transactions;