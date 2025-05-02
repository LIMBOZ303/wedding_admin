import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../LoadingSpinner';
import { formatDate, getStatusBadge } from './utils';

const TransactionList = ({
    transactions,
    filteredTransactions,
    sortedTransactions,
    loadingTransactions,
    error,
    searchTerm,
    transactionStatusFilter,
    sortConfig,
    onRowClick,
    onSearchChange,
    onStatusFilterChange,
    onSort,
    getSortIcon
}) => {
    return (
        <div className="transactions-container">
            <div className="transactions-header">
                <h2>Quản lý Giao dịch</h2>
                <div className="header-actions">
                    <div className="status-filter-container">
                        <label htmlFor="status-filter">Lọc theo trạng thái: </label>
                        <select
                            id="status-filter"
                            value={transactionStatusFilter}
                            onChange={onStatusFilterChange}
                            className="status-filter"
                        >
                            <option value="all">Tất cả</option>
                            <option value="Đang chờ">Chờ xác nhận</option>
                            <option value="Đã đặt cọc">Đã đặt cọc</option>
                            <option value="Đã hủy">Đã hủy</option>
                        </select>
                    </div>
                    <div className="search-container">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã, tên, email..."
                            value={searchTerm}
                            onChange={onSearchChange}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button onClick={() => onSearchChange({ target: { value: '' } })} className="clear-search">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="transactions-content">
                {loadingTransactions ? (
                    <LoadingSpinner size="large" text="Đang tải dữ liệu..." />
                ) : transactions.length === 0 ? (
                    <div className="no-data">
                        <FontAwesomeIcon icon={faTimes} size="2x" />
                        <p>Không có giao dịch nào trong hệ thống</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="no-data">
                        <FontAwesomeIcon icon={faTimes} size="2x" />
                        <p>Không tìm thấy giao dịch khớp với tìm kiếm hoặc bộ lọc</p>
                        <button
                            onClick={() => {
                                onSearchChange({ target: { value: '' } });
                                onStatusFilterChange({ target: { value: 'all' } });
                            }}
                            className="clear-search-button"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th onClick={() => onSort('index')} className="sortable">
                                        STT {getSortIcon('index')}
                                    </th>
                                    <th onClick={() => onSort('userName')} className="sortable">
                                        Người dùng {getSortIcon('userName')}
                                    </th>
                                    <th onClick={() => onSort('userEmail')} className="sortable">
                                        Email {getSortIcon('userEmail')}
                                    </th>
                                    <th onClick={() => onSort('planName')} className="sortable">
                                        Tên kế hoạch {getSortIcon('planName')}
                                    </th>
                                    <th onClick={() => onSort('status')} className="sortable">
                                        Trạng thái {getSortIcon('status')}
                                    </th>
                                    <th onClick={() => onSort('createdAt')} className="sortable">
                                        Ngày tạo {getSortIcon('createdAt')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTransactions.map((tx, index) => (
                                    <tr
                                        key={tx._id || index}
                                        onClick={() => onRowClick(tx)}
                                        className={tx.status === 'Chưa kích hoạt' ? 'pending-row' : ''}
                                    >
                                        <td className="index-column">{index + 1}</td>
                                        <td>{tx.userId?.name || 'N/A'}</td>
                                        <td>{tx.userId?.email || 'N/A'}</td>
                                        <td>{tx.planName || 'Không có tên kế hoạch'}</td>
                                        <td>{getStatusBadge(tx.status)}</td>
                                        <td>{formatDate(tx.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionList; 