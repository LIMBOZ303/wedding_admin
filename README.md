# Hệ Thống Quản Lý Đám Cưới

Một hệ thống quản lý và lập kế hoạch đám cưới toàn diện giúp quản trị viên quản lý các kế hoạch đám cưới, địa điểm, dịch vụ ẩm thực, trang trí và quà tặng.

## Tính Năng

- **Quản Lý Kế Hoạch**
  - Tạo và quản lý kế hoạch đám cưới
  - Theo dõi trạng thái kế hoạch (Đã kích hoạt/Chưa kích hoạt/Đã hủy)
  - Xem thông tin chi tiết kế hoạch
  - Quản lý ngày sự kiện và số lượng khách

- **Quản Lý Địa Điểm**
  - Xem chi tiết địa điểm
  - Theo dõi giá thuê địa điểm
  - Quản lý hình ảnh địa điểm

- **Quản Lý Dịch Vụ**
  - **Dịch Vụ Ẩm Thực**
    - Quản lý dịch vụ ăn uống
    - Tính toán chi phí dựa trên số lượng khách
    - Theo dõi giá từng món
  
  - **Dịch Vụ Trang Trí**
    - Quản lý các hạng mục trang trí
    - Theo dõi chi phí trang trí
    - Xem chi tiết trang trí

  - **Dịch Vụ MC/Quà Tặng**
    - Quản lý dịch vụ MC và quà tặng
    - Theo dõi số lượng và giá cả
    - Tính toán tổng chi phí

## Công Nghệ Sử Dụng

- Frontend: React.js
- Styling: CSS
- Icons: Font Awesome
- UI Components: Custom components
- State Management: React Hooks

## Bắt Đầu

### Yêu Cầu

- Node.js
- npm hoặc yarn

### Cài Đặt

1. Clone repository
```bash
git clone https://github.com/latoanthinh/Wedding_Planning_App.git
```

2. Cài đặt dependencies
```bash
npm install
# hoặc
yarn install
```

3. Khởi động máy chủ 
```bash
npm start
# hoặc
yarn start
```

## Cấu Trúc Dự Án

```
src/
├── components/         # Các component React
├── api/               # Tích hợp API
├── public/            # Tài nguyên tĩnh
│   └── styles/        # CSS styles
```

## Đóng Góp

1. Fork repository
2. Tạo nhánh tính năng (`git checkout -b feature/TinhNangMoi`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng mới'`)
4. Push lên nhánh (`git push origin feature/TinhNangMoi`)
5. Tạo Pull Request

## Giấy Phép

Dự án này được cấp phép theo MIT License - xem file LICENSE để biết thêm chi tiết. 