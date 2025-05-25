# Công cụ hỗ trợ Event Storming

Dự án này là một webtool hỗ trợ Event Storming với giao diện kéo thả giống Draw.io. Công cụ này giúp người dùng dễ dàng tổ chức và trực quan hóa các thành phần trong Event Storming.

## Tính năng chính
- **Canvas kéo thả**: Kéo thả các thành phần từ sidebar vào canvas.
- **Sidebar với các thành phần Event Storming**: Bao gồm Event, Command, Aggregate, Policy, External System.
- **Kết nối giữa các node**: Tạo và chỉnh sửa các đường kết nối giữa các node.
- **Chỉnh sửa node**: Thay đổi nội dung, màu sắc, và biểu tượng của node.
- **Lưu và tải sơ đồ**: Lưu sơ đồ vào local storage hoặc xuất ra file JSON.
- **Undo/Redo**: Hỗ trợ hoàn tác và làm lại các thao tác.
- **Chế độ xem toàn cảnh**: Mini-map để xem toàn bộ sơ đồ.
- **Tùy chỉnh giao diện**: Chế độ sáng/tối và tùy chỉnh node.

## Cách sử dụng
1. Cài đặt các phụ thuộc:
   ```bash
   npm install
   ```
2. Chạy ứng dụng:
   ```bash
   npm run dev
   ```
3. Mở trình duyệt và truy cập `http://localhost:3000`.

## Cấu trúc thư mục

## Cấu trúc thư mục
```
src/
├── assets/               # Chứa các tài nguyên tĩnh (hình ảnh, biểu tượng, v.v.)
├── components/           # Chứa các component React tái sử dụng
│   ├── EditableNode.tsx
│   ├── NodeBox.tsx
│   ├── Sidebar.tsx
│   └── index.ts          # Export các component từ thư mục này
├── features/             # Chứa các tính năng chính của ứng dụng
│   ├── Diagram/          # Tính năng quản lý sơ đồ
│   │   ├── hooks/        # Các custom hooks liên quan đến sơ đồ
│   │   ├── components/   # Các component liên quan đến sơ đồ
│   │   ├── utils/        # Các hàm tiện ích liên quan đến sơ đồ
│   │   └── DiagramPage.tsx
│   └── Theme/            # Tính năng quản lý theme
│       ├── hooks/        # Các custom hooks liên quan đến theme
│       ├── components/   # Các component liên quan đến theme
│       └── ThemeProvider.tsx
├── data/                 # Chứa dữ liệu tĩnh hoặc cấu hình
│   ├── initialEdges.ts
│   └── initialNodes.ts
├── hooks/                # Chứa các custom hooks dùng chung
│   └── useLocalStorage.ts
├── styles/               # Chứa các file CSS hoặc SCSS
│   ├── App.css
│   └── index.css
├── utils/                # Chứa các hàm tiện ích dùng chung
│   └── localStorage.ts
├── App.tsx               # Component chính của ứng dụng
├── main.tsx              # Điểm vào chính của ứng dụng
└── vite-env.d.ts         # Khai báo môi trường TypeScript cho Vite
```

## Quy hoạch tính năng
### 1. Tính năng quản lý sơ đồ (Diagram)
- **Chức năng**: Thêm, chỉnh sửa, xóa các node và edge.
- **Thư mục**: `features/Diagram/`
- **Thành phần**:
  - `DiagramPage.tsx`: Trang chính hiển thị sơ đồ.
  - `hooks/`: Chứa các custom hooks như `useDiagramState`.
  - `components/`: Chứa các component như `EditableNode`, `NodeBox`.
  - `utils/`: Chứa các hàm tiện ích liên quan đến sơ đồ.

### 2. Tính năng quản lý theme (Theme)
- **Chức năng**: Chuyển đổi giữa chế độ sáng và tối, thay đổi màu nền canvas.
- **Thư mục**: `features/Theme/`
- **Thành phần**:
  - `ThemeProvider.tsx`: Cung cấp context cho theme.
  - `hooks/`: Chứa các custom hooks như `useTheme`.
  - `components/`: Chứa các component liên quan đến theme.

### 3. Tính năng lưu trữ cục bộ (Local Storage)
- **Chức năng**: Lưu và tải dữ liệu từ `localStorage`.
- **Thư mục**: `hooks/useLocalStorage.ts` và `utils/localStorage.ts`.

## Lợi ích của cấu trúc này
- **Dễ bảo trì**: Các tính năng được tách biệt rõ ràng, dễ dàng thêm mới hoặc chỉnh sửa.
- **Tái sử dụng**: Các component và hooks được tổ chức để tái sử dụng trong nhiều tính năng.
- **Quy mô lớn**: Dễ dàng mở rộng khi dự án phát triển.

---

Hãy tuân thủ cấu trúc này khi thêm mới hoặc chỉnh sửa các tính năng trong dự án.