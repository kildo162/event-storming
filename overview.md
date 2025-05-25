# Project Event Storming Webtool 
---

Dự án Event Storming Webtool là một công cụ trong cụm các công cụ phát triển hệ thống thông tin của Scyna Team. Với mong muốn tăng tốc độ phát triển hệ thống và giảm thiếu các sai sót khi thiết kế, làm việc với các Bussiness Owner, chúng tôi đã phát triển một công cụ Event Storming Webtool.

## Mục tiêu
TODO

## Event Storming Concept
TODO

## Project Structure
TODO

## Tính năng
Event Storming là một kỹ thuật trong phát triển phần mềm, giúp các nhóm hiểu rõ hơn về miền vấn đề thông qua việc mô hình hóa các sự kiện trong hệ thống. Công cụ Event Storming Webtool hỗ trợ quá trình này bằng cách cung cấp một giao diện trực quan, cho phép người dùng dễ dàng tạo, chỉnh sửa và tổ chức các sự kiện, lệnh và thực thể trong hệ thống.

### Node
Trong Event Storming sơ khai thì sử dụng các sticker note để lưu trữ lại các thông tin. Còn trong Event Storming Webtool, các thành phần chính được mô hình hóa dưới dạng Node (Sticker Note) với các loại khác nhau, mỗi loại Node đại diện cho một khía cạnh cụ thể của hệ thống. Các Node này được phân loại thành hai nhóm chính: **Node Master** và **Node Support**.

### Node Master 
- **Actor**: Đại diện cho người dùng hoặc hệ thống tương tác với ứng dụng. Actor có thể là người dùng cuối, hệ thống bên ngoài hoặc các dịch vụ khác.
- **Action**: Hay còn gọi là Command. Đại diện cho hành động hoặc lệnh mà Actor thực hiện trong hệ thống. Action có thể là các thao tác như tạo, cập nhật, xóa dữ liệu.
- **Read Model**: Đại diện cho các mô hình dữ liệu được sử dụng để đọc thông tin từ hệ thống. Read Model thường được tối ưu hóa cho việc truy vấn và hiển thị dữ liệu.
- **Consistent Business Rule**: Đại diện cho các quy tắc kinh doanh nhất quán mà hệ thống phải tuân thủ. Các quy tắc này có thể liên quan đến xác thực dữ liệu, quyền truy cập hoặc các điều kiện khác.
- **Domain Event**: Đại diện cho các sự kiện xảy ra trong miền vấn đề. Domain Event thường được sử dụng để thông báo về các thay đổi quan trọng trong hệ thống, như việc tạo mới một đối tượng hoặc cập nhật trạng thái của nó.

### Node Support
- **External System**: Đại diện cho các hệ thống bên ngoài tương tác với ứng dụng. Điều này có thể bao gồm các dịch vụ web, API hoặc các hệ thống khác mà ứng dụng cần tích hợp.
- **Hotspot**: Là các khu vực quan trọng trong mô hình, nơi có thể xảy ra các vấn đề hoặc cần chú ý đặc biệt. Hotspot giúp người dùng nhận diện các điểm cần tập trung trong quá trình phát triển.
- **Opportunity**: Đại diện cho các cơ hội cải tiến hoặc mở rộng trong hệ thống. Opportunity có thể là các tính năng mới, cải tiến hiệu suất hoặc các giải pháp thay thế cho các vấn đề hiện tại.
- **UI**: Đại diện cho giao diện người dùng của ứng dụng. UI có thể bao gồm các thành phần như nút bấm, biểu mẫu, bảng điều khiển và các yếu tố tương tác khác.
- **Eventually Consistent Business Rule**: Đại diện cho các quy tắc kinh doanh không nhất thiết phải được thực thi ngay lập tức, mà có thể được xử lý sau một khoảng thời gian. Điều này thường liên quan đến các quy trình phức tạp hoặc các tác vụ cần thời gian để hoàn thành.

### Other Components
- **Behavior (Group Node)**: Là các nhóm Node được tổ chức theo hành vi hoặc chức năng cụ thể trong hệ thống. Behavior giúp người dùng dễ dàng nhận diện các phần của mô hình có liên quan đến nhau và tạo ra một cái nhìn tổng quan về cách các thành phần tương tác. 
- **Pivotal Event**: Là các sự kiện quan trọng trong mô hình, thường là các Domain Event có ảnh hưởng lớn đến hệ thống hoặc người dùng. Pivotal Event giúp xác định các điểm mấu chốt trong quá trình phát triển và thiết kế hệ thống.
- **Arrow**: Là các mũi tên thể hiện mối quan hệ giữa các Node trong mô hình. Arrow giúp người dùng dễ dàng nhận diện các tương tác và luồng thông tin giữa các thành phần trong hệ thống.


### Node Relationship

TODO

### Event Storming Grammar

- **Action** -- invoked on --> **External System**
- **Action** -- invoked on --> **Consistent Business Rule**
- **External System** -- generates --> **Domain Event** (Positive Value)
- **Consistent Business Rule** -- generates --> **Domain Event** (Negative Value)
- **Domain Event** -- translated info --> **Read Model**
- **Read Model** --> **UI**
- **Actor** --> **UI**
- **Domain Event** -- triggers --> **Eventually Consistent Business Rule**
- **Actor** -- invokes --> **Action**
- **Eventually Consistent Business Rule** -- invokes --> **Action**

### Flat Version
  
Đây là phiên bản phẳng của mô hình Event Storming, thể hiện các mối quan hệ giữa các thành phần trong hệ thống mà không có cấu trúc phân cấp. 
Người dùng sẽ vẽ lại các **Behavior** dưới dạng **Group Node** theo các mối quan hệ đã được định nghĩa trong Event Storming Grammar.

A1: **UI** -> **Actor** -> **Command** -> **Consistent Business Rule** -> **Domain Event** 
B1: **Query** -> **Consistent Business Rule** -> **UI** -> **Actor**
B2: **Eventually Consistent Business Rule** -> **Command** -> **External System** -> **Domain Event**
B3: **Eventually Consistent Business Rule** -> **Command** -> **Consistent Business Rule** -> **Domain Event**
A1 -> B1
A1 -> B2
A1 -> B3
B1 -> A1
B2 -> A1
B3 -> A1

### Tính năng chính 

- Vẽ mô hình Event Storming trực quan
- Tạo và quản lý các Node với các loại khác nhau
    - Actor
    - Action
    - Read Model
    - Consistent Business Rule
    - Domain Event
    - External System
    - Hotspot
    - Opportunity
    - UI
    - Eventually Consistent Business Rule
- Tạo và quản lý các Behavior (Group Node)
- Tạo và quản lý các Pivotal Event

- Thuộc tính của Node
    - Loại
    - Nội dung
    - Màu sắc
    - Kích thước

## Công nghệ sử dụng
TODO

