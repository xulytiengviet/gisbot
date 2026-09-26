# Tích hợp VietBot cho GISBot

Các repository thượng nguồn được kiểm tra ngày 26-09-2026:

| Repository | Nhánh | Phạm vi | Giấy phép |
|---|---|---|---|
| [vietbot_client](https://github.com/phanmemkhoinghiep/vietbot_client) | main | Kotlin/Android, ESP-IDF/ESP32, Python, widget web | MIT |
| [vietbot_server](https://github.com/phanmemkhoinghiep/vietbot_server/tree/beta) | beta | MQTT, PCM/audio sequence, STT/TTS | Chưa thấy LICENSE ở gốc nhánh beta |
| [vietbot_offline](https://github.com/phanmemkhoinghiep/vietbot_offline) | main | Python/Linux, Raspberry Pi, KWS, NLU, skill | GPL-3.0 |
| [custom_components](https://github.com/phanmemkhoinghiep/custom_components) | main | Home Assistant và TTS Google, Viettel, Zalo | MIT |

GISBot dùng thông tin công khai từ GitHub qua API `/api/sources`, không sao chép mã GPLv3 vào phần frontend MIT. Tự triển khai VietBot server phải sử dụng mã theo giấy phép thực tế của từng repository và phụ thuộc.

## Thành phần triển khai

```text
Browser -> Cloudflare Pages -> /api/geocode -> Nominatim
                            -> /api/sources -> GitHub REST
                            -> /api/chat    -> OpenRouter (BYOK/secret bảo vệ)
Thiết bị -> VietBot OTA có thẩm quyền -> Server riêng có MQTT/WebSocket/Opus/STT/TTS
Home Assistant riêng -> custom_components
Raspberry Pi / PC riêng -> vietbot_offline (GPLv3)
```

Tài liệu `vietbot_server` beta mô tả client gửi `start_send`, gói PCM với sequence 4 byte và `finish_send`; server trả `finish_transcoding`, `tts_result` hoặc `music_result`. Pages Functions **không thay thế** MQTT broker/Python daemon.

## Kích hoạt thiết bị thật

Theo tài liệu `vietbot_client/JS_SITE/README.md`: chủ tài khoản tạo Agent tại `web.vietbot.vn`, mở `live.vietbot.vn` để lấy mã sáu chữ số do máy chủ sinh, nhập mã đó tại trang quản lý để liên kết thiết bị. Widget công khai yêu cầu token site-bound và allowlist domain do trang có thẩm quyền cấp. Không ghi token site-bound vào Git public và không giả lập mã kích hoạt.

## An toàn

Tại thời điểm kiểm tra, cấu hình mẫu `vietbot_server/src/config.json` trong nhánh beta công khai chứa thông tin xác thực broker MQTT ở dạng văn bản. Không nhập các giá trị đó vào GISBot, không phát tán lại; chủ máy chủ cần thu hồi/thay mới, giới hạn mạng và quyền truy cập. AI không được gửi lệnh điều khiển Home Assistant/thiết bị trực tiếp nếu chưa có bước xác nhận và phân quyền riêng.

Nominatim public: giới hạn truy vấn, không autocomplete, cache, gắn attribution và đặt Cloudflare WAF rate limiting; với lưu lượng lớn cần geocoder riêng. Không dùng tile Google không được cấp quyền.