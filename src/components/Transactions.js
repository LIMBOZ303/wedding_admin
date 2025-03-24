import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { fetchTransaction } from '../api/transaction_api';
import LoadingSpinner from '../components/LoadingSpinner';

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

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
                    position: 'top-end',
                    icon: 'success',
                    title: 'Đã lấy danh sách giao dịch',
                    showConfirmButton: false,
                    timer: 1500
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

    return (
        <div style={{ padding: '20px' }}>
            <h2>Danh sách Giao dịch</h2>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <table
                    border="1"
                    cellPadding="8"
                    style={{ borderCollapse: 'collapse', width: '100%' }}
                >
                    <thead>
                        <tr>
                            <th>Mã giao dịch</th>
                            <th>Người dùng</th>
                            <th>Email</th>
                            <th>Gói (planId)</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="6">Không có giao dịch nào</td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx._id}>
                                    <td>{tx._id}</td>
                                    <td>{tx.userId?.name || 'N/A'}</td>
                                    <td>{tx.userId?.email || 'N/A'}</td>
                                    <td>{tx.planId || 'N/A'}</td>
                                    <td>{tx.status}</td>
                                    <td>
                                        {tx.status === 'active' ? (
                                            <span style={{ color: 'green', fontWeight: 'bold' }}>
                                                Đã xác nhận
                                            </span>
                                        ) : (
                                            <button onClick={() => confirmTransaction(tx._id)}>
                                                Xác nhận
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Transactions;
