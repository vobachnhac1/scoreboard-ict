# Phân Tích & Thiết Kế Kiến Trúc Phần Mềm: Tạo Bracket Loại Trực Tiếp (Knockout)

## 1. Yêu cầu Hệ thống
Nhận đầu vào là danh sách các Vận động viên (VĐV) tham gia thi đấu ở một hạng cân/nội dung thi đấu, sắp xếp và phân bổ vào sơ đồ đấu loại trực tiếp (Knockout Bracket) chuẩn quốc tế.

### Dữ liệu đầu vào:
Danh sách VĐV có các trường như:
- STT
- Họ tên
- Năm sinh
- Hạng cân
- Giới tính
- Đơn vị / CLB
- Tỉnh/Thành phố
- Số hạt giống (ranking)

### Yêu cầu thuật toán:
1. **Chuẩn hóa số lượng nhánh (S):** Tổng số nhánh trong một sơ đồ vòng loại trực tiếp phải là một lũy thừa của 2 (ví dụ: `[..., 4, 8, 16, 32, 64]`). Ta cần tìm `S = 2^k` sao cho `S >= N` (trong đó `N` là số lượng VĐV tham gia).
2. **Tính số Bye:** Nếu `N < S`, sẽ có `S - N` vị trí trong sơ đồ trống (được gọi là Bye/Miễn vòng). VĐV nào bắt cặp với Bye sẽ tự động miễn đấu mà đi thẳng vào vòng trong.
3. **Phân bổ Nhánh (Seeding Placement):** Cách bắt cặp theo thứ hạng ưu tiên cao nhất, người hạng 1 đấu với người hạng cuối, người hạng 2 đấu với hạng áp chót...
    - Để ưu tiên các hạt giống cao, những suất Bye sẽ được phân phối cho các hạt giống xếp thứ hạng đầu tiên. Khi đó hạt giống số 1 luôn nằm ở nhánh xa nhất với các hạt giống mạnh khác để hẹn nhau ở bán kết/chung kết.
4. **Mã nhận diện kết quả trận đấu:** Thay vì để trống VĐV chờ đấu nối tiếp tại các vòng sâu hơn, ứng dụng sẽ điền chuỗi định dạng báo hiệu chờ `win.<STT của Trận Trước>`. 

---

## 2. Kiến Trúc Thuật Toán (Bracket Algorithm)

### Phát sinh danh sách đấu cặp chuẩn:
Hàm `generateBracketOrder(S)`
Xuất phát từ cặp đấu đầu tiên `[1, 2]`, khi nhân đôi số lượng đội, đội thứ `x` luôn bắt cặp với đội thứ `[Kích_cỡ_bảng + 1 - x]`.
- Ví dụ Bảng 2 đội: `[1, 2]`
- Bảng 4 đội: 
   - Hạt giống 1 mang theo hạt giống (4+1-1) = 4  👉 `[1, 4]`
   - Hạt giống 2 mang theo hạt giống (4+1-2) = 3  👉 `[2, 3]`
   - Gộp lại: `[1, 4, 3, 2]` (Cần phân bổ để Hạt giống 1 và Hạt giống 2 gặp nhau chung kết)
- Bảng 8 đội:
    `[1, 8, 4, 5, 2, 7, 3, 6]`
- Bảng 16 đội:
    `[1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11]`

### Tiến hành Bắt Cặp (Simulate Round):
1. Tham chiếu VĐV vào các hạt giống đã được map ở thuật toán trên. VĐV có chỉ mục tham chiếu `> N` sẽ là `Bye`
2. Tiến hành duyệt cặp thông qua cấu trúc Binary Tree Bottom-Up:
    - Nếu có (VĐV vs Bye): VĐV chiến thắng tự động được ghi nhận lên danh sách thi đấu vòng tiếp theo. Trận này không được đánh số thi đấu (vì không đấu thực tế).
    - Nếu có (VĐV vs VĐV) hoặc (win.X vs win.Y): Ghi nhận thành 1 trận đấu (Match), và người chiến thắng tiến lên dòng trạng thái vòng bảng tiếp theo dưới danh tính chờ `win.<Match_ID>`.
    - Lặp lại liên tục chừng nào vòng bảng mới vẫn còn \> 1 đội tham gia. Lặp cho đến khi tìm ra trận Chung Kết (Chỉ còn 1 cặp sinh ra).

