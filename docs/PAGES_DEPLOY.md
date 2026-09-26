# GISBot — đường dẫn gisbot.pages.dev

Cloudflare Workers và Cloudflare Pages là **hai sản phẩm triển khai khác nhau**. Nhánh **main** dành cho Workers service `gisbot` hiện có, do đó không tự cấp `https://gisbot.pages.dev/`. Nhánh **pages** này dùng cấu hình Pages độc lập. Không chuyển Worker hiện đang hoạt động sang Pages một cách ngầm định.

## Khi chỉ cần GISBot hoạt động ngay

Vào Workers & Pages → Worker `gisbot` → **Settings → Domains & Routes** → bật `workers.dev` và sử dụng địa chỉ thật Cloudflare hiển thị (thông thường dạng `gisbot.<account-subdomain>.workers.dev`). Thử thêm `/api/health` để xác nhận tuyến API thực sự chạy. Nếu không có URL, chọn Add Route → workers.dev nếu giao diện tài khoản hỗ trợ.

## Khi bắt buộc sử dụng https://gisbot.pages.dev/

1. Workers & Pages → **Create application** → **Pages** → Connect to Git. Nếu đã có Pages project `gisbot`, mở project đó và cấu hình lại thay vì tạo trùng.
2. Chọn repository `xulytiengviet/gisbot` và **production branch `pages`**. Nhánh `main` sẽ tiếp tục dành cho Workers.
3. Chọn tên dự án `gisbot` nếu Cloudflare thông báo tên này còn khả dụng và được cấp cho tài khoản của bạn. Tên subdomain Pages là do Cloudflare cấp khi tạo dự án; nếu tên đã thuộc một dự án khác, không thể ép Cloudflare cấp lại chỉ bằng sửa GitHub.
4. Framework preset: **None**; Root directory: gốc repo; Build command: `npm run build`; Build output directory: `public`. GitHub branch `pages` có `wrangler.toml` chứa `pages_build_output_dir = "./public"` phù hợp với Pages.
5. Lưu và triển khai. Nếu kết nối GitHub chưa được cấp quyền, cấp quyền repository từ GitHub Apps. Nếu có trang Pages nhưng trang cũ, kiểm tra deployment mới nhất của production branch và cache browser.
6. Kiểm tra `https://gisbot.pages.dev/` và `https://gisbot.pages.dev/api/health`. API `/api/health` dựa trên `functions/api/health.js`, được Pages Functions triển khai từ thư mục **functions tại gốc repo**, không phải trong `public`.

**Trong trường hợp tạo Pages project đã tồn tại:** chọn Settings → Builds & deployments → Production branch → `pages` (tên menu có thể khác theo phiên bản Dashboard), sau đó triển khai lại production branch.

**Không dùng `npx wrangler deploy` trong Pages project.** Lệnh đó chỉ deploy Workers và sẽ không tạo Pages deployment.

**Secret:** Nếu nhập OpenRouter key chung, cấu hình riêng cho Pages project tại Settings → Variables and Secrets: `OPENROUTER_API_KEY` và `GISBOT_ACCESS_TOKEN`. Secrets của Worker không tự chuyển sang Pages.

Tài liệu chính thức: https://developers.cloudflare.com/pages/get-started/git-integration/ · https://developers.cloudflare.com/pages/functions/wrangler-configuration/ · https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
