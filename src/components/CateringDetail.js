import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCatering, updateCatering, deleteCatering } from '../api/catering_api';
import '../public/styles/CateringDetail.css'; 

const CateringDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cateringDetail, setCateringDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editName, setEditName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchCatering();
                // Tìm món ăn có _id khớp với id từ params
                const item = response.data.find(item => item._id === id);
                if (item) {
                    setCateringDetail(item);
                    setEditName(item.name);
                } else {
                    setError("Không tìm thấy dịch vụ catering.");
                }
            } catch (err) {
                console.error("Lỗi khi tải chi tiết dịch vụ:", err);
                setError("Lỗi khi tải chi tiết dịch vụ.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleUpdate = async () => {
        try {
            // Chỉ cập nhật tên dịch vụ
            const updatedData = { name: editName };
            const res = await updateCatering(id, updatedData);
            if (res.status) {
                setUpdateSuccess(true);
                setCateringDetail(prev => ({ ...prev, name: editName }));
                setIsEditing(false);
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    setUpdateSuccess(false);
                }, 3000);
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật dịch vụ:", err);
            alert("Lỗi khi cập nhật dịch vụ!");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
            try {
                const res = await deleteCatering(id);
                if (res.status) {
                    alert("Xóa thành công!");
                    navigate("/");
                }
            } catch (err) {
                console.error("Lỗi khi xóa dịch vụ:", err);
                alert("Lỗi khi xóa dịch vụ!");
            }
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin...</p>
        </div>
    );
    
    if (error) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="back-button" onClick={() => navigate(-1)}>Quay lại</button>
        </div>
    );

    return (
        <div className="catering-detail-container">
            <div className="catering-detail-card">
                <div className="catering-header">
                    <h2>Chi Tiết Dịch Vụ</h2>
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <span>←</span> Quay lại
                    </button>
                </div>
                
                {updateSuccess && (
                    <div className="success-message">
                        Cập nhật thành công!
                    </div>
                )}
                
                <div className="catering-content">
                    <div className="catering-image-container">
                        {cateringDetail?.imageUrl ? (
                            <img 
                                src={cateringDetail.imageUrl} 
                                alt={cateringDetail.name} 
                                className="catering-image"
                            />
                        ) : (
                            <div className="no-image">
                                <span>Không có hình ảnh</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="catering-info">
                        <div className="info-group">
                            <label>ID:</label>
                            <p>{cateringDetail?._id}</p>
                        </div>
                        
                        <div className="info-group">
                            <label>Tên dịch vụ:</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editName} 
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="edit-input"
                                    autoFocus
                                />
                            ) : (
                                <p>{cateringDetail?.name}</p>
                            )}
                        </div>
                        
                        {cateringDetail?.description && (
                            <div className="info-group">
                                <label>Mô tả:</label>
                                <p>{cateringDetail.description}</p>
                            </div>
                        )}
                        
                        {cateringDetail?.price && (
                            <div className="info-group">
                                <label>Giá:</label>
                                <p className="price">{cateringDetail.price.toLocaleString()} VNĐ</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="action-buttons">
                    {isEditing ? (
                        <>
                            <button onClick={handleUpdate} className="button-update">
                                Lưu thay đổi
                            </button>
                            <button onClick={() => {
                                setIsEditing(false);
                                setEditName(cateringDetail?.name || "");
                            }} className="button-cancel">
                                Hủy
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="button-edit">
                                Chỉnh sửa
                            </button>
                            <button onClick={handleDelete} className="button-delete">
                                Xóa
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CateringDetail;
