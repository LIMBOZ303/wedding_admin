import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCateringById, updateCatering, deleteCatering } from '../api/catering_api';
import '../public/styles/CateringDetail.css'; 

const CateringDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cateringDetail, setCateringDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editData, setEditData] = useState({ name: ""});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getCateringById(id);
                console.log("Dữ liệu từ API:", response);

                if (response.status && response.data) {
                    setCateringDetail(response.data);
                    setEditData({
                        name: response.data.name,
                        price: response.data.price.toString(), 
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

    const formatNumberWithDots = (value) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handlePriceChange = (e) => {
        let rawValue = e.target.value.replace(/\D/g, '');
        rawValue = formatNumberWithDots(rawValue);
        setEditData({ ...editData, price: rawValue });
    };

    const handleUpdate = async () => {
        try {
            const updatedData = { 
                ...editData, 
                price: parseInt(editData.price.replace(/\./g, ''), 10) || 0
            };
            await updateCatering(id, updatedData);
            alert("Cập nhật thành công!");
            setCateringDetail({ ...cateringDetail, ...updatedData });
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
            
            <div className="edit-form">
                <h3>Chỉnh Sửa Thông Tin</h3>
                <input type="text" placeholder="Tên dịch vụ" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                <input type="text" placeholder="Giá dịch vụ" value={editData.price} onChange={handlePriceChange} />
                <textarea placeholder="Mô tả" value={editData.Description} onChange={(e) => setEditData({ ...editData, Description: e.target.value })}></textarea>
                <button onClick={handleUpdate} className="button-update">Cập Nhật</button>
                <button onClick={handleDelete} className="button-delete">Xóa</button>
            </div>
        </div>
    );
};

export default CateringDetail;
