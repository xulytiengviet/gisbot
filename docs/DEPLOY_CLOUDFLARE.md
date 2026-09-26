# Triển khai GISBot trên Cloudflare Pages

Cấu hình được kiểm tra theo tài liệu Cloudflare Pages ngày 26/09/2026. GISBot là dự án độc lập; mã nguồn web/GIS và Pages Functions đã nằm trong repo này. **Đưa mã lên GitHub không đồng nghĩa đã tạo Pages project.** Người sở hữu tài khoản Cloudflare phải cấp quyền kết nối GitHub cho Pages một lần.

## 1. Tạo hoặc nối lại Pages project

1. Mở Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git / Import an existing Git repository**. Chọn **Pages**, không chọn "Create Worker". Nếu dashboard mở giao diện Workers mặc định, chuyển sang Pages.
2. Cho phép Cloudflare GitHub App đọc `xulytiengviet/gisbot`; chọn repo này. Nếu repo không hiện, vào GitHub → Settings → Applications → Cloudflare Pages → Configure và cấp quyền repo.
3. **Tên dự án:** `gisbot` (nếu còn khả dụng). **Production branch:** `main`. **Framework preset:** `None`. **Root directory:** để trống (gốc repo). **Build command:** `exit 0`. **Build output directory:** `public`.
4. Xác nhận dự án đọc `wrangler.toml` đúng: `name=gisbot`, `pages_build_output_dir=./public`. Nếu đã có Pages project cùng tên với cấu hình khác, *không* đè cấu hình hiện tại khi chưa so sánh; dùng `npx wrangler pages download config gisbot` trong môi trường được phép rồi đối chiếu.
5. Chọn **Save and Deploy**. Sau khi thành công, URL dạng `https://gisbot.pages.dev` **chỉ đúng nếu tên dự án gisbot được cấp và đã deploy**.

Tài liệu: https://developers.cloudflare.com/pages/get-started/git-integration/ và https://developers.cloudflare.com/pages/functions/get-started/.

## 2. Xác minh hoạt động (không dùng giả lập)

Trên trang đã deploy, mở các URL: `/`, `/api/health`, `/api/sources` và `/api/geocode?q=Vinh%20Long`. Hai endpoint `/api/sources`, `/api/geocode` cần upstream GitHub/Nominatim hoạt động; `/api/health` không cần secret.

Nếu trang chủ lên nhưng `/api/health` trả 404: thường do chọn sai Workers thay vì Pages, đặt nhầm `functions` trong `public`, hoặc chỉ kéo-thả file tĩnh. Thư mục `functions/` bắt buộc nằm ở **gốc repo** và phải deploy bằng Git Integration hoặc Wrangler hỗ trợ Functions.

Cách chạy local (Windows PowerShell, cần Node 22+ và đăng nhập Cloudflare khi triển khai):

```powershell
npm test
npm run check
npx wrangler pages dev public
# Nếu dùng deploy thủ công thay Git Integration: 
# npx wrangler login
# npx wrangler pages deploy public --project-name gisbot --branch main
```

**Lưu ý:** Không chọn Direct Upload bằng kéo-thả cho dự án có Pages Functions. Một Pages project tạo bằng Direct Upload không thể chuyển trực tiếp sang Git Integration; cần tạo project Pages mới nếu muốn tự động đồng bộ GitHub.

## 3. Tài khoản AI và Secrets

Bản đồ, đo đạc, nạp/xuất GeoJSON chạy không cần khóa AI. Người dùng có thể nhập API key OpenRouter riêng tại tab **Cài đặt** (khóa chỉ ở bộ nhớ tab). Nếu muốn cấp tài nguyên máy chủ chung, tạo **cả hai** secrets cho Pages Functions tại Project → Settings → Variables and Secrets / Environment variables:

- `OPENROUTER_API_KEY`: API key thực, chỉ lưu dưới dạng **Encrypted secret**.
- `GISBOT_ACCESS_TOKEN`: chuỗi bí mật mạnh do quản trị viên tự tạo; người dùng được cấp quyền nhập vào tab Cài đặt. Bảo vệ bằng rate limit/WAF trên `/api/chat` nếu public.

Không commit secrets vào GitHub, không copy broker credentials từ repository VietBot hoặc đưa token tới chatbot. Chức năng OTA, MQTT, audio streaming, Home Assistant cần máy chủ và tài khoản có quyền riêng, hiện chưa có trong GISBot Pages.

## 4. Kiểm tra kết quả

Khi Deployment hiện **Success**, kiểm tra URL trên thanh **Domains & Routes** hoặc phần **Deployments**. Nếu domain `gisbot.pages.dev` đã có người khác sử dụng, đặt tên riêng, ví dụ `gisbot-longngo`, rồi điều chỉnh `name` trong cấu hình sau khi đối chiếu dự án đã được tạo. Không coi một địa chỉ dự đoán là đã cấp phát trước khi dashboard trả về.

Cloudflare tự triển khai mỗi khi branch `main` cập nhật sau khi Git Integration đã được cấp quyền và kích hoạt. Để có môi trường thử nghiệm, bật Preview deployments cho branch `dev`, sau đó tạo/push branch đó khi cần.

Nguồn: https://developers.cloudflare.com/pages/configuration/build-configuration/ · https://developers.cloudflare.com/pages/functions/wrangler-configuration/.
