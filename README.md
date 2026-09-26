# GISBot · WebGIS + Trợ lý AI tiếng Việt

Nền tảng GISBot độc lập: bản đồ OpenStreetMap, địa hình OpenTopoMap, tra cứu Nominatim, định vị theo quyền người dùng, điểm tự chọn, đo khoảng cách, nạp/xuất GeoJSON, lệnh tiếng Việt, TTS/STT trình duyệt, AI qua OpenRouter, danh sách thiết bị lưu cục bộ, metadata thượng nguồn trực tiếp từ GitHub.

**Không phải giả lập:** các chức năng bản đồ và GeoJSON chạy thực tế, API Cloudflare gửi yêu cầu tới dịch vụ bên ngoài khi được cấu hình. **Chưa tích hợp:** xác thực VietBot, cấp mã OTA, broker MQTT, Python STT/TTS streaming, tài khoản và cơ sở dữ liệu đa người dùng. Các thao tác này phải sử dụng server có quyền riêng, không thể chỉ chạy trên Pages tĩnh. Danh sách thiết bị trong GISBot được gắn nhãn lưu cục bộ, không giả lập trạng thái online.

## Cấu trúc

- `public/index.html`, `public/styles.css`, `public/app.js`: giao diện thích ứng desktop và mobile.
- `functions/api/health.js`: trạng thái hoạt động, không lộ secret.
- `functions/api/geocode.js`: địa danh Nominatim, giới hạn truy vấn và cache.
- `functions/api/sources.js`: dữ liệu repository thực từ GitHub API.
- `functions/api/chat.js`: proxy OpenRouter dạng BYOK hoặc secret có xác thực.
- `docs/TICH_HOP.md`: tài liệu kiến trúc tham khảo VietBot và điều kiện license.

## Cloudflare Pages

1. Truy cập **Workers & Pages → Create → Pages → Connect to Git** trong [Cloudflare Dashboard](https://dash.cloudflare.com/), cho phép truy cập `xulytiengviet/gisbot`.
2. **Project name:** `gisbot` nếu còn khả dụng; **Production branch:** `main`; **Framework preset:** None; **Build command:** để trống; **Output directory:** `public`; **Root directory:** `/`.
3. Cloudflare Pages sẽ nhận `functions/` ở gốc repo và triển khai các endpoint `/api/*`.
4. Kiểm tra `/api/health`, `/api/sources`, `/api/geocode?q=Vinh%20Long`; nếu API chưa chạy, kiểm tra đang tạo **Pages**, không phải Workers với cấu hình build riêng.
5. Mỗi người có thể nhập OpenRouter API key cá nhân trong tab **Cài đặt**; khóa chỉ tồn tại trong bộ nhớ tab, không được ghi vào Git hay localStorage. Cách khác: tạo cả hai secret đã mã hóa `OPENROUTER_API_KEY` và `GISBOT_ACCESS_TOKEN` trong Cloudflare Settings → Variables and Secrets. Người dùng nhập mã truy cập trong Cài đặt GISBot. Không mở khóa server chung khi chưa có mã truy cập.
6. Thiết lập WAF/rate limiting cho `/api/chat` và `/api/geocode` khi triển khai công khai. Nominatim miễn phí chỉ phù hợp với mức sử dụng thấp, phải tuân thủ chính sách và không làm autocomplete.
7. URL sẽ được Cloudflare cấp ở dạng `https://<tên-project>.pages.dev`; tạo repo **không** tự tạo Cloudflare project hay đặt tên miền cho bạn.

### Chạy local

```bash
npm test
npm run check
npx wrangler pages dev public
```

Cần kết nối Internet để tải thư viện Leaflet, OSM/OpenTopoMap tiles và sử dụng GitHub/Nominatim/OpenRouter. Nhận dạng giọng nói Web Speech API có thể xử lý từ xa qua dịch vụ của nhà cung cấp trình duyệt.

## Quyền riêng tư và nguồn

- GeoJSON chỉ xử lý trong trình duyệt; không tự upload khi chọn file. Thiết bị lưu trong `localStorage`; không lưu mật khẩu MQTT, mã OTA hay khóa OpenRouter.
- Khi hỏi AI, nội dung câu hỏi và tâm bản đồ (không phải vị trí địa lý thực của người dùng) được gửi tới OpenRouter; chỉ thực hiện khi người dùng bấm Gửi.
- Bản đồ © OpenStreetMap contributors; lớp địa hình © OpenTopoMap.
- Phần GISBot tự viết theo MIT. `vietbot_client` và `custom_components` dùng MIT; `vietbot_offline` GPLv3 chỉ được tham khảo/giữ riêng. `vietbot_server` beta chưa thấy LICENSE ở gốc nhánh đã kiểm tra: không sao chép trực tiếp code. Xem [docs/TICH_HOP.md](docs/TICH_HOP.md).

GISBot là dự án độc lập tham khảo hệ sinh thái phần mềm mở VietBot, không đại diện trang VietBot gốc.