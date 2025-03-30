import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  fetchDecorateCategories,
  fetchDecorate,
  fetchDecorateById,
  fetchDecorateDetail,
  addDecorate,
  updateDecorate,
  deleteDecorate
} from '../api/decorate_api';
import {
  fetchFood,
  fetchFoodById,
  fetchFoodDetail,
  addFood,
  updateFood,
  deleteFood
} from '../api/food_api';
import {
  fetchCatering,
  fetchCateringById,
  fetchCateringDetail,
  addCatering,
  updateCatering,
  deleteCatering,
  fetchCateringCategories
} from '../api/catering_api';
import {
  fetchGifts,
  fetchGiftById,
  fetchGiftDetail,
  addGift,
  updateGift,
  deleteGift,
  fetchGiftCategories
} from '../api/gift_api';
import {
  fetchLobbies,
  fetchLobbyById,
  addLobby,
  updateLobby,
  deleteLobby
} from '../api/order_api';
import '../public/styles/ProductManagement.css';

const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState("DichVu");

  const [foodList, setFoodList] = useState([]);
  const [decorateList, setDecorateList] = useState([]);
  const [giftList, setGiftList] = useState([]);
  const [cateringList, setCateringList] = useState([]);
  const [lobbyList, setLobbyList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // --- State chỉnh sửa cho món ăn và quà tặng ---
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCate, setEditCate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // --- State thêm mới cho món ăn ---
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCate, setNewCate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // --- State for image upload ---
  const [selectedImage, setSelectedImage] = useState(null);
  const [editSelectedImage, setEditSelectedImage] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [addFormType, setAddFormType] = useState("food");
  const [giftCategories, setGiftCategories] = useState([]);
  const [decorateCategories, setDecorateCategories] = useState([]);
  const [cateringCategories, setCateringCategories] = useState([]);

  useEffect(() => {
    if (activeTab === "DichVu") {
      getFoodData();
      getCateringCategories();
      setAddFormType("food");
    } else if (activeTab === "TrangTri") {
      getDecorateData();
      getDecorateCategories();
      setAddFormType("decorate");
    } else if (activeTab === "QuaTang") {
      getGiftData();
      getGiftCategories();
      setAddFormType("gift");
    } else if (activeTab === "Order") {
      getLobbyData();
      setAddFormType("lobby");
    }
  }, [activeTab]);

  // ===== Call API cho Món Ăn =====
  const getFoodData = async () => {
    setLoading(true);
    try {
      const data = await fetchFood();
      setFoodList(data.data);
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể lấy danh sách món ăn.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== Call API cho Trang Trí =====
  const getDecorateData = async () => {
    setLoading(true);
    try {
      const data = await fetchDecorate();
      setDecorateList(data.data);
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể lấy danh sách trang trí.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== Call API cho Quà Tặng =====
  const getGiftData = async () => {
    setLoading(true);
    try {
      const data = await fetchGifts();
      setGiftList(data.data);
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể lấy danh sách quà tặng.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== Call API cho các tab khác =====
  const getCateringData = async () => {
    setLoading(true);
    try {
      const data = await fetchCatering();
      setCateringList(data.data);
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể lấy danh sách.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== Call API cho Hall=====
  const getLobbyData = async () => {
    setLoading(true);
    try {
      const data = await fetchLobbies();
      setLobbyList(data.data);
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể lấy danh sách phòng/sảnh.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getGiftCategories = async () => {
    try {
      const data = await fetchGiftCategories();
      if (data.status && data.data) {
        setGiftCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching gift categories:", error);
    }
  };

  const getDecorateCategories = async () => {
    try {
      const data = await fetchDecorateCategories();
      if (data.status && data.data) {
        setDecorateCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching decoration categories:", error);
    }
  };

  const getCateringCategories = async () => {
    try {
      const data = await fetchCateringCategories();
      if (data.status && data.data) {
        setCateringCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching catering categories:", error);
    }
  };

  const filteredList = () => {
    let list = [];
    if (activeTab === "DichVu") {
      list = foodList;
    } else if (activeTab === "TrangTri") {
      list = decorateList;
    } else if (activeTab === "QuaTang") {
      list = giftList;
    } else if (activeTab === "Order") {
      list = lobbyList;
    }
    return filterText
      ? list.filter(item =>
        item.name.toLowerCase().includes(filterText.toLowerCase())
      )
      : list;
  };

  // Khi nhấn "Chi Tiết"
  const handleShowDetail = async (id) => {
    try {
      setLoading(true);

      if (activeTab === "DichVu") {
        // Xử lý chi tiết món ăn (giữ nguyên code cũ)
        const localItem = foodList.find(item => item._id === id);

        if (!localItem) {
          Swal.fire("Lỗi!", "Không tìm thấy thông tin món ăn trong danh sách.", "error");
          setLoading(false);
          return;
        }

        setSelectedItem({ ...localItem, type: activeTab });
        setEditName(localItem.name || "");
        setEditPrice(localItem.price || "");

        // Handle cate_cateringId which could be an object or a string
        if (localItem.cate_cateringId) {
          if (typeof localItem.cate_cateringId === 'object' && localItem.cate_cateringId._id) {
            setEditCate(localItem.cate_cateringId._id);
          } else {
            setEditCate(localItem.cate_cateringId);
          }
        } else {
          setEditCate("");
        }

        setEditDescription(localItem.description || "");
        setEditImageUrl(localItem.imageUrl || "");

        try {
          console.log(`Đang gọi API lấy chi tiết món ăn với ID: ${id}`);
          const res = await fetchFoodById(id);
          console.log("Kết quả từ fetchFoodById:", res);

          if (res && res.status && res.data) {
            const food = res.data;
            setSelectedItem({ ...food, type: activeTab });
            setEditName(food.name || "");
            setEditPrice(food.price || "");

            // Handle cate_cateringId which could be an object or a string
            if (food.cate_cateringId) {
              if (typeof food.cate_cateringId === 'object' && food.cate_cateringId._id) {
                setEditCate(food.cate_cateringId._id);
              } else {
                setEditCate(food.cate_cateringId);
              }
            } else {
              setEditCate("");
            }

            setEditDescription(food.description || "");
            setEditImageUrl(food.imageUrl || "");
            console.log("Đã cập nhật thông tin từ fetchFoodById");
          }
        } catch (error) {
          console.log("Lỗi khi gọi fetchFoodById, đang thử fetchFoodDetail:", error);

          try {
            const res = await fetchFoodDetail(id);
            console.log("Kết quả từ fetchFoodDetail:", res);

            if (res && res.status && res.data) {
              const food = res.data;
              setSelectedItem({ ...food, type: activeTab });
              setEditName(food.name || "");
              setEditPrice(food.price || "");

              // Handle cate_cateringId which could be an object or a string
              if (food.cate_cateringId) {
                if (typeof food.cate_cateringId === 'object' && food.cate_cateringId._id) {
                  setEditCate(food.cate_cateringId._id);
                } else {
                  setEditCate(food.cate_cateringId);
                }
              } else {
                setEditCate("");
              }

              setEditDescription(food.description || "");
              setEditImageUrl(food.imageUrl || "");
              console.log("Đã cập nhật thông tin từ fetchFoodDetail");
            }
          } catch (detailError) {
            console.log("Cả hai API calls đều thất bại, giữ nguyên dữ liệu ban đầu:", detailError);
          }
        }
      } else if (activeTab === "QuaTang") {
        // Xử lý chi tiết quà tặng
        const localItem = giftList.find(item => item._id === id);

        if (!localItem) {
          Swal.fire("Lỗi!", "Không tìm thấy thông tin quà tặng trong danh sách.", "error");
          setLoading(false);
          return;
        }

        setSelectedItem({ ...localItem, type: activeTab });
        setEditName(localItem.name || "");
        setEditPrice(localItem.price || "");

        // Handle Cate_presentId which could be an object or a string
        if (localItem.Cate_presentId) {
          if (typeof localItem.Cate_presentId === 'object' && localItem.Cate_presentId._id) {
            setEditCate(localItem.Cate_presentId._id);
          } else {
            setEditCate(localItem.Cate_presentId);
          }
        } else {
          setEditCate("");
        }

        setEditDescription(localItem.Description || "");
        setEditImageUrl(localItem.imageUrl || "");
        setEditStatus(localItem.Status || "");

        try {
          console.log(`Đang gọi API lấy chi tiết quà tặng với ID: ${id}`);
          const res = await fetchGiftById(id);
          console.log("Kết quả từ fetchGiftById:", res);

          if (res && res.status && res.data) {
            const gift = res.data;
            setSelectedItem({ ...gift, type: activeTab });
            setEditName(gift.name || "");
            setEditPrice(gift.price || "");

            // Handle Cate_presentId which could be an object or a string
            if (gift.Cate_presentId) {
              if (typeof gift.Cate_presentId === 'object' && gift.Cate_presentId._id) {
                setEditCate(gift.Cate_presentId._id);
              } else {
                setEditCate(gift.Cate_presentId);
              }
            } else {
              setEditCate("");
            }

            setEditDescription(gift.Description || "");
            setEditImageUrl(gift.imageUrl || "");
            setEditStatus(gift.Status || "");
            console.log("Đã cập nhật thông tin từ fetchGiftById");
          }
        } catch (error) {
          console.log("Lỗi khi gọi fetchGiftById, đang thử fetchGiftDetail:", error);

          try {
            const res = await fetchGiftDetail(id);
            console.log("Kết quả từ fetchGiftDetail:", res);

            if (res && res.status && res.data) {
              const gift = res.data;
              setSelectedItem({ ...gift, type: activeTab });
              setEditName(gift.name || "");
              setEditPrice(gift.price || "");

              // Handle Cate_presentId which could be an object or a string
              if (gift.Cate_presentId) {
                if (typeof gift.Cate_presentId === 'object' && gift.Cate_presentId._id) {
                  setEditCate(gift.Cate_presentId._id);
                } else {
                  setEditCate(gift.Cate_presentId);
                }
              } else {
                setEditCate("");
              }

              setEditDescription(gift.Description || "");
              setEditImageUrl(gift.imageUrl || "");
              setEditStatus(gift.Status || "");
              console.log("Đã cập nhật thông tin từ fetchGiftDetail");
            }
          } catch (detailError) {
            console.log("Cả hai API calls đều thất bại, giữ nguyên dữ liệu ban đầu:", detailError);
          }
        }
      } else if (activeTab === "TrangTri") {
        // Xử lý chi tiết sản phẩm trang trí
        const localItem = decorateList.find(item => item._id === id);

        if (!localItem) {
          Swal.fire("Lỗi!", "Không tìm thấy thông tin trang trí trong danh sách.", "error");
          setLoading(false);
          return;
        }

        setSelectedItem({ ...localItem, type: activeTab });
        setEditName(localItem.name || "");
        setEditPrice(localItem.price || "");

        // Handle Cate_decorateId which could be an object or a string
        if (localItem.Cate_decorateId) {
          if (typeof localItem.Cate_decorateId === 'object' && localItem.Cate_decorateId._id) {
            setEditCate(localItem.Cate_decorateId._id);
          } else {
            setEditCate(localItem.Cate_decorateId);
          }
        } else {
          setEditCate("");
        }

        setEditDescription(localItem.Description || "");
        setEditImageUrl(localItem.imageUrl || "");
        setEditStatus(localItem.Status || "");

        try {
          console.log(`Đang gọi API lấy chi tiết trang trí với ID: ${id}`);
          const res = await fetchDecorateById(id);
          console.log("Kết quả từ fetchDecorateById:", res);

          if (res && res.status && res.data) {
            const decorate = res.data;
            setSelectedItem({ ...decorate, type: activeTab });
            setEditName(decorate.name || "");
            setEditPrice(decorate.price || "");

            // Handle Cate_decorateId which could be an object or a string
            if (decorate.Cate_decorateId) {
              if (typeof decorate.Cate_decorateId === 'object' && decorate.Cate_decorateId._id) {
                setEditCate(decorate.Cate_decorateId._id);
              } else {
                setEditCate(decorate.Cate_decorateId);
              }
            } else {
              setEditCate("");
            }

            setEditDescription(decorate.Description || "");
            setEditImageUrl(decorate.imageUrl || "");
            setEditStatus(decorate.Status || "");
            console.log("Đã cập nhật thông tin từ fetchDecorateById");
          }
        } catch (error) {
          console.log("Lỗi khi gọi fetchDecorateById, đang thử fetchDecorateDetail:", error);

          try {
            const res = await fetchDecorateDetail(id);
            console.log("Kết quả từ fetchDecorateDetail:", res);

            if (res && res.status && res.data) {
              const decorate = res.data;
              setSelectedItem({ ...decorate, type: activeTab });
              setEditName(decorate.name || "");
              setEditPrice(decorate.price || "");

              // Handle Cate_decorateId which could be an object or a string
              if (decorate.Cate_decorateId) {
                if (typeof decorate.Cate_decorateId === 'object' && decorate.Cate_decorateId._id) {
                  setEditCate(decorate.Cate_decorateId._id);
                } else {
                  setEditCate(decorate.Cate_decorateId);
                }
              } else {
                setEditCate("");
              }

              setEditDescription(decorate.Description || "");
              setEditImageUrl(decorate.imageUrl || "");
              setEditStatus(decorate.Status || "");
              console.log("Đã cập nhật thông tin từ fetchDecorateDetail");
            }
          } catch (detailError) {
            console.log("Cả hai API calls đều thất bại, giữ nguyên dữ liệu ban đầu:", detailError);
          }
        }
      } else if (activeTab === "Order") {
        // Xử lý chi tiết phòng/sảnh
        const localItem = lobbyList.find(item => item._id === id);
        if (!localItem) {
          Swal.fire("Lỗi!", "Không tìm thấy thông tin phòng/sảnh.", "error");
          setLoading(false);
          return;
        }

        setSelectedItem({ ...localItem, type: activeTab });
        setEditName(localItem.name || "");
        setEditPrice(localItem.price || "");
        setEditDescription(localItem.SoLuongKhach || "");
        setEditImageUrl(localItem.imageUrl || "");

        try {
          console.log(`Đang gọi API lấy chi tiết phòng/sảnh với ID: ${id}`);
          const res = await fetchLobbyById(id);
          console.log("Kết quả từ fetchLobbyById:", res);

          if (res && res.status && res.data) {
            const lobby = res.data;
            setSelectedItem({ ...lobby, type: activeTab });
            setEditName(lobby.name || "");
            setEditPrice(lobby.price || "");
            setEditDescription(lobby.SoLuongKhach || "");
            setEditImageUrl(lobby.imageUrl || "");
            console.log("Đã cập nhật thông tin từ fetchLobbyById");
          }
        } catch (error) {
          console.log("Lỗi khi gọi fetchLobbyById:", error);
        }
      } else {
        const item = cateringList.find(item => item._id === id);
        if (!item) {
          Swal.fire("Lỗi!", "Không tìm thấy thông tin dịch vụ catering.", "error");
          setLoading(false);
          return;
        }

        setSelectedItem({ ...item, type: activeTab });
        setEditName(item.name || "");
        setEditPrice(item.price || "");

        // Handle cate_cateringId which could be an object or a string
        if (item.cate_cateringId) {
          if (typeof item.cate_cateringId === 'object' && item.cate_cateringId._id) {
            setEditCate(item.cate_cateringId._id);
          } else {
            setEditCate(item.cate_cateringId);
          }
        } else {
          setEditCate("");
        }

        setEditDescription(item.description || "");
        setEditImageUrl(item.imageUrl || "");

        try {
          console.log(`Đang gọi API lấy chi tiết dịch vụ catering với ID: ${id}`);
          const res = await fetchCateringById(id);
          console.log("Kết quả từ fetchCateringById:", res);

          if (res && res.status && res.data) {
            const catering = res.data;
            setSelectedItem({ ...catering, type: activeTab });
            setEditName(catering.name || "");
            setEditPrice(catering.price || "");

            // Handle cate_cateringId which could be an object or a string
            if (catering.cate_cateringId) {
              if (typeof catering.cate_cateringId === 'object' && catering.cate_cateringId._id) {
                setEditCate(catering.cate_cateringId._id);
              } else {
                setEditCate(catering.cate_cateringId);
              }
            } else {
              setEditCate("");
            }

            setEditDescription(catering.description || "");
            setEditImageUrl(catering.imageUrl || "");
            console.log("Đã cập nhật thông tin từ fetchCateringById");
          }
        } catch (error) {
          console.log("Lỗi khi gọi fetchCateringById, đang thử fetchCateringDetail:", error);

          try {
            const res = await fetchCateringDetail(id);
            console.log("Kết quả từ fetchCateringDetail:", res);

            if (res && res.status && res.data) {
              const catering = res.data;
              setSelectedItem({ ...catering, type: activeTab });
              setEditName(catering.name || "");
              setEditPrice(catering.price || "");

              // Handle cate_cateringId which could be an object or a string
              if (catering.cate_cateringId) {
                if (typeof catering.cate_cateringId === 'object' && catering.cate_cateringId._id) {
                  setEditCate(catering.cate_cateringId._id);
                } else {
                  setEditCate(catering.cate_cateringId);
                }
              } else {
                setEditCate("");
              }

              setEditDescription(catering.description || "");
              setEditImageUrl(catering.imageUrl || "");
              console.log("Đã cập nhật thông tin từ fetchCateringDetail");
            }
          } catch (detailError) {
            console.log("Cả hai API calls đều thất bại, giữ nguyên dữ liệu ban đầu:", detailError);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi trong handleShowDetail:", error);
      Swal.fire("Lỗi!", `Không thể lấy thông tin sản phẩm: ${error.message || "Lỗi không xác định"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật sản phẩm
  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      let updateFunc, updateData;
      if (selectedItem.type === "DichVu") {
        updateFunc = updateFood;
        updateData = {
          name: editName,
          price: editPrice,
          cate_cateringId: editCate,
          description: editDescription,
          imageUrl: editImageUrl
        };
      } else if (selectedItem.type === "QuaTang") {
        updateFunc = updateGift;
        updateData = {
          name: editName,
          price: editPrice,
          Cate_presentId: editCate,
          Description: editDescription,
          Status: editStatus,
          imageUrl: editImageUrl
        };

        // Ensure price is a number
        if (updateData.price) {
          updateData.price = Number(updateData.price);
        }

        if (updateData.Cate_presentId && !/^[0-9a-fA-F]{24}$/.test(updateData.Cate_presentId)) {
          Swal.fire("Lỗi!", "Mã loại quà tặng không đúng định dạng.", "warning");
          return;
        }
      } else if (selectedItem.type === "TrangTri") {
        updateFunc = updateDecorate;
        updateData = {
          name: editName,
          price: editPrice,
          Cate_decorateId: editCate,
          Description: editDescription,
          Status: editStatus,
          imageUrl: editImageUrl
        };

        if (updateData.price) {
          updateData.price = Number(updateData.price);
        }

        if (updateData.Cate_decorateId && !/^[0-9a-fA-F]{24}$/.test(updateData.Cate_decorateId)) {
          Swal.fire("Lỗi!", "Mã loại trang trí không đúng định dạng.", "warning");
          return;
        }
      } else if (selectedItem.type === "Order") {
        updateFunc = updateLobby;
        updateData = {
          name: editName,
          price: editPrice,
          SoLuongKhach: editDescription,
          imageUrl: editImageUrl
        };

        // Ensure price is a number
        if (updateData.price) {
          updateData.price = Number(updateData.price);
        }

        // Ensure SoLuongKhach is a number
        if (updateData.SoLuongKhach) {
          updateData.SoLuongKhach = Number(updateData.SoLuongKhach);
        }
      } else {
        updateFunc = updateCatering;
        updateData = { name: editName };
      }
      const res = await updateFunc(selectedItem._id, updateData);
      if (res.status) {
        if (selectedItem.type === "DichVu") {
          setFoodList(prev =>
            prev.map(item => (item._id === res.data._id ? res.data : item))
          );
        } else if (selectedItem.type === "QuaTang") {
          setGiftList(prev =>
            prev.map(item => (item._id === res.data._id ? res.data : item))
          );
        } else if (selectedItem.type === "TrangTri") {
          setDecorateList(prev =>
            prev.map(item => (item._id === res.data._id ? res.data : item))
          );
        } else if (selectedItem.type === "Order") {
          setLobbyList(prev =>
            prev.map(item => (item._id === res.data._id ? res.data : item))
          );
        } else {
          setCateringList(prev =>
            prev.map(item => (item._id === res.data._id ? res.data : item))
          );
        }
        setSelectedItem(null);
        Swal.fire("Thành công!", "Cập nhật thành công.", "success");
      }
    } catch (error) {
      Swal.fire("Lỗi!", "Cập nhật thất bại.", "error");
    }
  };

  // Xóa sản phẩm
  const handleDelete = async () => {
    if (!selectedItem) return;
    const confirmResult = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa sản phẩm?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    });
    if (confirmResult.isConfirmed) {
      try {
        let deleteFunc;
        if (selectedItem.type === "DichVu") {
          deleteFunc = deleteFood;
        } else if (selectedItem.type === "QuaTang") {
          deleteFunc = deleteGift;
        } else if (selectedItem.type === "TrangTri") {
          deleteFunc = deleteDecorate;
        } else if (selectedItem.type === "Order") {
          deleteFunc = deleteLobby;
        } else {
          deleteFunc = deleteCatering;
        }
        const res = await deleteFunc(selectedItem._id);
        if (res.status) {
          if (selectedItem.type === "DichVu") {
            setFoodList(prev =>
              prev.filter(item => item._id !== selectedItem._id)
            );
          } else if (selectedItem.type === "QuaTang") {
            setGiftList(prev =>
              prev.filter(item => item._id !== selectedItem._id)
            );
          } else if (selectedItem.type === "TrangTri") {
            setDecorateList(prev =>
              prev.filter(item => item._id !== selectedItem._id)
            );
          } else if (selectedItem.type === "Order") {
            setLobbyList(prev =>
              prev.filter(item => item._id !== selectedItem._id)
            );
          } else {
            setCateringList(prev =>
              prev.filter(item => item._id !== selectedItem._id)
            );
          }
          setSelectedItem(null);
          Swal.fire("Xóa thành công!", "Sản phẩm đã bị xóa.", "success");
        }
      } catch (error) {
        Swal.fire("Lỗi!", "Xóa thất bại.", "error");
      }
    }
  };

  // Thêm sản phẩm mới
  const handleAdd = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!newName.trim()) {
        Swal.fire("Lỗi!", "Vui lòng nhập tên.", "warning");
        setLoading(false);
        return;
      }

      let addFunc, newData;

      if (addFormType === "food") {
        addFunc = addFood;

        newData = {
          name: newName.trim()
        };

        // Handle price
        if (newPrice && newPrice.trim() !== "") {
          const priceNumber = parseFloat(newPrice);
          if (!isNaN(priceNumber)) {
            newData.price = priceNumber;
          } else {
            Swal.fire("Lỗi!", "Giá phải là một số hợp lệ.", "warning");
            setLoading(false);
            return;
          }
        }

        if (newDescription && newDescription.trim() !== "") {
          newData.description = newDescription.trim();
        }

        if (newImageUrl && newImageUrl.trim() !== "") {
          newData.imageUrl = newImageUrl.trim();
        }

        // Handle cate_cateringId
        if (newCate && newCate.trim() !== "") {
          if (/^[0-9a-fA-F]{24}$/.test(newCate.trim())) {
            newData.cate_cateringId = newCate.trim();
          } else {
            console.warn("Invalid cate_cateringId format, omitting field");
          }
        }
      } else if (addFormType === "gift") {
        addFunc = addGift;

        // Create base data object for gift
        newData = {
          name: newName.trim()
        };

        // Handle price
        if (newPrice && newPrice.trim() !== "") {
          const priceNumber = parseFloat(newPrice);
          if (!isNaN(priceNumber)) {
            newData.price = priceNumber;
          } else {
            Swal.fire("Lỗi!", "Giá phải là một số hợp lệ.", "warning");
            setLoading(false);
            return;
          }
        }

        // Add other fields
        if (newDescription && newDescription.trim() !== "") {
          newData.Description = newDescription.trim();
        }

        if (newImageUrl && newImageUrl.trim() !== "") {
          newData.imageUrl = newImageUrl.trim();
        }

        // Handle Cate_presentId
        if (newCate && newCate.trim() !== "") {
          if (/^[0-9a-fA-F]{24}$/.test(newCate.trim())) {
            newData.Cate_presentId = newCate.trim();
          } else {
            console.warn("Invalid Cate_presentId format, omitting field");
          }
        }

        // Handle Status if provided
        if (newStatus && newStatus.trim() !== "") {
          newData.Status = newStatus.trim();
        }
      } else if (addFormType === "decorate") {
        addFunc = addDecorate;

        newData = {
          name: newName.trim()
        };

        if (newPrice && newPrice.trim() !== "") {
          const priceNumber = parseFloat(newPrice);
          if (!isNaN(priceNumber)) {
            newData.price = priceNumber;
          } else {
            Swal.fire("Lỗi!", "Giá phải là một số hợp lệ.", "warning");
            setLoading(false);
            return;
          }
        }

        // Add other fields
        if (newDescription && newDescription.trim() !== "") {
          newData.Description = newDescription.trim();
        }

        if (newImageUrl && newImageUrl.trim() !== "") {
          newData.imageUrl = newImageUrl.trim();
        }

        // Handle Cate_decorateId
        if (newCate && newCate.trim() !== "") {
          if (/^[0-9a-fA-F]{24}$/.test(newCate.trim())) {
            newData.Cate_decorateId = newCate.trim();
          } else {
            console.warn("Invalid Cate_decorateId format, omitting field");
          }
        }

        // Handle Status if provided
        if (newStatus && newStatus.trim() !== "") {
          newData.Status = newStatus.trim();
        }
      } else if (addFormType === "lobby") {
        addFunc = addLobby;

        newData = {
          name: newName.trim()
        };

        // Handle price
        if (newPrice && newPrice.trim() !== "") {
          const priceNumber = parseFloat(newPrice);
          if (!isNaN(priceNumber)) {
            newData.price = priceNumber;
          } else {
            Swal.fire("Lỗi!", "Giá phải là một số hợp lệ.", "warning");
            setLoading(false);
            return;
          }
        }

        // Handle SoLuongKhach
        if (newDescription && newDescription.trim() !== "") {
          const guestNumber = parseInt(newDescription);
          if (!isNaN(guestNumber)) {
            newData.SoLuongKhach = guestNumber;
          } else {
            Swal.fire("Lỗi!", "Số lượng khách phải là một số hợp lệ.", "warning");
            setLoading(false);
            return;
          }
        }

        // Handle imageUrl
        if (newImageUrl && newImageUrl.trim() !== "") {
          newData.imageUrl = newImageUrl.trim();
        }
      } else {
        Swal.fire("Lỗi!", "Loại sản phẩm không hợp lệ.", "error");
        setLoading(false);
        return;
      }

      console.log(`Sending ${addFormType} data to API:`, newData);

      try {
        const res = await addFunc(newData);
        console.log(`Add ${addFormType} response:`, res);

        if (res.status) {
          // Refresh data based on type
          if (addFormType === "food") {
            await getFoodData();
          } else if (addFormType === "gift") {
            await getGiftData();
          } else if (addFormType === "decorate") {
            await getDecorateData();
          } else if (addFormType === "lobby") {
            await getLobbyData();
          }

          // Clear form fields
          setNewName("");
          setNewPrice("");
          setNewCate("");
          setNewDescription("");
          setNewImageUrl("");
          setSelectedImage(null);
          setNewStatus("");

          setShowAddModal(false);
          Swal.fire("Thành công!", `Thêm ${addFormType === "food" ? "món ăn" :
            addFormType === "gift" ? "quà tặng" :
              addFormType === "decorate" ? "trang trí" :
                "phòng/sảnh"
            } mới thành công.`, "success");
        } else {
          // Fix any catering references in error messages
          let errorMessage = res.message || "Thêm thất bại.";
          Swal.fire("Lỗi!", errorMessage, "error");
        }
      } catch (error) {
        console.error(`Error adding ${addFormType}:`, error);
        let errorMessage = "Thêm thất bại";

        if (error.response && error.response.data) {
          console.error("Response data:", error.response.data);
          let serverMessage = error.response.data.message || error.message || "Lỗi từ máy chủ";
          errorMessage += `: ${serverMessage}`;
        } else {
          errorMessage += `: ${error.message || "Lỗi không xác định"}`;
        }

        Swal.fire("Lỗi!", errorMessage, "error");
      }
    } catch (error) {
      console.error("Unexpected error in handleAdd:", error);
      Swal.fire("Lỗi!", `Thêm thất bại: ${error.message || "Lỗi không xác định"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Khi nhấn nút Thêm
  const handleOpenAddModal = () => {
    // Reset all form fields
    setNewName("");
    setNewPrice("");
    setNewCate("");
    setNewDescription("");
    setNewImageUrl("");
    setSelectedImage(null);
    
    // Reset status only for the types that need it
    setNewStatus("");

    // Set form type based on active tab
    if (activeTab === "DichVu") {
      setAddFormType("food");
    } else if (activeTab === "QuaTang") {
      setAddFormType("gift");
    } else if (activeTab === "TrangTri") {
      setAddFormType("decorate");
    } else if (activeTab === "Order") {
      setAddFormType("lobby");
    } else {
      setAddFormType("food"); // Default
    }

    setShowAddModal(true);
  };

  // Function to convert image file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Handle image upload for new item
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      Swal.fire("Lỗi!", "Vui lòng chọn file hình ảnh (JPEG, PNG, GIF)", "error");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Lỗi!", "Kích thước hình ảnh không được vượt quá 2MB", "error");
      return;
    }

    try {
      setSelectedImage(file);
      const base64 = await convertToBase64(file);
      setNewImageUrl(base64);
    } catch (error) {
      console.error("Error converting image to base64:", error);
      Swal.fire("Lỗi!", "Không thể tải lên hình ảnh", "error");
    }
  };

  // Handle image upload for edit item
  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      Swal.fire("Lỗi!", "Vui lòng chọn file hình ảnh (JPEG, PNG, GIF)", "error");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Lỗi!", "Kích thước hình ảnh không được vượt quá 2MB", "error");
      return;
    }

    try {
      setEditSelectedImage(file);
      const base64 = await convertToBase64(file);
      setEditImageUrl(base64);
    } catch (error) {
      console.error("Error converting image to base64:", error);
      Swal.fire("Lỗi!", "Không thể tải lên hình ảnh", "error");
    }
  };

  // Render nội dung theo tab
  const renderContent = () => {
    if (
      activeTab === "DichVu" ||
      activeTab === "TrangTri" ||
      activeTab === "QuaTang" ||
      activeTab === "Order"
    ) {
      return (
        <>
          <div className="action-buttons">
            <input
              type="text"
              placeholder={`Nhập từ khóa để lọc ${activeTab === "DichVu"
                ? "món ăn"
                : activeTab === "TrangTri"
                  ? "trang trí"
                  : activeTab === "QuaTang"
                    ? "quà tặng"
                    : "phòng/sảnh"
                }`}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <button className="button-add" onClick={handleOpenAddModal}>
              + Thêm mới
            </button>
          </div>
          {loading ? (
            <div className="spinner-container">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredList().length > 0 ? (
            <div className="product-table-container">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Tên</th>
                    <th>Giá</th>
                    <th>Mô tả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList().map((item) => (
                    <tr key={item._id} className="product-row">
                      <td className="product-image-cell">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="product-thumbnail"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/100x100?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </td>
                      <td>{item.name}</td>
                      <td>{item.price?.toLocaleString() || 0} VND</td>
                      <td className="description-cell">{item.description || 'Không có mô tả'}</td>
                      <td>
                        <button
                          className="button-detail"
                          onClick={() => handleShowDetail(item._id)}
                        >
                          Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-results">
              <p>Không tìm thấy sản phẩm nào.</p>
            </div>
          )}

          {/* Modal Chi Tiết */}
          {selectedItem && (
            <div className="detail-card">
              <div className="detail-card-content">
                <button
                  className="detail-card-close"
                  onClick={() => setSelectedItem(null)}
                >
                  &times;
                </button>
                <h3>Chi Tiết Sản Phẩm</h3>
                {/* Display the image prominently at the top */}
                {selectedItem.imageUrl && (
                  <div className="detail-image-container">
                    <img 
                      src={selectedItem.imageUrl} 
                      alt={selectedItem.name} 
                      className="detail-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <p>
                  <strong>ID:</strong> {selectedItem._id}
                </p>
                {selectedItem.type === "DichVu" ? (
                  <>
                    <div>
                      <label><strong>Tên:</strong></label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Giá:</strong></label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Loại dịch vụ:</strong></label>
                      <select
                        value={editCate}
                        onChange={(e) => setEditCate(e.target.value)}
                      >
                        <option value="">-- Chọn loại dịch vụ --</option>
                        {cateringCategories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {cateringCategories.length === 0 && (
                        <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                          Đang tải danh sách loại dịch vụ...
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Mô tả:</strong></label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Hình ảnh:</strong></label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          className="image-upload-input"
                          id="edit-food-image-upload"
                        />
                        <label htmlFor="edit-food-image-upload" className="image-upload-label">
                          Chọn hình ảnh
                        </label>
                        <span className="file-name">
                          {editSelectedImage ? editSelectedImage.name : "Chưa chọn file nào"}
                        </span>
                      </div>
                      {editImageUrl && (
                        <div className="image-preview">
                          <p><strong>Hình ảnh hiện tại:</strong></p>
                          <img src={editImageUrl} alt="Preview" className="preview-image" />
                        </div>
                      )}
                    </div>
                  </>
                ) : selectedItem.type === "QuaTang" ? (
                  <>
                    <div>
                      <label><strong>Tên:</strong></label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Giá:</strong></label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Loại quà tặng:</strong></label>
                      <select
                        value={editCate}
                        onChange={(e) => setEditCate(e.target.value)}
                      >
                        <option value="">-- Chọn loại quà tặng --</option>
                        {giftCategories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {giftCategories.length === 0 && (
                        <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                          Đang tải danh sách loại quà tặng...
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Mô tả:</strong></label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Hình ảnh:</strong></label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          className="image-upload-input"
                          id="edit-gift-image-upload"
                        />
                        <label htmlFor="edit-gift-image-upload" className="image-upload-label">
                          Chọn hình ảnh
                        </label>
                        <span className="file-name">
                          {editSelectedImage ? editSelectedImage.name : "Chưa chọn file nào"}
                        </span>
                      </div>
                      {editImageUrl && (
                        <div className="image-preview">
                          <p><strong>Hình ảnh hiện tại:</strong></p>
                          <img src={editImageUrl} alt="Preview" className="preview-image" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Trạng thái:</strong></label>
                      <input
                        type="text"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      />
                    </div>
                  </>
                ) : selectedItem.type === "TrangTri" ? (
                  <>
                    <div>
                      <label><strong>Tên:</strong></label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Giá:</strong></label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Loại trang trí:</strong></label>
                      <select
                        value={editCate}
                        onChange={(e) => setEditCate(e.target.value)}
                      >
                        <option value="">-- Chọn loại trang trí --</option>
                        {decorateCategories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {decorateCategories.length === 0 && (
                        <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                          Đang tải danh sách loại trang trí...
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Mô tả:</strong></label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Hình ảnh:</strong></label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          className="image-upload-input"
                          id="edit-decorate-image-upload"
                        />
                        <label htmlFor="edit-decorate-image-upload" className="image-upload-label">
                          Chọn hình ảnh
                        </label>
                        <span className="file-name">
                          {editSelectedImage ? editSelectedImage.name : "Chưa chọn file nào"}
                        </span>
                      </div>
                      {editImageUrl && (
                        <div className="image-preview">
                          <p><strong>Hình ảnh hiện tại:</strong></p>
                          <img src={editImageUrl} alt="Preview" className="preview-image" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Trạng thái:</strong></label>
                      <input
                        type="text"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      />
                    </div>
                  </>
                ) : selectedItem.type === "Order" ? (
                  <>
                    <div>
                      <label><strong>Tên phòng/sảnh:</strong></label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Giá:</strong></label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Số lượng khách:</strong></label>
                      <input
                        type="number"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <label><strong>Hình ảnh:</strong></label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          className="image-upload-input"
                          id="edit-lobby-image-upload"
                        />
                        <label htmlFor="edit-lobby-image-upload" className="image-upload-label">
                          Chọn hình ảnh
                        </label>
                        <span className="file-name">
                          {editSelectedImage ? editSelectedImage.name : "Chưa chọn file nào"}
                        </span>
                      </div>
                      {editImageUrl && (
                        <div className="image-preview">
                          <p><strong>Hình ảnh hiện tại:</strong></p>
                          <img src={editImageUrl} alt="Preview" className="preview-image" />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <label><strong>Tên:</strong></label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                )}
                <div className="detail-card-buttons">
                  <button className="button-update" onClick={handleUpdate}>
                    Cập Nhật
                  </button>
                  <button className="button-delete" onClick={handleDelete}>
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Nút "Thêm Mới" */}
          <button className="button-add" onClick={handleOpenAddModal}>
            {activeTab === "DichVu"
              ? "Thêm Món Ăn Mới"
              : activeTab === "QuaTang"
                ? "Thêm Quà Tặng Mới"
                : activeTab === "TrangTri"
                  ? "Thêm Trang Trí Mới"
                  : "Thêm Phòng/Sảnh Mới"
            }
          </button>

          {/* Modal Thêm Mới */}
          {showAddModal && (
            <div className="detail-card">
              <div className="detail-card-content">
                <button
                  className="detail-card-close"
                  onClick={() => setShowAddModal(false)}
                >
                  &times;
                </button>
                <h3>Thêm Mới {
                  addFormType === "food" 
                    ? "Dịch Vụ" 
                    : addFormType === "gift" 
                      ? "Quà Tặng" 
                      : addFormType === "decorate" 
                        ? "Trang Trí" 
                        : "Phòng/Sảnh"
                }</h3>
                
                {/* Image Preview */}
                {newImageUrl && (
                  <div className="detail-image-container">
                    <img
                      src={newImageUrl}
                      alt="Preview"
                      className="detail-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}

                {addFormType === "food" && (
                  <>
                    <div>
                      <label><strong>Tên:</strong></label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nhập tên dịch vụ"
                      />
                    </div>
                    <div>
                      <label><strong>Giá:</strong></label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Nhập giá"
                      />
                    </div>
                    <div>
                      <label><strong>Loại dịch vụ:</strong></label>
                      <select
                        value={newCate}
                        onChange={(e) => setNewCate(e.target.value)}
                      >
                        <option value="">-- Chọn loại dịch vụ --</option>
                        {cateringCategories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {cateringCategories.length === 0 && (
                        <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                          Đang tải danh sách loại dịch vụ...
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Mô tả:</strong></label>
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Nhập mô tả"
                      />
                    </div>
                    <div>
                      <label><strong>Hình ảnh:</strong></label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="image-upload-input"
                          id="food-image-upload"
                        />
                        <label htmlFor="food-image-upload" className="image-upload-label">
                          Chọn hình ảnh
                        </label>
                        <span className="file-name">
                          {selectedImage ? selectedImage.name : "Chưa chọn file nào"}
                        </span>
                      </div>
                      {newImageUrl && (
                        <div className="image-preview">
                          <p><strong>Hình ảnh đã chọn:</strong></p>
                          <img src={newImageUrl} alt="Preview" className="preview-image" />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {addFormType === "gift" && (
                  <>
                    <div>
                      <label><strong>Tên:</strong></label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nhập tên quà tặng"
                      />
                    </div>
                    <div>
                      <label><strong>Giá:</strong></label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Nhập giá"
                      />
                    </div>
                    <div>
                      <label><strong>Loại quà tặng:</strong></label>
                      <select
                        value={newCate}
                        onChange={(e) => setNewCate(e.target.value)}
                      >
                        <option value="">-- Chọn loại quà tặng --</option>
                        {giftCategories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {giftCategories.length === 0 && (
                        <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                          Đang tải danh sách loại quà tặng...
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Mô tả:</strong></label>
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Nhập mô tả"
                      />
                    </div>
                    <div>
                      <label><strong>Hình ảnh:</strong></label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="image-upload-input"
                          id="gift-image-upload"
                        />
                        <label htmlFor="gift-image-upload" className="image-upload-label">
                          Chọn hình ảnh
                        </label>
                        <span className="file-name">
                          {selectedImage ? selectedImage.name : "Chưa chọn file nào"}
                        </span>
                      </div>
                      {newImageUrl && (
                        <div className="image-preview">
                          <p><strong>Hình ảnh đã chọn:</strong></p>
                          <img src={newImageUrl} alt="Preview" className="preview-image" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Trạng thái:</strong></label>
                      <input
                        type="text"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        placeholder="Nhập trạng thái"
                      />
                    </div>
                  </>
                )}

                {addFormType === "decorate" && (
                  <>
                    <div>
                      <label><strong>Tên:</strong></label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nhập tên trang trí"
                      />
                    </div>
                    <div>
                      <label><strong>Giá:</strong></label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Nhập giá"
                      />
                    </div>
                    <div>
                      <label><strong>Loại trang trí:</strong></label>
                      <select
                        value={newCate}
                        onChange={(e) => setNewCate(e.target.value)}
                      >
                        <option value="">-- Chọn loại trang trí --</option>
                        {decorateCategories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {decorateCategories.length === 0 && (
                        <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                          Đang tải danh sách loại trang trí...
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Mô tả:</strong></label>
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Nhập mô tả"
                      />
                    </div>
                    <div>
                      <label><strong>Hình ảnh:</strong></label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="image-upload-input"
                          id="decorate-image-upload"
                        />
                        <label htmlFor="decorate-image-upload" className="image-upload-label">
                          Chọn hình ảnh
                        </label>
                        <span className="file-name">
                          {selectedImage ? selectedImage.name : "Chưa chọn file nào"}
                        </span>
                      </div>
                      {newImageUrl && (
                        <div className="image-preview">
                          <p><strong>Hình ảnh đã chọn:</strong></p>
                          <img src={newImageUrl} alt="Preview" className="preview-image" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Trạng thái:</strong></label>
                      <input
                        type="text"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        placeholder="Nhập trạng thái"
                      />
                    </div>
                  </>
                )}

                {addFormType === "lobby" && (
                  <>
                    <div>
                      <label><strong>Tên phòng/sảnh:</strong></label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nhập tên phòng/sảnh"
                      />
                    </div>
                    <div>
                      <label><strong>Giá:</strong></label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Nhập giá"
                      />
                    </div>
                    <div>
                      <label><strong>Số lượng khách:</strong></label>
                      <input
                        type="number"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Nhập số lượng khách tối đa"
                      />
                    </div>
                    <div>
                      <label><strong>Hình ảnh:</strong></label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="image-upload-input"
                          id="lobby-image-upload"
                        />
                        <label htmlFor="lobby-image-upload" className="image-upload-label">
                          Chọn hình ảnh
                        </label>
                        <span className="file-name">
                          {selectedImage ? selectedImage.name : "Chưa chọn file nào"}
                        </span>
                      </div>
                      {newImageUrl && (
                        <div className="image-preview">
                          <p><strong>Hình ảnh đã chọn:</strong></p>
                          <img src={newImageUrl} alt="Preview" className="preview-image" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label><strong>Trạng thái:</strong></label>
                      <input
                        type="text"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        placeholder="Nhập trạng thái"
                      />
                    </div>
                  </>
                )}

                <div className="detail-card-buttons">
                  <button className="button-update" onClick={handleAdd}>
                    {addFormType === "food"
                      ? "Thêm Món Ăn"
                      : addFormType === "gift"
                        ? "Thêm Quà Tặng"
                        : addFormType === "decorate"
                          ? "Thêm Trang Trí"
                          : "Thêm Phòng/Sảnh"
                    }
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    } else {
      return (
        <div className="placeholder-section">
          <h3>{activeTab}</h3>
          <p>Chức năng của mục này đang được phát triển.</p>
        </div>
      );
    }
  };

  return (
    <div className="container">
      {/* Thanh điều hướng */}
      <nav className="nav-tabs">
        <ul>
          <li
            className={activeTab === "DichVu" ? "active" : ""}
            onClick={() => setActiveTab("DichVu")}
          >
            Dịch Vụ
          </li>
          <li
            className={activeTab === "QuaTang" ? "active" : ""}
            onClick={() => setActiveTab("QuaTang")}
          >
            Quà Tặng
          </li>
          <li
            className={activeTab === "TrangTri" ? "active" : ""}
            onClick={() => setActiveTab("TrangTri")}
          >
            Trang Trí
          </li>
          <li
            className={activeTab === "Order" ? "active" : ""}
            onClick={() => setActiveTab("Order")}
          >
            Sảnh
          </li>
        </ul>
      </nav>

      {renderContent()}
    </div>
  );
};

export default ProductManagement;
