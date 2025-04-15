import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import '../public/styles/Transaction.css';
import { fetchTransaction } from '../api/transaction_api';
import { fetchPlanById } from '../api/plan_api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faExclamationTriangle,
    faSearch,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [loadingConfirm, setLoadingConfirm] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [planNames, setPlanNames] = useState({});
    const [loadingPlanNames, setLoadingPlanNames] = useState({});
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    
    // Sử dụng useRef để tránh re-render không cần thiết
    const planRequestsInProgress = useRef(new Set());
    const lastFetchTime = useRef(Date.now());
    const isMounted = useRef(true);

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Hàm lấy thông tin tên kế hoạch với debounce
    const fetchPlanName = useCallback(async (planId) => {
        if (loadingPlanNames[planId] || planNames[planId] || planRequestsInProgress.current.has(planId)) return;

        planRequestsInProgress.current.add(planId);
        try {
            setLoadingPlanNames(prev => ({ ...prev, [planId]: true }));
            const response = await fetchPlanById(planId);
            if (isMounted.current) {
                if (response.status) {
                    setPlanNames(prev => ({
                        ...prev,
                        [planId]: response.data.name
                    }));
                }
            }
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin kế hoạch ${planId}:`, error);
            if (isMounted.current) {
                setPlanNames(prev => ({
                    ...prev,
                    [planId]: null
                }));
            }
        } finally {
            planRequestsInProgress.current.delete(planId);
            if (isMounted.current) {
                setLoadingPlanNames(prev => ({ ...prev, [planId]: false }));
            }
        }
    }, []);

    // Batch fetch plan names
    const batchFetchPlanNames = useCallback(async (transactions) => {
        const uniquePlanIds = new Set();
        transactions.forEach(tx => {
            if (tx.planId && !planNames[tx.planId] && !loadingPlanNames[tx.planId]) {
                uniquePlanIds.add(tx.planId);
            }
        });

        // Fetch in batches of 5
        const batchSize = 5;
        const planIdArray = Array.from(uniquePlanIds);
        for (let i = 0; i < planIdArray.length; i += batchSize) {
            const batch = planIdArray.slice(i, i + batchSize);
            await Promise.all(batch.map(planId => fetchPlanName(planId)));
        }
    }, [fetchPlanName, planNames, loadingPlanNames]);

    const getTransactions = useCallback(async (force = false) => {
        // Tránh gọi API quá thường xuyên
        const now = Date.now();
        if (!force && now - lastFetchTime.current < 5000) { // 5 giây
            return;
        }

        try {
            setLoadingTransactions(true);
            lastFetchTime.current = now;

            const data = await fetchTransaction(userId, userRole);
            if (!isMounted.current) return;

            if (data.status) {
                // Sắp xếp để giao dịch chờ xác nhận hiển thị đầu tiên
                const sortedData = [...(data.data || [])].sort((a, b) => {
                    if (a.status === 'Chưa kích hoạt' && b.status !== 'Chưa kích hoạt') return -1;
                    if (a.status !== 'Chưa kích hoạt' && b.status === 'Chưa kích hoạt') return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setTransactions(sortedData);
                
                // Batch fetch plan names
                await batchFetchPlanNames(sortedData);
            } else {
                console.error('Không lấy được danh sách giao dịch:', data.message);
            }
        } catch (err) {
            console.error('Lỗi khi lấy danh sách giao dịch:', err.message);
        } finally {
            if (isMounted.current) {
                setLoadingTransactions(false);
            }
        }
    }, [userId, userRole, batchFetchPlanNames]);

    // Initial fetch
    useEffect(() => {
        getTransactions(true);
    }, [getTransactions]);

    // Auto refresh with increasing interval
    useEffect(() => {
        let interval = 30000; // Start with 30 seconds
        const maxInterval = 300000; // Max 5 minutes
        
        const intervalId = setInterval(() => {
            if (document.hidden) {
                // Increase interval when tab is not visible
                interval = Math.min(interval * 1.5, maxInterval);
            } else {
                // Reset to 30 seconds when tab becomes visible
                interval = 30000;
            }
            getTransactions();
        }, interval);

        // Reset interval when tab becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                getTransactions(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [getTransactions]);

    const confirmTransaction = useCallback(async (transactionId) => {
        if (loadingConfirm[transactionId]) return;

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
                // Cập nhật local state trước khi gọi API
                setTransactions(prev => 
                    prev.map(tx => 
                        tx._id === transactionId 
                            ? { ...tx, status: 'Đã kích hoạt' }
                            : tx
                    )
                );
                
                // Sau đó mới gọi API để refresh
                getTransactions(true);
            } else {
                console.error('Không thể xác nhận giao dịch:', response.data.message);
            }
        } catch (err) {
            console.error('Lỗi khi xác nhận giao dịch:', err.message);
        } finally {
            if (isMounted.current) {
                setLoadingConfirm(prev => ({ ...prev, [transactionId]: false }));
            }
        }
    }, [userId, userRole, getTransactions]);

    // Tính toán danh sách giao dịch đã lọc
    const filteredTransactions = React.useMemo(() => {
        return transactions.filter((tx) => {
            if (!searchTerm) return true;
            
            const searchString = searchTerm.toLowerCase();
            return (
                (tx._id && tx._id.toLowerCase().includes(searchString)) ||
                (tx.userId?.name && tx.userId.name.toLowerCase().includes(searchString)) ||
                (tx.userId?.email && tx.userId.email.toLowerCase().includes(searchString)) ||
                (planNames[tx.planId] && planNames[tx.planId].toLowerCase().includes(searchString))
            );
        });
    }, [transactions, searchTerm, planNames]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = React.useMemo(() => {
        let sortableItems = [...filteredTransactions];
        
        // Luôn ưu tiên giao dịch chờ xác nhận lên đầu
        sortableItems.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt); // Mới nhất lên đầu
        });

        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'userName') {
                    aValue = a.userId?.name || '';
                    bValue = b.userId?.name || '';
                } else if (sortConfig.key === 'userEmail') {
                    aValue = a.userId?.email || '';
                    bValue = b.userId?.email || '';
                } else if (sortConfig.key === 'planName') {
                    aValue = planNames[a.planId] || '';
                    bValue = planNames[b.planId] || '';
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
    }, [filteredTransactions, sortConfig, planNames]);

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Đã kích hoạt':
                return (
                    <span className="status-badge status-active">
                        <FontAwesomeIcon icon={faCheckCircle} /> Đã xác nhận
                    </span>
                );
            case 'Chưa kích hoạt':
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
                <div className="header-actions">
                    <div className="search-container">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã, tên, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="clear-search">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="transactions-content">
                {loadingTransactions ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="no-data">
                        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
                        <p>Không tìm thấy giao dịch nào</p>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="clear-search-button">
                                Xóa tìm kiếm
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th onClick={() => requestSort('index')} className="sortable">
                                        STT {getSortIcon('index')}
                                    </th>
                                    <th onClick={() => requestSort('userName')} className="sortable">
                                        Người dùng {getSortIcon('userName')}
                                    </th>
                                    <th onClick={() => requestSort('userEmail')} className="sortable">
                                        Email {getSortIcon('userEmail')}
                                    </th>
                                    <th onClick={() => requestSort('planName')} className="sortable">
                                        Tên kế hoạch {getSortIcon('planName')}
                                    </th>
                                    <th onClick={() => requestSort('status')} className="sortable">
                                        Trạng thái {getSortIcon('status')}
                                    </th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTransactions.map((tx, index) => (
                                    <tr 
                                        key={tx._id} 
                                        onClick={() => handleRowClick(tx)}
                                        className={tx.status === 'Chưa kích hoạt' ? 'pending-row' : ''}
                                    >
                                        <td className="index-column">
                                            {index + 1}
                                        </td>
                                        <td data-full-text={tx.userId?.name || 'N/A'}>
                                            {tx.userId?.name || 'N/A'}
                                        </td>
                                        <td data-full-text={tx.userId?.email || 'N/A'}>
                                            {tx.userId?.email || 'N/A'}
                                        </td>
                                        <td data-full-text={planNames[tx.planId] || 'Không có tên kế hoạch'}>
                                            {planNames[tx.planId] || 'Không có tên kế hoạch'}
                                        </td>
                                        <td>{getStatusBadge(tx.status)}</td>
                                        <td>
                                            {tx.status === 'Đã kích hoạt' ? (
                                                <button 
                                                    className="button-disabled" 
                                                    disabled 
                                                    title="Giao dịch đã được xác nhận"
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
                    </div>
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
                                    {loadingPlanNames[selectedTransaction.planId] ? (
                                        <div className="loading-name">
                                            <div className="loading-spinner small"></div>
                                            <span>Đang tải...</span>
                                        </div>
                                    ) : (
                                        planNames[selectedTransaction.planId] === null ? 'Không có tên kế hoạch' :
                                        planNames[selectedTransaction.planId] || 'Không có tên kế hoạch'
                                    )}
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
                            {selectedTransaction.status === 'Chưa kích hoạt' && userRole === 'admin' && (
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