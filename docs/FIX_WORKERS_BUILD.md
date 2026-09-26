# Khắc phục GISBot Cloudflare Workers Builds (26/09/2026)

Nhánh `main` của GISBot nay hỗ trợ **Workers + Static Assets**. Cloudflare service đang dùng đường dẫn `/workers/services/view/gisbot/.../builds/...` nên phải dùng `wrangler deploy`, **không** dùng `wrangler pages deploy` hay `pages_build_output_dir`.

## Thiết lập bắt buộc trong Dashboard

1. Mở Cloudflare → Workers & Pages → **gisbot** → Settings → **Build**.
2. Kiểm tra **Git repository** là `xulytiengviet/gisbot`, **Production branch** `main`, **Root directory** là gốc repository (trống hoặc `/`, không phải `public`).
3. **Build command**: `npm run build` (hoặc `npm install && npm run build` nếu Cloudflare chưa tự cài dependencies). **Deploy command**: `npx wrangler deploy`. Build variables không thay thế Runtime secrets.
4. Cấu hình này tương ứng với `wrangler.toml`: `main=./src/worker.js`, `assets.directory=./public`, `assets.binding=ASSETS`, `run_worker_first=true`. Pages API handlers vẫn nằm trong `functions/api/` và được Worker import; chúng **không tự động triển khai** như Pages Functions trên Workers.
5. Đẩy `main` hoặc nhấn **Retry deployment** tại build thất bại (Cloudflare dùng cài đặt build mới nhất khi retry). Kiểm tra logs, URL được báo thực tế trong Workers & Pages → gisbot → Domains & Routes.

## Kiểm tra sau triển khai

- `/` tải trang WebGIS; `/api/health` trả JSON có `ok: true` và `runtime: Cloudflare Workers`.
- `/api/sources` lấy thông tin repository từ GitHub khi upstream hoạt động.
- `/api/geocode?q=Vinh%20Long` kiểm tra địa danh Nominatim (cần outbound network).
- `/api/chat` chỉ hỗ trợ POST, yêu cầu OpenRouter API key của người dùng hoặc cả hai runtime secrets `OPENROUTER_API_KEY` và `GISBOT_ACCESS_TOKEN`.
- Nếu DNS account có Workers subdomain, URL mặc định là một **workers.dev** address như `<service>.<subdomain>.workers.dev`, KHÔNG phải `gisbot.pages.dev`. Xem URL đã được Cloudflare thực tế cấp, không suy đoán.

## Xử lý theo thông báo lỗi

- `Missing entry-point to Worker script` hoặc `pages_build_output_dir is not supported` → chắc chắn commit mới có `main=./src/worker.js` và `wrangler.toml` phiên bản Workers.
- `No such file or directory: public` → Root directory sai; chọn gốc repo.
- `Unknown argument / pages deploy` → Deploy command phải là `npx wrangler deploy`.
- `No routes configured` hoặc thiếu public URL → mở Domains & Routes, bật `workers.dev` hoặc thêm tên miền do bạn sở hữu.
- `Authorization failed` → kiểm tra Workers Builds API token và quyền triển khai trong đúng Cloudflare account.
- Website có giao diện nhưng `/api/*` trả HTML hoặc 404 → kiểm tra `src/worker.js` và `run_worker_first=true`; không chuyển nguyên `functions/` vào `public/`.

**Lưu ý quyền truy cập:** Mã nguồn được cập nhật qua GitHub. Không có kết nối Cloudflare được ủy quyền trong phiên hiện tại để đọc build log riêng tư hoặc sửa Settings của tài khoản; trạng thái triển khai thực tế phải kiểm tra trên Cloudflare Dashboard.

Tài liệu Cloudflare: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ · https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