---

## 3. Cấu trúc Output

Kết quả sinh ra sẽ là một danh sách các Object đại diện tham số cho mỗi trận từ đầu đến cuối:
```typescript
interface MatchInfo {
  matchNo: number;         // STT trận đấu (Số tăng dần từ 1, sinh ra liên tục)
  roundIndex: number;      // Chỉ số vòng (1,2,3...)
  roundName: string;       // "Vòng 1", "Tứ kết", "Bán kết", "Chung kết"
  weight: string;          // Hạng Cân
  red_name: string;        // VĐV Đỏ (VD: Nguyễn Văn A hoặc win.1)
  red_unit: string;        // Đơn vị Đỏ
  red_country: string;     // Quốc gia đại diện
  blue_name: string;       // VĐV Xanh (VD: Nguyễn Văn B hoặc win.2)
  blue_unit: string;       // Đơn vị Xanh
  blue_country: string;    // Quốc gia đại diện
}
```

Ứng dụng của cấu trúc này giúp hệ thống backend kết hợp dễ dàng với chức năng "Import Data" đã có để render ra toàn bộ giải đấu hoàn chỉnh vào một Data Sheet Đối Kháng đồng bộ từ Excel (Knockout Bracket Generation).

---

## 4. Chức năng Kéo Thả (Drag & Drop) và Đồng bộ Số Thứ Tự Trận

### Bài toán:
Khi tổ chức giải đấu trên thực tế, ban tổ chức không thi đấu hết một mạch tất cả các trận của một hạng cân rồi mới sang hạng cân khác. Thay vào đó, họ sẽ đan xen tuần tự. 
Ví dụ: Thi đấu toàn bộ Vòng Loại của tất cả các hạng cân (Ví dụ: Tứ kết 57kg -> Tứ kết 60kg). Sau khi các VĐV đã được nghỉ ngơi, hệ thống luân chuyển tiếp sang Vòng Bán Kết của 57kg -> Bán kết 60kg..
Điều này dẫn đến việc người dùng cần một công cụ **Kéo - Thả (Drag & Drop)** toàn bộ các trận đấu sinh ra từ nhiều bản tạo Bracket gộp lại để sắp xếp lại **Thứ tự trận đấu diễn ra**.

### Thách thức (Phá vỡ tính toàn vẹn phụ thuộc):
Trường dữ liệu tham chiếu người thắng ở vòng sau (thường là `red_name` và `blue_name` của Bán kết/Chung kết) chứa giá trị `win.<Match_ID>`. Ví dụ: Trận chung kết chờ `win.1`.
Nếu người dùng kéo Trận 1 xuống vị trí giao đấu số 3 (do chèn trận của hạng cân khác lên trước), STT trận này bị thay đổi thành Trận 3. Dẫn đến Trận chung kết vẫn đang tìm một trận mang số 1 vốn không còn là trận hợp lệ nữa.

### Thuật toán Re-index (Đồng bộ thứ tự tham chiếu):
Để giải quyết bài toán này, mỗi khi sự kiện kéo thả mảng giao diện hoàn tất (hoặc gộp nhiều bảng Bracket lại với nhau), hệ thống cần quét qua mảng tổng bằng thuật toán `reindexMatches(matches)` thực hiện các bước sau:
1. **Lập Bản Đồ Ánh Xạ (Mapping Dictionary):**
   - Lặp qua mảng thứ tự mới, ghi lại ánh xạ từ `Số thứ tự cũ (oldMatchNo)` sang `Chỉ mục vị trí mới (newMatchNo = index + 1)`.
2. **Cập Nhật Danh Tính:**
   - Lặp qua mảng một lần nữa.
   - Thay đổi thuộc tính gán nhãn `matchNo` của trận đấu thành `newMatchNo`.
   - Kiểm tra chuỗi định danh tại `red_name` và `blue_name`. Nếu trùng khớp với format `win.<oldMatchNo>`, thay thế giá trị đuôi bằng `<newMatchNo>` tương ứng đã thu thập ở bước 1.
3. Trả về List/Mảng mới thoả mãn quy tắc.

Nhờ có cơ chế 2 Layers pass này, hệ thống đảm bảo dù VĐV, hạng cân hay vòng đấu có bị đan xen, luồng quy chiếu kết quả logic của giải đấu vẫn được bảo toàn tuyệt đối.
