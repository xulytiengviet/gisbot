# GISBot — Cloudflare Pages branch

**Đây là nhánh `pages`, dành riêng cho Cloudflare Pages và URL `<project>.pages.dev`.** Worker service hiện có tiếp tục deploy từ nhánh `main`; không thay đổi production Worker.

Để sử dụng địa chỉ `https://gisbot.pages.dev`, tạo hoặc cấu hình Pages project trong tài khoản Cloudflare của bạn, chọn repository `xulytiengviet/gisbot`, production branch **`pages`**, build command `npm run build` và build output directory `public`. Chỉ có Cloudflare Dashboard mới xác nhận được rằng địa chỉ `gisbot.pages.dev` đã được cấp cho project và triển khai thành công.

Mã nguồn WebGIS nằm trong `public/`. Cloudflare Pages Functions tự phục vụ `/api/health`, `/api/sources`, `/api/geocode` và `/api/chat` từ `functions/api/`.

Xem [hướng dẫn khắc phục gisbot.pages.dev](docs/PAGES_DEPLOY.md).

Lệnh local:

```bash
npm install
npm run build
npm run dev
```

Không commit secret vào GitHub. Giữ tách biệt credential của Workers và Pages. © 2026 GISBot · OpenStreetMap contributors.
