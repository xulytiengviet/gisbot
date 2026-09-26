# GISBot · WebGIS + AI tiếng Việt

GISBot kết hợp bản đồ OpenStreetMap, OpenTopoMap, tra cứu địa danh Nominatim, đo khoảng cách, nạp/xuất GeoJSON, giọng nói trình duyệt và API AI OpenRouter. GISBot tham khảo tài liệu giao thức trong hệ sinh thái VietBot; đây là dự án độc lập, không đại diện VietBot.

## Triển khai lên Cloudflare Workers — phiên bản 1.1

**Phù hợp với dịch vụ GISBot hiện đã tạo trong Cloudflare Workers Builds.** Mã nguồn dùng `src/worker.js` làm Worker entry, phục vụ `public/` thông qua Assets binding và tái sử dụng các endpoint `functions/api/`.

Trong Cloudflare → Workers & Pages → gisbot → Settings → Build:

- Git repository: `xulytiengviet/gisbot`; Production branch: `main`; Root directory: gốc repo.
- Build command: `npm run build`.
- Deploy command: `npx wrangler deploy`.
- Sau deployment, xem URL được Cloudflare cấp tại Domains & Routes rồi kiểm tra `/api/health`.

Chi tiết lỗi và cách khắc phục: [docs/FIX_WORKERS_BUILD.md](docs/FIX_WORKERS_BUILD.md).

## Kiểm thử và chạy local

```sh
npm install
npm run build
npm run dev
```

**Mã nguồn:** `public/` là WebGIS frontend; `functions/api/` chứa các module API được cả Workers và Pages gọi; `src/worker.js` là entry Workers; `tests/` kiểm tra API và tuyến Worker; `wrangler.toml` là cấu hình Workers.

**Chưa triển khai trong GISBot:** đăng nhập VietBot, ghép nối OTA, broker MQTT, Opus/STT/TTS streaming, dữ liệu thiết bị trực tiếp. Các tính năng đó cần server được cấp quyền. Danh sách thiết bị đang lưu cục bộ; không hiển thị giả trạng thái trực tuyến.

**Bảo mật:** không đưa MQTT credentials, OpenRouter key, mã OTA lên GitHub. Có thể nhập OpenRouter API key riêng trong bộ nhớ tab. Nếu cấu hình AI chung, đặt `OPENROUTER_API_KEY` và `GISBOT_ACCESS_TOKEN` tại Worker Runtime Variables & Secrets, thêm Rate Limiting/WAF cho `/api/chat`.

**Giấy phép:** GISBot MIT; `vietbot_client` và `custom_components` MIT; `vietbot_offline` GPLv3 chỉ được tham khảo và triển khai riêng; không sao chép code `vietbot_server` khi chưa xác minh license. Xem [docs/TICH_HOP.md](docs/TICH_HOP.md).

© 2026 GISBot · Bản đồ © OpenStreetMap contributors.
