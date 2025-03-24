import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCateringById, updateCatering, deleteCatering } from '../api/catering_api';
import '../public/styles/CateringDetail.css';

const CateringDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cateringDetail, setCateringDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await getCateringById(id);
            // Kiểm tra cấu trúc dữ liệu trả về từ API
            if (response && response.data && response.data.data) {
                setCateringDetail(response.data.data);
            } else {
                alert("Không tìm thấy thông tin chi tiết của dịch vụ.");
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết dịch vụ:", error);
            alert("Có lỗi xảy ra khi lấy thông tin chi tiết.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Hàm cập nhật (dữ liệu mẫu)
    const handleUpdate = async () => {
        const updatedData = {
            name: "Tên cập nhật",
            price: 100,
            cate_cateringId: "cate123",
            Description: "Mô tả cập nhật",
            imageUrl: "http://example.com/image.jpg"
        };

        setLoading(true);
        try {
            const response = await updateCatering(id, updatedData);
            if (response && response.data && response.data.data) {
                setCateringDetail(response.data.data);
                alert("Cập nhật thành công!");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật dịch vụ:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xóa dịch vụ
    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) {
            setLoading(true);
            try {
                await deleteCatering(id);
                alert("Xóa thành công!");
                navigate("/"); // Quay lại trang danh sách sau khi xóa
            } catch (error) {
                console.error("Lỗi khi xóa dịch vụ:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="catering-detail-container">
            <h2>Chi tiết Dịch vụ Catering</h2>
            {loading ? (
                <div className="spinner-container">
                    <div className="loading-spinner"></div>
                </div>
            ) : cateringDetail ? (
                <div className="detail-card-content">
                    <h3>{cateringDetail.name}</h3>
                    {cateringDetail.imageUrl && (
                        <img src={cateringDetail.imageUrl} alt={cateringDetail.name} />
                    )}
                    <p>
                        <strong>Mô tả:</strong> {cateringDetail.Description || cateringDetail.description}
                    </p>
                    <p>
                        <strong>Giá:</strong> {cateringDetail.price}
                    </p>
                    <p>
                        <strong>Danh mục:</strong>{" "}
                        {cateringDetail.cate_cateringId && cateringDetail.cate_cateringId.name
                            ? cateringDetail.cate_cateringId.name
                            : "Chưa xác định"}
                    </p>
                    <p>
                        <strong>Ngày tạo:</strong> {new Date(cateringDetail.createdAt).toLocaleString()}
                    </p>
                    <p>
                        <strong>Ngày cập nhật:</strong> {new Date(cateringDetail.updatedAt).toLocaleString()}
                    </p>
                    <div className="detail-card-buttons">
                        <button onClick={handleUpdate} className="button-update">
                            Cập Nhật
                        </button>
                        <button onClick={handleDelete} className="button-delete">
                            Xóa
                        </button>
                        <button onClick={() => navigate(-1)} className="button-back">
                            Quay lại
                        </button>
                    </div>
                </div>
            ) : (
                <p>Không có dữ liệu để hiển thị.</p>
            )}
        </div>
    );
};

export default CateringDetail;
