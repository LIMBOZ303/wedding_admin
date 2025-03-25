import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCateringById, updateCatering, deleteCatering } from '../api/catering_api';

const CateringDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cateringDetail, setCateringDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editData, setEditData] = useState({ name: "", price: "", Description: "" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getCateringById(id);
                console.log("Dữ liệu từ API:", response);

                if (response.status && response.data) {
                    setCateringDetail(response.data);
                    setEditData({
                        name: response.data.name,
                        price: response.data.price,
                        Description: response.data.Description
                    });
                } else {
                    setError("Không tìm thấy dịch vụ catering.");
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết dịch vụ:", error);
                setError("Lỗi khi tải chi tiết dịch vụ.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleUpdate = async () => {
        try {
            await updateCatering(id, editData);
            alert("Cập nhật thành công!");
            setCateringDetail({ ...cateringDetail, ...editData });
        } catch (error) {
            alert("Lỗi khi cập nhật dịch vụ!");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
            try {
                await deleteCatering(id);
                alert("Xóa thành công!");
                navigate("/");
            } catch (error) {
                alert("Lỗi khi xóa dịch vụ!");
            }
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="catering-detail">
            <h2>Chi Tiết Dịch Vụ</h2>
            {cateringDetail?.imageUrl && <img src={cateringDetail.imageUrl} alt={cateringDetail.name} />}
            <p><strong>Mô tả:</strong> {cateringDetail?.Description || "Không có mô tả"}</p>
            <p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cateringDetail?.price)}</p>
            <p><strong>Danh mục ID:</strong> {cateringDetail?.cate_cateringId || "Không xác định"}</p>
            <p><strong>Ngày tạo:</strong> {new Date(cateringDetail?.createdAt).toLocaleString()}</p>
            
            <div className="edit-form">
                <h3>Chỉnh Sửa Thông Tin</h3>
                <input type="text" placeholder="Tên dịch vụ" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                <input type="number" placeholder="Giá dịch vụ" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} />
                <textarea placeholder="Mô tả" value={editData.Description} onChange={(e) => setEditData({ ...editData, Description: e.target.value })}></textarea>
                <button onClick={handleUpdate} className="button-update">Cập Nhật</button>
                <button onClick={handleDelete} className="button-delete">Xóa</button>
            </div>
        </div>
    );
};

export default CateringDetail;
