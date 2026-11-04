# کرافتو وی‌پی‌ان کنترل | Crafto VPN Control

**کرافتو وی‌پی‌ان کنترل** یک شبیه‌ساز تعاملی برای نمایش نحوه مدیریت و کنترل VPN با استفاده از هوش مصنوعی (AI Agent) و پروتکل MCP است.

### ایده پروژه چیست؟

در این پروژه نشان می‌دهیم که چطور یک عامل هوش مصنوعی می‌تواند با کمک MCP با ابزارهای مدیریت VPN ارتباط برقرار کند و دستورهای کاربر را اجرا کند.

**پروتکل MCP چیست؟**

پروتکل MCP مخفف Model Context Protocol است؛ پروتکلی که به مدل‌های هوش مصنوعی اجازه می‌دهد به ابزارها و منابع خارجی متصل شوند و با آن‌ها تعامل داشته باشند.

به کمک MCP، به‌جای اینکه کاربر تمام تنظیمات VPN را به‌صورت دستی انجام دهد، می‌تواند با زبان طبیعی از هوش مصنوعی بخواهد کارهایی مثل اتصال به VPN، تغییر موقعیت سرور یا بررسی وضعیت اتصال را انجام دهد.

### قابلیت‌های شبیه‌ساز

- **داشبورد VPN:** نمایش وضعیت اتصال، موقعیت سرور، آدرس IP و تنظیمات VPN.
- **ترمینال هوشمند:** ارسال دستورهای متنی و مشاهده نحوه پردازش آن‌ها توسط عامل هوش مصنوعی.
- **شبیه‌سازی MCP:** نمایش فراخوانی ابزارها و نتایج اجرای دستورها.
- **وضعیت مشترک:** هماهنگی تغییرات بین داشبورد و ترمینال.

### دستورات پشتیبانی‌شده

```text
connect VPN
connect to Germany
disconnect VPN
reconnect VPN
show connection status
change location to USA
list available locations
show my IP
get VPN IP
change protocol to WireGuard
enable network lock
disable auto connect
run speed test
check VPN connection
show VPN statistics
```

همچنین دستورهای طبیعی و محاوره‌ای مانند `please switch to Japan` نیز پشتیبانی می‌شوند.

### اجرای آنلاین پروژه

**دموی زنده:** [مشاهده و اجرای Crafto VPN Control](https://cybercrafto.github.io/crafto-vpn-control/)

**مخزن پروژه:** [GitHub Repository](https://github.com/CyberCrafto/crafto-vpn-control)

### نکته مهم

این پروژه صرفاً یک شبیه‌ساز در بخش رابط کاربری است و به VPN واقعی، سرور یا API متصل نمی‌شود. تمام اطلاعات و نتایج نمایش‌داده‌شده ساختگی هستند و هدف آن نمایش مفاهیم AI Agent و MCP در مدیریت VPN است.

---

© Shahin Crafto — Crafto VPN Control
