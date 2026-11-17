# TimUIDFB
🎯 Lý do ra đời (Why GM Tools?)

Hiện nay, khi cần lấy mã định danh số (UID) của Profile, Fanpage hay Group Facebook, nhiều người thường phải dán đường dẫn lên các trang web trung gian của bên thứ ba. Việc này tiềm ẩn nhiều rủi ro:
* Lộ thông tin & lịch sử truy vấn: Máy chủ bên thứ ba có thể lưu lại danh sách link/đối tượng bạn đang tìm kiếm.
* Rủi ro bảo mật tài khoản: Nhiều công cụ yêu cầu đăng nhập hoặc cung cấp Cookie/Token dẫn đến nguy cơ mất quyền kiểm soát tài khoản.
* Sai lệch kết quả: Dễ lấy nhầm UID của chính tài khoản đang đăng nhập (`actorID` / `viewerID`) thay vì UID của đối tượng đích.

GM Tools giải quyết triệt để vấn đề này bằng cách **xử lý 100% trực tiếp trên trình duyệt của bạn (Client-side)**:
* ❌ Không gửi dữ liệu Facebook qua bất kỳ server trung gian nào.
* ❌ Không thu thập Cookie, Token hay lịch sử duyệt web.
* ✅ Đọc trực tiếp cấu trúc DOM từ tab đang mở hoặc phân tích nguồn trang cục bộ để trả về UID chính xác ngay lập tức.

---

## ✨ Tính năng chính

* Dò tìm UID Facebook đa định dạng: Hỗ trợ trích xuất chính xác UID của Trang cá nhân (Profile), Fanpage và Nhóm (Group)từ link username (`facebook.com/username`), link chứa tham số (`profile.php?id=...`) hoặc link chia sẻ rút gọn (`/share/...`).
* Quét trực tiếp từ Tab đang mở: Chỉ cần 1 cú nhấp chuột khi đang xem trang Facebook, tiện ích sẽ đọc thẳng dữ liệu trên tab hiện tại mà không cần gửi thêm request ra ngoài.
* Bộ lọc chống nhầm lẫn ID:*Tự động loại bỏ các trường `actorID`, `viewerID` hoặc ID khách vãng lai (`0`), đảm bảo chỉ bắt đúng ID của đối tượng mục tiêu.
* Rút gọn link tích hợp: Tự động nhận diện URL của tab đang mở và tạo link rút gọn sạch, không quảng cáo chuyển hướng qua `is.gd` (kèm cơ chế dự phòng tự động sang `tinyurl.com`).
* Mã nguồn tách biệt, dễ tùy biến: Toàn bộ giao diện và logic được viết thuần bằng HTML, CSS, JavaScript chuẩn Manifest V3 — gọn nhẹ, không phụ thuộc thư viện nặng.

---

## 📂 Cấu trúc dự án

```text
gm-uid-tools/
├── logo.png         # Biểu tượng nhận diện của Extension
├── manifest.json    # Cấu hình quyền hạn & khai báo chuẩn Manifest V3
├── popup.html       # Cấu trúc giao diện 2 tab (Dò UID & Rút gọn Link)
├── popup.css        # Định dạng giao diện popup
└── popup.js         # Logic bóc tách UID từ DOM/HTML và gọi API rút gọn link
```

---

## 🚀 Hướng dẫn cài đặt (Developer Mode)

Vì tiện ích chạy độc lập không qua Store, bạn có thể cài đặt trực tiếp từ mã nguồn chỉ trong 30 giây:

1. Tải mã nguồn về máy (nhấn **Code -> Download ZIP** rồi giải nén, hoặc dùng Git):
   ```bash
   git clone [https://github.com/](https://github.com/)<username-cua-ban>/<ten-repo>.git
   ```
2. Mở trình duyệt nhân Chromium (**Chrome, Edge, Cốc Cốc, Brave**) và truy cập địa chỉ:
   ```text
   chrome://extensions/
   ```
3. Bật công tắc **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải.
4. Nhấn nút **Tải tiện ích đã giải nén (Load unpacked)** ở góc trên bên trái và chọn thư mục chứa mã nguồn.
5. Ghim biểu tượng **GM Tools** lên thanh công cụ trình duyệt để bắt đầu sử dụng.

---

## 📖 Cách sử dụng

### 1. Dò tìm UID Facebook
* **Cách 1 (Khuyên dùng — Nhanh & Chính xác nhất):** Mở trực tiếp trang Profile, Fanpage hoặc Group Facebook cần lấy ID $\rightarrow$ mở tiện ích $\rightarrow$ nhấn **Lấy từ Tab đang mở** $\rightarrow$ nhấn **Copy**.
* **Cách 2 (Dò từ đường dẫn bất kỳ):** Dán link Facebook vào ô nhập liệu $\rightarrow$ nhấn **Dò UID từ Link** $\rightarrow$ chờ hệ thống phân tích và nhấn **Copy**.

### 2. Rút gọn đường dẫn
* Chuyển sang tab **Rút gọn Link** (tiện ích tự động điền sẵn URL của trang web bạn đang mở, hoặc bạn có thể dán đường dẫn khác).
* Nhấn **Rút gọn Link ngay** và bấm **Copy** để sử dụng.

---

## 🛠️ Nâng cấp & Tích hợp vào công cụ khác (Contributing)

Dự án được thiết kế theo hướng **mở và mô-đun hóa**, rất hoan nghênh cộng đồng Fork, nâng cấp tính năng mới hoặc nhúng hàm trích xuất UID (`extractFacebookUid` trong `popup.js`) vào các bộ công cụ tự động hóa, CRM, hay tiện ích quản lý cộng đồng khác.

### Một số ý tưởng nâng cấp tiếp theo (Roadmap):
- [ ] Thêm **Menu chuột phải (Context Menu)** để lấy nhanh UID ngay trên trang Facebook mà không cần mở popup.
- [ ] Nhận diện và hiển thị rõ loại đối tượng (`Profile` / `Fanpage` / `Group` / `Post`) kèm nút mở nhanh `fb.com/<UID>` và `m.me/<UID>`.
- [ ] Tích hợp bộ lọc **xóa tham số theo dõi** (`fbclid`, `utm_*`, `mibextid`) trước khi rút gọn hoặc chia sẻ link.
- [ ] Hỗ trợ quét danh sách nhiều link cùng lúc (Bulk UID Extractor) và xuất file `.CSV` / `.TXT` cục bộ.
- [ ] Lưu lịch sử quét gần đây bằng `chrome.storage.local` (có nút xóa sạch dữ liệu bất cứ lúc nào).

Nếu bạn muốn đóng góp code hoặc đề xuất tính năng, hãy tạo **Issue** hoặc gửi **Pull Request** trực tiếp tại repository này!
