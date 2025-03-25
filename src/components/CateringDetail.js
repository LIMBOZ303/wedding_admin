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
                alert("Cập nhật thành công!");
                setCateringDetail(prev => ({ ...prev, name: editName }));
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

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="catering-detail">
            <h2>Chi Tiết Dịch Vụ</h2>
            {cateringDetail?.imageUrl && (
                <img src={cateringDetail.imageUrl} alt={cateringDetail.name} />
            )}
            <div className="edit-form">
                <h3>Chỉnh Sửa Thông Tin</h3>
                <input 
                    type="text" 
                    placeholder="Tên dịch vụ" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                />
                <button onClick={handleUpdate} className="button-update">Cập Nhật</button>
                <button onClick={handleDelete} className="button-delete">Xóa</button>
            </div>
        </div>
    );
};

export default CateringDetail;
