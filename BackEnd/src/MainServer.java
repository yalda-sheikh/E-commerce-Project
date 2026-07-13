import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MainServer {
    // لیست‌های عمومی و استاتیک برای نگهداری داده‌های سیستم در حافظه (RAM)
    public static List<User> allUsers = new ArrayList<>(); // ذخیره تمامی کاربران سیستم (مشتری، ادمین و...)
    public static List<Product> allBaseProducts = new ArrayList<>(); // ذخیره اطلاعات پایه محصولات
    public static List<ProductItem> allProductItems = new ArrayList<>();
    public static List<DiscountCode> allDiscountCodes = new ArrayList<>();


    public static void main(String[] args) throws IOException {

        // فراخوانی متد بارگذاری داده‌ها از فایل‌های متنی سیستم به داخل لیست‌ها در زمان استارت سرور
        loadData();

        // راه‌اندازی سرور HTTP روی پورت 8080 لوکال‌هاست با صف انتظار پیش‌فرض (0)
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // ۱. کانتکست سبد خرید
        // مدیریت مسیر /api/cart برای مشاهده جزئیات سبد خرید کاربر
        server.createContext("/api/cart", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                // تنظیم هدرهای CORS و فونت برای سینک با فرانت‌اِند ریکت
                // اجازه دسترسی به منابع سرور از هر مبدایی (*) داده می‌شود
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                // متدهای مجاز برای ارسال به این کانتکست (دریافت داده و بررسی CORS)
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
                // هدرهای مجاز ارسال شده توسط فرانت‌اِند
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                // تعیین فرمت خروجی سرور به صورت JSON و تنظیم انکودینگ متون به UTF-8 جهت پشتیبانی از زبان فارسی
                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

                // مدیریت درخواست پیش‌پرواز (Preflight Request) توسط مرورگر برای بررسی امنیت CORS
                if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                    exchange.sendResponseHeaders(200, -1); // پاسخ با کد 200 و بستن بدنه
                    return;
                }

                String responseText = "";
                // پردازش درخواست اصلی از نوع GET
                if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
                    // استخراج userId از کوئری استرینگ (مثال: ?userId=1)
                    String query = exchange.getRequestURI().getQuery();
                    int userId = -1;
                    // بررسی معتبر بودن کوئری استرینگ و وجود پارامتر userId
                    if (query != null && query.contains("userId=")) {
                        try {
                            // تکه‌تکه کردن رشته کوئری برای استخراج عدد شناسه کاربر و نادیده گرفتن بقیه پارامترها با علامت &
                            userId = Integer.parseInt(query.split("userId=")[1].split("&")[0]);
                        } catch (Exception e) {
                            userId = -1; // در صورت بروز خطا در پارس کردن عدد، مقدار به 1- بازمی‌گردد
                        }
                    }

                    // پیدا کردن کاربر مشتری در لیست سیستم
                    Customer currentCustomer = null;
                    for (User u : allUsers) {
                        // چک کردن شناسه کاربر و بررسی اینکه آیا شیء از نوع کلاسی Customer (مشتری) است یا خیر
                        if (u.userId == userId && u instanceof Customer) {
                            currentCustomer = (Customer) u; // تبدیل متغیر عمومی کاربر به نوع تخصصی مشتری (Downcasting)
                            break;
                        }
                    }

                    // در صورتی که مشتری با این شناسه در سیستم یافت شد
                    if (currentCustomer != null) {
                        // ساخت دستی خروجی JSON طبق نیازهای کامپوننت ریکت شما
                        StringBuilder jsonBuilder = new StringBuilder();
                        jsonBuilder.append("{");
                        // اضافه کردن موجودی ولت کاربر به رشته جی‌سان
                        jsonBuilder.append("\"wallet\":").append(currentCustomer.getWallet()).append(",");
                        // اضافه کردن قیمت کل سبد خرید به رشته جی‌سان
                        jsonBuilder.append("\"totalPrice\":").append(currentCustomer.getCartTotal()).append(",");
                        // آغاز آرایه مربوط به آیتم‌های موجود در سبد خرید
                        jsonBuilder.append("\"cartItems\":[");

                        int index = 0;
                        int cartSize = currentCustomer.getCart().size();
                        // پیمایش مپ (Map) سبد خرید مشتری که شامل جفت‌های (محصول، تعداد) است
                        for (Map.Entry<ProductItem, Integer> entry : currentCustomer.getCart().entrySet()) {
                            ProductItem item = entry.getKey(); // دریافت شیء کالا
                            int quantity = entry.getValue(); // دریافت تعداد انتخاب شده از کالا
                            // بررسی وجود اطلاعات پایه محصول برای گرفتن نام آن، در غیر این صورت مقدار "نامشخص"
                            String productName = (item.product != null) ? item.product.getName() : "نامشخص";

                            // ساخت ساختار آبجکت JSON برای هر آیتم سبد خرید
                            jsonBuilder.append("{");
                            jsonBuilder.append("\"itemId\":").append(item.getItemId()).append(",");
                            jsonBuilder.append("\"name\":\"").append(productName).append("\",");
                            jsonBuilder.append("\"price\":").append(item.getPriceAfterDiscount()).append(",");
                            jsonBuilder.append("\"quantity\":").append(quantity);
                            jsonBuilder.append("}");

                            // اگر آیتم جاری، آخرین آیتم سبد خرید نباشد، علامت کاما (,) قرار داده می‌شود
                            if (index < cartSize - 1) {
                                jsonBuilder.append(",");
                            }
                            index++;
                        }
                        jsonBuilder.append("]");
                        jsonBuilder.append("}");

                        responseText = jsonBuilder.toString(); // تبدیل بیلدر به رشته نهایی JSON
                        byte[] responseBytes = responseText.getBytes("UTF-8");
                        exchange.sendResponseHeaders(200, responseBytes.length); // ارسال هدر موفقیت (200 OK) به همراه طول بایت پاسخ
                    } else {
                        // ارسال ارور به صورت خروجی JSON در صورت عدم یافتن مشتری
                        responseText = "{\"error\":\"مشتری با این مشخصات یافت نشد یا هنوز لاگین نکرده‌اید!\"}";
                        exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length); // کد وضعیت 400 Bad Request
                    }
                } else {
                    // پاسخ در صورتی که متدی غیر از GET یا OPTIONS ارسال شود
                    responseText = "{\"error\":\"Method not allowed\"}";
                    exchange.sendResponseHeaders(405, responseText.getBytes("UTF-8").length); // کد وضعیت 405 Method Not Allowed
                }

                // باز کردن استریم خروجی و نوشتن بایت‌های پاسخ روی شبکه و سپس بستن آن
                OutputStream os = exchange.getResponseBody();
                os.write(responseText.getBytes("UTF-8"));
                os.close();
            }
        });

//  کانتکست شارژ کیف پول

        // مدیریت مسیر /api/wallet/charge برای افزایش موجودی حساب کاربر
        server.createContext("/api/wallet/charge", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                // اعمال تنظیمات هدر برای پذیرش درخواست‌های خارج از دامین (CORS) و فرمت JSON فارسی
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

                // مدیریت هدر OPTIONS برای مرورگر
                if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                    exchange.sendResponseHeaders(200, -1);
                    return;
                }

                String responseText = "";
                // پردازش درخواست ارسال داده با متد POST
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    // خواندن کل داده‌های بدنه درخواست فرستاده شده از سمت کلاینت
                    InputStream is = exchange.getRequestBody();
                    String body = new String(is.readAllBytes(), "UTF-8");

                    int userId = -1;
                    double amount = 0;

                    // پارس دستی رشته خام بدنه به صورت متنی برای استخراج پارامتر userId از داخل JSON رشته‌ای
                    if (body.contains("\"userId\"")) {
                        userId = Integer.parseInt(body.split("\"userId\":")[1].split(",")[0].split("}")[0].trim());
                    }
                    // پارس دستی رشته خام بدنه برای استخراج پارامتر مقدار شارژ (amount)
                    if (body.contains("\"amount\"")) {
                        amount = Double.parseDouble(body.split("\"amount\":")[1].split(",")[0].split("}")[0].trim());
                    }

                    // جستجو در میان تمامی کاربران سیستم برای یافتن فردی که شناسه او با شناسه ارسالی برابر است
                    User foundUser = null;
                    for (User u : allUsers) {
                        if (u.userId == userId) {
                            foundUser = u;
                            break;
                        }
                    }

                    // بررسی وجود کاربر و معتبر بودن مبلغ شارژ (حداقل باید 1000 واحد باشد)
                    if (foundUser != null && amount >= 1000) {
                        // افزایش ولت در سطح شیء جاوا
                        foundUser.setWallet(foundUser.getWallet() + amount);
                        saveData(); // ذخیره در فایل users.txt جهت پایداری داده‌ها پس از خاموش شدن سرور

                        // ساختن ریسپانس موفقیت به همراه موجودی جدید کیف پول
                        responseText = "{"
                                + "\"message\":\"✅ حساب شما با موفقیت شارژ شد.\","
                                + "\"newWallet\":" + foundUser.getWallet()
                                + "}";
                        exchange.sendResponseHeaders(200, responseText.getBytes("UTF-8").length);
                    } else {
                        // ارسال خطا در صورت پیدا نشدن کاربر یا کم بودن مبلغ ارسالی از کف مجاز
                        responseText = "{\"error\":\"کاربر یافت نشد یا مبلغ نامعتبر است.\"}";
                        exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                    }
                } else {
                    responseText = "{\"error\":\"Method not allowed\"}";
                    exchange.sendResponseHeaders(405, responseText.getBytes("UTF-8").length);
                }

                // فرستادن اطلاعات نهایی به سمت کلاینت و بستن جریان پاسخ
                OutputStream os = exchange.getResponseBody();
                os.write(responseText.getBytes("UTF-8"));
                os.close();
            }
        });

// کانتکست دریافت تاریخچه خریدها

        // مدیریت مسیر /api/purchase-history برای بازگرداندن سوابق تراکنش‌ها و رسیدهای خرید کاربر
        server.createContext("/api/purchase-history", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {

                // اعمال هدرهای هماهنگی با فرانت‌اند و برطرف‌سازی خطاهای CORS
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

                if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                    exchange.sendResponseHeaders(200, -1);
                    return;
                }

                String responseText = "";
                if (exchange.getRequestMethod().equalsIgnoreCase("GET")) {
                    // تفکیک و استخراج آی‌دی کاربر از کوئری یو‌آر‌آی
                    String query = exchange.getRequestURI().getQuery();
                    int userId = -1;
                    if (query != null && query.contains("userId=")) {
                        userId = Integer.parseInt(query.split("userId=")[1].split("&")[0]);
                    }

                    // پیدا کردن شیء مشتری متناظر با آی‌دی دریافتی
                    Customer currentCustomer = null;
                    for (User u : allUsers) {
                        if (u.userId == userId && u instanceof Customer) {
                            currentCustomer = (Customer) u;
                            break;
                        }
                    }

                    // اگر مشتری در دیتابیس حافظه‌ای برنامه وجود داشت
                    if (currentCustomer != null) {
                        // ساخت دستی رشته JSON از روی لیست آرایه خریدهای کاربر
                        StringBuilder jsonBuilder = new StringBuilder();
                        jsonBuilder.append("["); // شروع یک آرایه جی‌سانی

                        // گرفتن لیست کل فاکتورها/خریدهای ثبت شده از گتر کلاس مشتری
                        ArrayList<Purchase> history = currentCustomer.getPurchaseHistory(); // فرض بر وجود گتر در کلاس کاستومر
                        for (int i = 0; i < history.size(); i++) {
                            Purchase p = history.get(i);
                            jsonBuilder.append("{");
                            jsonBuilder.append("\"purchaseId\":").append(p.getPurchaseId()).append(","); // متد گتر فاکتور
                            jsonBuilder.append("\"date\":\"").append(p.getPurchaseDate()).append("\","); // متد گتر تاریخ
                            jsonBuilder.append("\"total\":").append(p.getTotalAmount()).append(","); // متد گتر مبلغ
                            jsonBuilder.append("\"status\":\"✅ پرداخت شده\""); // وضعیت به صورت پیش‌فرض پرداخت شده درج می‌شود
                            jsonBuilder.append("}");

                            // افزودن ویرگول جداکننده بین اعضای آرایه به جز عضو نهایی لیست
                            if (i < history.size() - 1) {
                                jsonBuilder.append(",");
                            }
                        }
                        jsonBuilder.append("]");

                        responseText = jsonBuilder.toString();
                        exchange.sendResponseHeaders(200, responseText.getBytes("UTF-8").length);
                    } else {
                        // در صورت عدم احراز یا عدم وجود کاربر مشتری
                        responseText = "{\"error\":\"مشتری یافت نشد.\"}";
                        exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                    }
                } else {
                    responseText = "{\"error\":\"Method not allowed\"}";
                    exchange.sendResponseHeaders(405, responseText.getBytes("UTF-8").length);
                }

                OutputStream os = exchange.getResponseBody();
                os.write(responseText.getBytes("UTF-8"));
                os.close();
            }
        });

        // ۲. کانتکست تسویه حساب

        // مدیریت مسیر /api/cart/checkout جهت نهایی کردن فاکتور، کسر موجودی و اعمال کدهای تخفیف خرید
        server.createContext("/api/cart/checkout", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                // اعمال هدرها و پیش‌نیازهای امنیتی تبادل داده میان ری‌اکت و جاوا
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

                if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                    exchange.sendResponseHeaders(200, -1);
                    return;
                }

                String responseText = "";
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    // استخراج userId از کوئری استرینگ آدرس
                    String query = exchange.getRequestURI().getQuery();
                    int userId = -1;
                    if (query != null && query.contains("userId=")) {
                        try {
                            userId = Integer.parseInt(query.split("userId=")[1].split("&")[0]);
                        } catch (Exception e) {
                            userId = -1;
                        }
                    }

                    // خواندن بدنه درخواست فرستاده شده از ری‌آکت جهت استخراج کد تخفیف
                    InputStream is = exchange.getRequestBody();
                    String body = new String(is.readAllBytes(), "UTF-8");
                    String discountCode = "";
                    // بررسی اینکه فرانت‌اند فیلد کد تخفیف را فرستاده است یا خیر
                    if (body.contains("\"discountCode\"")) {
                        // استخراج مقدار رشته‌ای کدتخفیف ارسالی از بدنه متنی ریکوئست
                        discountCode = body.split("\"discountCode\":\"")[1].split("\"")[0];
                    }

                    // پیدا کردن آبجکت مشتری بر اساس یوتیلیتی شناسه کاربری
                    Customer currentCustomer = null;
                    for (User u : allUsers) {
                        if (u.userId == userId && u instanceof Customer) {
                            currentCustomer = (Customer) u;
                            break;
                        }
                    }

                    if (currentCustomer != null) {
                        // اجرای منطق اصلی چک‌اوت که خودت در کلاس کاستومر نوشتی
                        // خروجی تابع متد خرید یک مقدار بولین است که موفقیت یا عدم موفقیت مالی/انباری را مشخص می‌کند
                        boolean success = currentCustomer.checkout(discountCode);
                        if (success) {
                            saveData(); // ذخیره تغییرات انبار و ولت روی فایل‌های متنی سیستم جهت همگام‌سازی دائمی هارد دیسک
                            responseText = "{\"message\":\"✅ تسویه حساب با موفقیت انجام شد.\"}";
                            exchange.sendResponseHeaders(200, responseText.getBytes("UTF-8").length);
                        } else {
                            // پیغام خطا در صورت تهی بودن سبد یا معتبر نبودن وضعیت مالی و عدم کفاف پول کاربر
                            responseText = "{\"error\":\"تسویه حساب ناموفق بود! موجودی کیف پول کافی نیست یا سبد خرید خالی است.\"}";
                            exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                        }
                    } else {
                        // بازگرداندن پاسخ عدم تایید دسترسی به دلیل نامعتبر بودن کاربر
                        responseText = "{\"error\":\"کاربر مجاز به تسویه حساب نیست یا یافت نشد.\"}";
                        exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                    }
                } else {
                    responseText = "{\"error\":\"Method not allowed\"}";
                    exchange.sendResponseHeaders(405, responseText.getBytes("UTF-8").length);
                }

                // بستن استریم ارسال پاسخ به مروگر کاربر
                OutputStream os = exchange.getResponseBody();
                os.write(responseText.getBytes("UTF-8"));
                os.close();
            }
        });
        // ۵. کانتکست افزودن به سبد خرید

        // تنظیم هندلر برای آدرس /api/cart/add جهت افزودن آیتم به سبد خرید مشتری
        server.createContext("/api/cart/add", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                // تنظیم هدرهای CORS برای مجاز کردن درخواست‌های ارسالی از سمت ریکت
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                // مشخص کردن نوع پاسخ خروجی به صورت داده‌های جی‌سان و فونت فارسی UTF-8
                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

                // پاسخ فوری و تایید هدرها در صورت دریافت درخواست پیش‌پرواز OPTIONS از مرورگر
                if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                    exchange.sendResponseHeaders(200, -1);
                    return;
                }

                String responseText = "";
                // پردازش بدنه اصلی زمانی که متد کلاینت برابر با POST باشد
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    // خواندن بادی درخواست فرستاده شده از ریکت
                    InputStream is = exchange.getRequestBody();
                    String body = new String(is.readAllBytes(), "UTF-8");

                    // تعریف مقادیر اولیه برای استخراج اطلاعات کالا و کاربر از فرم جی‌سان
                    int userId = -1;
                    int itemId = -1;
                    int quantity = 1; // به صورت پیش‌فرض ۱ عدد اضافه میکنیم

                    // پارس کردن دستی جی‌سون ارسالی از فرانت‌ند با استفاده از توابع رشته‌ای متد split
                    if (body.contains("\"userId\"")) {
                        userId = Integer.parseInt(body.split("\"userId\":")[1].split(",")[0].split("}")[0].trim());
                    }
                    if (body.contains("\"itemId\"")) {
                        itemId = Integer.parseInt(body.split("\"itemId\":")[1].split(",")[0].split("}")[0].trim());
                    }
                    if (body.contains("\"quantity\"")) {
                        quantity = Integer.parseInt(body.split("\"quantity\":")[1].split(",")[0].split("}")[0].trim());
                    }

                    // ۱. پیدا کردن کالا در انبار سیستم بر اساس شناسه دریافتی (itemId)
                    ProductItem targetItem = null;
                    for (ProductItem pi : allProductItems) {
                        if (pi.getItemId() == itemId) {
                            targetItem = pi;
                            break;
                        }
                    }

                    // ۲. پیدا کردن مشتری در لیست کل کاربران بر اساس شناسه کاربر و نوع شیء نمونه کاستومر
                    Customer currentCustomer = null;
                    for (User u : allUsers) {
                        if (u.userId == userId && u instanceof Customer) {
                            currentCustomer = (Customer) u;
                            break;
                        }
                    }

                    // بررسی شروط و اعتبارسنجی‌ها برای اضافه کردن به سبد خرید
                    if (currentCustomer == null) {
                        // پاسخ در صورت پیدا نشدن کاربر معتبر در دیتابیس حافظه‌ای
                        responseText = "{\"error\":\"کاربر معتبر یافت نشد. ابتدا لاگین کنید.\"}";
                        exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                    } else if (targetItem == null) {
                        // پاسخ در صورت نامعتبر بودن یا موجود نبودن شناسه محصول در انبار
                        responseText = "{\"error\":\"این کالا در سیستم وجود ندارد.\"}";
                        exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                    } else if (targetItem.getStock() < quantity) {
                        // پاسخ خطا در صورتی که تعداد درخواستی فرانت‌ند بیشتر از موجودی انبار (Stock) باشد
                        responseText = "{\"error\":\"❌ خطا: موجودی کافی نیست! موجودی فعلی: " + targetItem.getStock() + "\"}";
                        exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                    } else {
                        // صدا زدن متد اصلی خودت روی شیء مشتری برای ثبت آیتم در کادر مپ سبد خرید
                        currentCustomer.addToCart(targetItem, quantity);
                        saveData(); // ذخیره در فایل متنی جهت ثبت دائمی روی دیسک
                        responseText = "{\"message\":\"✅ کالا با موفقیت به سبد خرید اضافه شد.\"}";
                        exchange.sendResponseHeaders(200, responseText.getBytes("UTF-8").length);
                    }
                } else {
                    // پاسخ به کلاینت در صورت استفاده از متدهای نامعتبر شبکه
                    responseText = "{\"error\":\"Method not allowed\"}";
                    exchange.sendResponseHeaders(405, responseText.getBytes("UTF-8").length);
                }

                // نوشتن بایت‌های آرایه خروجی متن ریسپانس روی استریم شبکه و بستن کانتکست
                OutputStream os = exchange.getResponseBody();
                os.write(responseText.getBytes("UTF-8"));
                os.close();
            }
        });

        server.createContext("/api/search", (new SearchHandler(allProductItems)));
        // ۳. کانتکست دریافت لیست محصولات
        // مدیریت مسیر /api/products برای ارسال لیست تمام کالاهای موجود در انبار به کامپوننت داشبورد خرید
        server.createContext("/api/products", new HttpHandler() {
            @Override

            public void handle(HttpExchange exchange) throws IOException {
                // ۱. تنظیم هدرهای CORS به صورت یکتا با استفاده از متد set برای جلوگیری از تداخل
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "http://localhost:5173");
                exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
                exchange.getResponseHeaders().set(
                        "Access-Control-Allow-Methods",
                        "GET, POST, DELETE, OPTIONS"
                );
                exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");

                // ۲. مدیریت یکجای درخواست پیش‌پرواز (Preflight) مرورگر
                if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(204, -1); // ارسال پاسخ خالی و اتمام هَندل
                    return;
                }

                // ۳. مدیریت درخواست GET (ارسال لیست محصولات به فرانت)
                // ۳. مدیریت درخواست GET (ارسال لیست محصولات به فرانت با تشخیص هوشمند لپ‌تاپ واقعی)
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {

                    String path = exchange.getRequestURI().getPath();

                    // ==================== دیتیل یک محصول ====================
                    if (path.matches("/api/products/\\d+")) {

                        String idString = path.substring("/api/products/".length());
                        int itemId = Integer.parseInt(idString);

                        ProductItem item = null;

                        for (ProductItem p : allProductItems) {
                            if (p.getItemId() == itemId) {
                                item = p;
                                break;
                            }
                        }

                        if (item == null) {
                            exchange.sendResponseHeaders(404, -1);
                            return;
                        }

                        String productName = (item.product != null) ? item.product.getName() : "نامشخص";
                        String brandName = (item.product != null) ? item.product.getBrand() : "نامشخص";

                        boolean isRealLaptop = false;
                        boolean isRealMobile = false;

                        int ramVal = 0;
                        int storageVal = 0;

                        int cameraVal = 0;
                        int batteryVal = 0;
                        boolean is5GVal = false;

                        if (item.product instanceof Laptop) {

                            Laptop laptop = (Laptop) item.product;

                            ramVal = laptop.getRamSize();
                            storageVal = laptop.getStorage();

                            if (ramVal > 0 || storageVal > 0) {
                                isRealLaptop = true;
                            }

                        } else if (item.product instanceof Mobile) {

                            Mobile mobile = (Mobile) item.product;

                            cameraVal = mobile.getCameraMP();
                            batteryVal = mobile.getBatteryMah();
                            is5GVal = mobile.is5G();

                            isRealMobile = true;
                        }

                        StringBuilder json = new StringBuilder();

                        json.append("{");
                        json.append("\"itemId\":").append(item.getItemId()).append(",");
                        json.append("\"name\":\"").append(productName).append("\",");
                        json.append("\"brand\":\"").append(brandName).append("\",");
                        json.append("\"color\":\"").append(item.color).append("\",");
                        json.append("\"price\":").append(item.getFinalPrice()).append(",");
                        json.append("\"stock\":").append(item.getStock()).append(",");
                        json.append("\"sellerName\":\"").append(item.seller.username).append("\",");

                        json.append("\"productType\":\"");

                        if (isRealLaptop)
                            json.append("LAPTOP");
                        else if (isRealMobile)
                            json.append("MOBILE");
                        else
                            json.append("BASE");

                        json.append("\"");

                        if (isRealLaptop) {
                            json.append(",");
                            json.append("\"ram\":").append(ramVal).append(",");
                            json.append("\"storage\":").append(storageVal);
                        }

                        if (isRealMobile) {
                            json.append(",");
                            json.append("\"cameraMP\":").append(cameraVal).append(",");
                            json.append("\"batteryMah\":").append(batteryVal).append(",");
                            json.append("\"is5G\":").append(is5GVal);
                        }

                        json.append("}");

                        byte[] responseBytes = json.toString().getBytes("UTF-8");

                        exchange.sendResponseHeaders(200, responseBytes.length);

                        OutputStream os = exchange.getResponseBody();
                        os.write(responseBytes);
                        os.close();

                        return;
                    }

                    // ==================== لیست محصولات ====================

                    StringBuilder jsonBuilder = new StringBuilder();
                    jsonBuilder.append("[");

                    for (int i = 0; i < allProductItems.size(); i++) {

                        ProductItem item = allProductItems.get(i);

                        String productName = (item.product != null) ? item.product.getName() : "نامشخص";
                        String brandName = (item.product != null) ? item.product.getBrand() : "نامشخص";

                        boolean isRealMobile = false;
                        boolean isRealLaptop = false;

                        int ramVal = 0;
                        int storageVal = 0;

                        int cameraVal = 0;
                        int batteryVal = 0;
                        boolean is5GVal = false;

                        if (item.product instanceof Laptop) {

                            Laptop specLaptop = (Laptop) item.product;

                            ramVal = specLaptop.getRamSize();
                            storageVal = specLaptop.getStorage();

                            if (ramVal > 0 || storageVal > 0)
                                isRealLaptop = true;

                        } else if (item.product instanceof Mobile) {

                            Mobile specMobile = (Mobile) item.product;

                            cameraVal = specMobile.getCameraMP();
                            batteryVal = specMobile.getBatteryMah();
                            is5GVal = specMobile.is5G();

                            isRealMobile = true;
                        }

                        jsonBuilder.append("{");
                        jsonBuilder.append("\"itemId\":").append(item.getItemId()).append(",");
                        jsonBuilder.append("\"name\":\"").append(productName).append("\",");
                        jsonBuilder.append("\"brand\":\"").append(brandName).append("\",");
                        jsonBuilder.append("\"color\":\"").append(item.color).append("\",");
                        jsonBuilder.append("\"price\":").append(item.getFinalPrice()).append(",");
                        jsonBuilder.append("\"stock\":").append(item.getStock()).append(",");
                        jsonBuilder.append("\"sellerName\":\"").append(item.seller.username).append("\",");

                        jsonBuilder.append("\"productType\":\"");

                        if (isRealLaptop)
                            jsonBuilder.append("LAPTOP");
                        else if (isRealMobile)
                            jsonBuilder.append("MOBILE");
                        else
                            jsonBuilder.append("BASE");

                        jsonBuilder.append("\"");

                        if (isRealLaptop) {
                            jsonBuilder.append(",");
                            jsonBuilder.append("\"ram\":").append(ramVal).append(",");
                            jsonBuilder.append("\"storage\":").append(storageVal);
                        }

                        if (isRealMobile) {
                            jsonBuilder.append(",");
                            jsonBuilder.append("\"cameraMP\":").append(cameraVal).append(",");
                            jsonBuilder.append("\"batteryMah\":").append(batteryVal).append(",");
                            jsonBuilder.append("\"is5G\":").append(is5GVal);
                        }

                        jsonBuilder.append("}");

                        if (i < allProductItems.size() - 1) {
                            jsonBuilder.append(",");
                        }
                    }

                    jsonBuilder.append("]");

                    byte[] responseBytes = jsonBuilder.toString().getBytes("UTF-8");

                    exchange.sendResponseHeaders(200, responseBytes.length);

                    OutputStream os = exchange.getResponseBody();
                    os.write(responseBytes);
                    os.close();

                    return;
                }
// ۴. مدیریت درخواست POST (گرفتن محصول جدید از فروشنده فرانت)
                if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    try {
                        // ۱. خواندن بادی درخواست (JSON ارسالی از ریکت)
                        InputStream is = exchange.getRequestBody();
                        BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
                        StringBuilder bodyBuilder = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) {
                            bodyBuilder.append(line);
                        }
                        String jsonBody = bodyBuilder.toString();

                        // ۲. استخراج فیلدها از JSON به صورت دستی (اسم متغیر به jsonBody اصلاح شد)
                        int itemId = Integer.parseInt(extractJsonValue(jsonBody, "itemId"));
                        String name = extractJsonValue(jsonBody, "name");
                        String brand = extractJsonValue(jsonBody, "brand");
                        String color = extractJsonValue(jsonBody, "color");
                        double price = Double.parseDouble(extractJsonValue(jsonBody, "price"));
                        int stock = Integer.parseInt(extractJsonValue(jsonBody, "stock"));
                        String sellerName = extractJsonValue(jsonBody, "sellerName");

                        // ✨ اضافه شد: استخراج نوع محصول (BASE یا LAPTOP)
                        String productType = extractJsonValue(jsonBody, "productType");

                        // ۳. ذخیره سازی در فایل متنی
                        try (FileWriter fw = new FileWriter("products.txt", true);
                             BufferedWriter bw = new BufferedWriter(fw);
                             PrintWriter out = new PrintWriter(bw)) {

                            String productLine = String.format("%d,%s,%s,%s,%.2f,%d,%s",
                                    itemId, name, brand, color, price, stock, sellerName);
                            out.println(productLine);
                        }

                        // ۴. ساخت شیء محصول به صورت داینامیک بر اساس دیتای واقعی ریکت
                        Product newProductObj = null;

                        if ("LAPTOP".equalsIgnoreCase(productType)) {
                            // بیرون کشیدن رم، هارد و گرافیک واقعی از دیتای ارسالی فرانت
                            String ramStr = extractJsonValue(jsonBody, "ram");
                            String storageStr = extractJsonValue(jsonBody, "storage");
                            String graphicsStr = extractJsonValue(jsonBody, "graphics");

                            // تبدیل متن‌ها به عدد و بونین واقعی
                            int realRam = (ramStr != null) ? Integer.parseInt(ramStr.trim()) : 8;
                            int realStorage = (storageStr != null) ? Integer.parseInt(storageStr.trim()) : 256;
                            boolean realGraphics = "true".equalsIgnoreCase(graphicsStr);

                            // ساخت لپ‌تاپ با دیتای واقعی فرانت
                            newProductObj = new Laptop(itemId, name, brand, realRam, realStorage, realGraphics);
                        } else if ("MOBILE".equalsIgnoreCase(productType)) {
                            String batteryMah = extractJsonValue(jsonBody , "batteryMah");
                            String cameraMP = extractJsonValue(jsonBody , "cameraMP");
                            String is5G = extractJsonValue(jsonBody , "is5G");
                            int realBattery = (batteryMah != null) ? Integer.parseInt(batteryMah.trim()): 5;
                            int realCamera = (cameraMP != null) ? Integer.parseInt(cameraMP.trim()): 28;
                            boolean realis5G = "true".equalsIgnoreCase(is5G);
                            newProductObj = new Mobile(itemId, name, brand, realBattery, realCamera , realis5G);

                        } else {
                            // اگر محصول معمولی بود (می‌تونی کلاس محصول ساده رو بسازی، یا مثل قبل یک لپ‌تاپ با مقادیر صفر بدی)
                            newProductObj = new Laptop(itemId, name, brand, 0, 0, false);
                        }

                        // ساخت شیء فروشنده بر اساس سازنده کلاس Seller
                        int dummySellerId = 999;
                        String dummyPassword = "password123";
                        double dummyWallet = 0.0;
                        Seller currentSeller = new Seller(dummySellerId, sellerName, dummyPassword, dummyWallet);

                        // مقدار پیش‌فرض برای تخفیف محصول جدید
                        double defaultDiscount = 0.0;

                        // ساخت ProductItem با تمام پارامترهای سازنده شما
                        ProductItem newProductItem = new ProductItem(
                                itemId,
                                newProductObj,
                                currentSeller,
                                color,
                                price,
                                defaultDiscount,
                                stock
                        );

                        // الف) اضافه کردن محصول جدید به لیست اصلی انبار کل سایت
                        allProductItems.add(newProductItem);

                        // ب) اضافه کردن محصول به لیست اختصاصی خود این فروشنده
                        currentSeller.addProductItem(newProductItem);

                        // ۵. ارسال پاسخ موفقیت به فرانت‌اند
                        String successMessage = "{\"message\": \"محصول با موفقیت ذخیره و منتشر شد\"}";
                        byte[] responseBytes = successMessage.getBytes("UTF-8");
                        exchange.sendResponseHeaders(200, responseBytes.length);
                        OutputStream os = exchange.getResponseBody();
                        os.write(responseBytes);
                        os.close();

                    } catch (Exception e) {
                        e.printStackTrace();
                        String errorMessage = "{\"error\": \"خطا در پردازش اطلاعات محصول\"}";
                        byte[] responseBytes = errorMessage.getBytes("UTF-8");
                        exchange.sendResponseHeaders(400, responseBytes.length);
                        OutputStream os = exchange.getResponseBody();
                        os.write(responseBytes);
                        os.close();
                    }
                    return;
                }
                if ("DELETE".equalsIgnoreCase(exchange.getRequestMethod())) {

                    try {
                        String path = exchange.getRequestURI().getPath();

                        // گرفتن id از آدرس /api/products/5
                        if (path.matches("/api/products/\\d+")) {

                            String idString = path.substring("/api/products/".length());
                            int itemId = Integer.parseInt(idString);

                            ProductItem foundProduct = null;

                            for (ProductItem item : allProductItems) {
                                if (item.getItemId() == itemId) {
                                    foundProduct = item;
                                    break;
                                }
                            }

                            if (foundProduct != null) {

                                allProductItems.remove(foundProduct);

                                String response = "{\"message\":\"محصول با موفقیت حذف شد\"}";
                                byte[] bytes = response.getBytes("UTF-8");

                                exchange.sendResponseHeaders(200, bytes.length);

                                OutputStream os = exchange.getResponseBody();
                                os.write(bytes);
                                os.close();

                            } else {

                                String response = "{\"error\":\"محصول پیدا نشد\"}";
                                byte[] bytes = response.getBytes("UTF-8");

                                exchange.sendResponseHeaders(404, bytes.length);

                                OutputStream os = exchange.getResponseBody();
                                os.write(bytes);
                                os.close();
                            }

                        } else {

                            exchange.sendResponseHeaders(400, -1);

                        }

                    } catch (Exception e) {

                        e.printStackTrace();

                        String response = "{\"error\":\"خطا در حذف محصول\"}";
                        byte[] bytes = response.getBytes("UTF-8");

                        exchange.sendResponseHeaders(500, bytes.length);

                        OutputStream os = exchange.getResponseBody();
                        os.write(bytes);
                        os.close();
                    }

                    return;
                }
            }
        });
        server.createContext("/api/discount", new DiscountHandler(allDiscountCodes));
        server.createContext("/api/filter", new FilterHandler(allProductItems));

        server.createContext("/api/cart/remove", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

                if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                    exchange.sendResponseHeaders(200, -1);
                    return;
                }
                String responseText = "";
                if(exchange.getRequestMethod().equalsIgnoreCase("POST")){
                    InputStream is = exchange.getRequestBody();
                    String body = new String(is.readAllBytes(), "UTF-8");
                    int userId = -1;
                    int itemId = -1;
                    if(body.contains("\"userId\":")){
                        userId = Integer.parseInt(body.split("\"userId\":")[1].split(",")[0].trim());


                    };
                    if (body.contains("\"itemId\"")) {
                        itemId = Integer.parseInt(
                                body.split("\"itemId\":")[1]
                                        .split(",")[0]
                                        .split("}")[0]
                                        .trim()
                        );
                    };
                    Customer customer = null;
                    for(User u : allUsers){
                        if(u instanceof Customer && u.userId == userId){
                            customer = (Customer) u;
                            break;
                        }
                    }
                    if (customer == null) {

                        responseText = "{\"error\":\"کاربر پیدا نشد\"}";
                        exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);

                    } else {

                        customer.removeFromCart(itemId);

                        responseText = "{\"success\":true}";
                        exchange.sendResponseHeaders(200, responseText.getBytes("UTF-8").length);

                    }



                } else {

                    responseText = "{\"error\":\"Method not allowed\"}";
                    exchange.sendResponseHeaders(405, responseText.getBytes("UTF-8").length);

                }

                OutputStream os = exchange.getResponseBody();
                os.write(responseText.getBytes("UTF-8"));
                os.close();




            }
        });
        // ۴. کانتکست سیستم احراز هویت
        // مدیریت مسیر ثبت‌نام و ورود کاربران به نشانی /api/auth
        server.createContext("/api/auth", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                // هماهنگ‌سازی دسترسی درخواست‌ها برای متدهای رایج هویتی کلاینت
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");

                if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                    exchange.sendResponseHeaders(200, -1);
                    exchange.close();
                    return;
                }

                String responseText = "";

                // بررسی متد بدنه به صورت ساختار شرطی ارسالی فرانت برای مدیریت فرآیند ورود و ثبت‌نام
                if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                    InputStream is = exchange.getRequestBody();
                    String body = new String(is.readAllBytes(), "UTF-8");

                    // متغیرهای لازم برای ذخیره داده‌های اعتبارسنجی
                    String username = "";
                    String password = "";
                    String role = "CUSTOMER";
                    boolean isLogin = false; // پرچم تعیین‌کننده عملیات لاگین یا ثبت نام جدید

                    // استخراج اطلاعات هویتی به صورت گام به گام از متن بدنه درخواست جی‌سان
                    if (body.contains("\"username\"")) {
                        username = body.split("\"username\":\"")[1].split("\"")[0];
                    }
                    if (body.contains("\"password\"")) {
                        password = body.split("\"password\":\"")[1].split("\"")[0];
                    }
                    if (body.contains("\"role\"")) {
                        role = body.split("\"role\":\"")[1].split("\"")[0].toUpperCase();
                    }
                    if (body.contains("\"isLogin\":true")) {
                        isLogin = true;
                    }

                    // بررسی پر بودن کادرهای الزامی نام کاربری و پسورد
                    if (!username.isEmpty() && !password.isEmpty()) {
                        if (isLogin) {
                            // --- منطق ورود کاربر (Login) ---
                            User foundUser = null;
                            // گردش در بین اعضای لیست برای پیدا کردن مطابقت دقیق نام کاربری و رمز عبور
                            for (User u : allUsers) {
                                if (u.getUsername().equals(username) && u.getPassword().equals(password)) {
                                    foundUser = u;
                                    break;
                                }
                            }

                            if (foundUser != null) {
                                // ساخت پاسخ متنی جی‌سان از اطلاعات کاربر احراز هویت شده سیستم
                                responseText = "{"
                                        + "\"userId\":" + foundUser.userId + ","
                                        + "\"username\":\"" + foundUser.getUsername() + "\","
                                        + "\"role\":\"" + foundUser.getRole() + "\","
                                        + "\"wallet\":" + foundUser.getWallet()
                                        + "}";
                                exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
                                exchange.sendResponseHeaders(200, responseText.getBytes("UTF-8").length);
                            } else {
                                // خطا در صورت نامعتبر بودن مشخصات ورودی در فرم کامپوننت لاگین فرانت
                                responseText = "{\"error\":\"نام کاربری یا رمز عبور اشتباه است یا هنوز ثبت‌نام نکرده‌اید!\"}";
                                exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
                                exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                            }
                        } else {
                            // --- منطق ثبت‌نام کاربر جدید (Register) ---
                            boolean exists = false;
                            // چک کردن تکراری نبودن نام کاربری در سیستم
                            for (User u : allUsers) {
                                if (u.getUsername().equals(username)) {
                                    exists = true;
                                    break;
                                }
                            }

                            if (exists) {
                                responseText = "{\"error\":\"این نام کاربری از قبل وجود دارد!\"}";
                                exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
                                exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                            } else {
                                // محاسبه خودکار آی‌دی بعدی با اضافه کردن ۱ واحد به اندازه لیست فعلی
                                int newUserId = allUsers.size() + 1;
                                User newUser = null;
                                // بررسی نمونه‌سازی کلاس فرزند بر پایه چندریختی (Polymorphism) با توجه به نقش انتخابی
                                if (role.equals("CUSTOMER")) {
                                    newUser = new Customer(newUserId, username, password, 100000.0); // تخصیص موجودی اولیه کیف پول
                                } else if (role.equals("SELLER")) {
                                    newUser = new Seller(newUserId, username, password, 0.0);
                                }

                                if (newUser != null) {
                                    allUsers.add(newUser); // الحاق کاربر تازه به دیتابیس حافظه‌ای رم
                                    saveData(); // ثبت اطلاعات جدید در فایل متنی دیسک

                                    responseText = "{"
                                            + "\"userId\":" + newUserId + ","
                                            + "\"username\":\"" + username + "\","
                                            + "\"role\":\"" + role + "\","
                                            + "\"wallet\":" + newUser.getWallet()
                                            + "}";

                                    exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
                                    exchange.sendResponseHeaders(200, responseText.getBytes("UTF-8").length);
                                } else {
                                    responseText = "{\"error\":\"نقش کاربری نامعتبر است\"}";
                                    exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                                }
                            }
                        }
                    } else {
                        responseText = "{\"error\":\"اطلاعات ارسالی معتبر نیست\"}";
                        exchange.sendResponseHeaders(400, responseText.getBytes("UTF-8").length);
                    }
                } else {
                    responseText = "{\"error\":\"Method not allowed\"}";
                    exchange.sendResponseHeaders(405, responseText.getBytes("UTF-8").length);
                }

                OutputStream os = exchange.getResponseBody();
                os.write(responseText.getBytes("UTF-8"));
                os.close();
            }
        });
        server.createContext("/api/discount/apply", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {

                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

                if(exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")){
                    exchange.sendResponseHeaders(200,-1);
                    return;
                }

                String responseText = "";

                if(exchange.getRequestMethod().equalsIgnoreCase("POST")){

                    InputStream is = exchange.getRequestBody();
                    String body = new String(is.readAllBytes(),"UTF-8");
                    System.out.println(body);

                    int userId = -1;
                    String discountCode = "";

                    if(body.contains("\"userId\"")){
                        userId = Integer.parseInt(
                                body.split("\"userId\":")[1]
                                        .split(",")[0]
                                        .split("}")[0]
                                        .trim()
                        );
                    }

                    if(body.contains("\"discountCode\"")){
                        discountCode =
                                body.split("\"discountCode\":\"")[1]
                                        .split("\"")[0];
                    }

                    Customer customer = null;

                    for(User u : allUsers){
                        if(u instanceof Customer && u.userId == userId){
                            customer = (Customer)u;
                            break;
                        }
                    }

                    if(customer == null){

                        responseText =
                                "{\"error\":\"کاربر پیدا نشد\"}";

                        exchange.sendResponseHeaders(
                                400,
                                responseText.getBytes("UTF-8").length
                        );

                    }else{

                        double oldPrice = customer.getCartTotal();
                        double newPrice = oldPrice;

                        DiscountCode discount =
                                findDiscountCode(discountCode);
                        System.out.println("کد وارد شده: " + discountCode);
                        System.out.println("نتیجه findDiscountCode: " + discount);

                        System.out.println("customer = " + customer);
                        System.out.println("oldPrice = " + oldPrice);
                        System.out.println("discount = " + discount);

                        if(discount != null){
                            System.out.println("minimumPrice = " + discount.getMinimumPrice());
                            System.out.println("active = " + discount.isActive());
                        }

                        if(discount != null && discount.isActive()){

                            if(oldPrice >= discount.getMinimumPrice()){

                                if(discount.getDiscountType().equalsIgnoreCase("PERCENT")){

                                    newPrice =
                                            oldPrice -
                                                    (oldPrice * discount.getValue()/100);

                                }else{

                                    newPrice =
                                            oldPrice - discount.getValue();

                                    if(newPrice < 0){
                                        newPrice = 0;
                                    }
                                }

                                responseText =
                                        "{"
                                                + "\"success\":true,"
                                                + "\"oldPrice\":"+oldPrice+","
                                                + "\"newPrice\":"+newPrice+","
                                                + "\"message\":\"کد تخفیف اعمال شد.\""
                                                + "}";

                                exchange.sendResponseHeaders(
                                        200,
                                        responseText.getBytes("UTF-8").length
                                );

                            }else{

                                responseText =
                                        "{\"error\":\"حداقل مبلغ خرید رعایت نشده است.\"}";

                                exchange.sendResponseHeaders(
                                        400,
                                        responseText.getBytes("UTF-8").length
                                );

                            }

                        }else{

                            responseText =
                                    "{\"error\":\"کد تخفیف نامعتبر است.\"}";

                            exchange.sendResponseHeaders(
                                    400,
                                    responseText.getBytes("UTF-8").length
                            );

                        }

                    }

                }else{

                    responseText =
                            "{\"error\":\"Method not allowed\"}";

                    exchange.sendResponseHeaders(
                            405,
                            responseText.getBytes("UTF-8").length
                    );

                }

                OutputStream os = exchange.getResponseBody();
                os.write(responseText.getBytes("UTF-8"));
                os.close();

            }
        });

        server.createContext("/api/discounts", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException{
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
                if(exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")){
                    exchange.sendResponseHeaders(200, -1);
                    return;
                }
                String responseText = "";
                if(exchange.getRequestMethod().equalsIgnoreCase("GET")){
                    String query = exchange.getRequestURI().getQuery();
                    int userId = -1;
                    if(query != null && query.contains("userId=")){
                        userId = Integer.parseInt(query.split("userId=")[1].split("&")[0]);

                    }
                    Customer customer = null;

                    for (User u : allUsers) {
                        if (u instanceof Customer && u.userId == userId) {
                            customer = (Customer) u;
                            break;
                        }
                    }

                    if (customer != null) {

                        StringBuilder json = new StringBuilder();

                        json.append("[");

                        ArrayList<String> codes = customer.getDiscountCodes();

                        for (int i = 0; i < codes.size(); i++) {

                            json.append("\"").append(codes.get(i)).append("\"");

                            if (i < codes.size() - 1) {
                                json.append(",");
                            }
                        }

                        json.append("]");

                        responseText = json.toString();

                        exchange.sendResponseHeaders(
                                200,
                                responseText.getBytes("UTF-8").length
                        );

                    } else {

                        responseText = "{\"error\":\"کاربر پیدا نشد\"}";

                        exchange.sendResponseHeaders(
                                400,
                                responseText.getBytes("UTF-8").length
                        );
                    }

                } else {

                    responseText = "{\"error\":\"Method not allowed\"}";

                    exchange.sendResponseHeaders(
                            405,
                            responseText.getBytes("UTF-8").length
                    );
                }

                OutputStream os = exchange.getResponseBody();
                os.write(responseText.getBytes("UTF-8"));
                os.close();                }


        });

        // تنظیم مدیریت نخ‌ها (Threads) روی مقدار نال به منظور استفاده از رفتارهای پیش‌فرض سرور هسته جاوا
        server.setExecutor(null);
        // روشن کردن نهایی و استارت لوپ اجرایی سرور بر روی پورت اختصاص یافته
        server.start();
        System.out.println("🚀 بک‌اِند جاوا متصل به فایل‌های متنی روی پورت 8080 بدون ارور روشن شد!");
    }


    // متد ذخیره کردن داده‌های ساختار برنامه بر روی هاردهای محلی سیستم در قالب فرمت فایل‌های متنی مستقل (.txt)
    public static void saveData() {
        try {
            // ۱. نویسنده و ایجاد فایل کاربران
            PrintWriter writer = new PrintWriter(new FileWriter("users.txt"));
            for (User u : allUsers) {
                // ذخیره اطلاعات فیلدهای کاربر با جداکننده کاما (CSV Style) برای پارس ساده مجدد در متد لودر
                writer.println(u.getRole() + "," + u.userId + "," + u.getUsername() + "," + u.getPassword() + "," + u.getWallet());
            }
            writer.close();

            // ۲. نویسنده و ایجاد فایل لیست محصولات پایه
            PrintWriter writerProducts = new PrintWriter(new FileWriter("products.txt")); // تغییر نام داخلی متغیر به دلیل رعایت دقیق کدهای کاربر بدون خطا
            for (Product p : allBaseProducts) {
                writerProducts.println(p.getId() + "," + p.getName() + "," + p.getBrand());
            }
            writerProducts.close();


            // ۳. نویسنده و ایجاد فایل جزئیات و موجودی انبار کالاها
            PrintWriter writerItems = new PrintWriter(new FileWriter("product_items.txt")); // تغییر نام داخلی متغیر به دلیل رعایت دقیق کدهای کاربر بدون خطا
            for (ProductItem pi : allProductItems) {
                writerItems.println(pi.getItemId() + "," + (pi.getSeller() != null ? pi.getSeller().getUsername() : "null") + "," + pi.getStock());
            }
            writerItems.close();
            // ۴. ذخیره کدهای تخفیف
            PrintWriter writerDiscount =
                    new PrintWriter(new FileWriter("discount_codes.txt"));

            for (DiscountCode dc : allDiscountCodes) {

                writerDiscount.println(
                        dc.getCode() + "," +
                                dc.getDiscountType() + "," +
                                dc.getValue() + "," +
                                dc.getMinimumPrice() + "," +
                                dc.isActive()
                );
            }

            writerDiscount.close();
            System.out.println("💾 تمام اطلاعات با موفقیت در فایل‌های متنی سیستم ذخیره شدند.");
        } catch (IOException e) {
            System.out.println("❌ خطا در هنگام ذخیره‌سازی اطلاعات در فایل‌ها: " + e.getMessage());
        }
    }

    // متد بارگذاری اطلاعات و نمونه‌سازی از روی دیتابیس فایل‌های متنی برنامه در زمان گام راه‌اندازی متد main
    public static void loadData() {
        try {
            // ساختن نمونه‌ها و بررسی فیزیکی وجود کادر فایل‌ها روی هارد دیسک و ایجاد فایل تهی در صورت عدم حضور آن‌ها
            File f1 = new File("users.txt"); if (!f1.exists()) f1.createNewFile();
            File f2 = new File("products.txt"); if (!f2.exists()) f2.createNewFile();
            File f3 = new File("product_items.txt"); if (!f3.exists()) f3.createNewFile();
            File f4 = new File("reviews.txt"); if (!f4.exists()) f4.createNewFile();
            File f5 = new File("purchases.txt"); if (!f5.exists()) f5.createNewFile();
            File f6 = new File("new_questions.txt"); if (!f6.exists()) f6.createNewFile();
            File f7 = new File("discount_codes.txt"); if (!f7.exists()) f7.createNewFile();
            // خواندن کدهای تخفیف از فایل
            BufferedReader discountReader =
                    new BufferedReader(new FileReader("discount_codes.txt"));

            String line;

            while ((line = discountReader.readLine()) != null) {

                String[] parts = line.split(",");

                if (parts.length == 5) {

                    String code = parts[0];
                    String discountType = parts[1];
                    double value = Double.parseDouble(parts[2]);
                    double minimumPrice = Double.parseDouble(parts[3]);
                    boolean active = Boolean.parseBoolean(parts[4]);

                    DiscountCode discount = new DiscountCode(
                            code,
                            discountType,
                            value,
                            minimumPrice,
                            active
                    );

                    allDiscountCodes.add(discount);
                }
            }

            discountReader.close();

            // پر کردن موقت اطلاعات دمی و فیک برای تست در صورتی که دیتابیس متنی در ابتدا کاملاً خالی باشد
            if (allUsers.isEmpty()) {
                // تزریق کاربر نمونه هلیای تستی با ۵۰ میلیون واحد پول پیش‌فرض به عنوان اطلاعات آغازین داخل مپ کاربران
                allUsers.add(new Customer(1, "helia", "password123", 50000000.0));
            }

            if (allBaseProducts.isEmpty()) {
                // مقداردهی و شبیه‌سازی محصولات پایه تبلت و ساعت هوشمند برندهای اپل و سامسونگ
                allBaseProducts.add(new Tablet(50, "iPad Pro", "Apple", true, 12.9));
                allBaseProducts.add(new Smartwatch(60, "Apple Watch 9", "Apple", true, true, 2, 1.9));
                allBaseProducts.add(new Tablet(51, "Galaxy Tab S9", "Samsung", false, 11.0));
                allBaseProducts.add(new Smartwatch(62, "Galaxy Watch 6", "Samsung", false, true, 3, 1.4));
            }

            if (allProductItems.isEmpty()) {
                // نمونه‌سازی فروشنده فرضی سیستم جهت برقراری وابستگی‌ها (Dependencies) در سازنده‌های اشیاء انبار
                Seller dummySeller = new Seller(99, "TechShop", "1234", 0.0);

                allProductItems.add(new ProductItem(
                        0,
                        allBaseProducts.get(3),
                        dummySeller,
                        "نقره‌ای",
                        12000000.0,
                        0,
                        8
                ));

                // یک نمونه کالا پیش‌فرض به سبد خرید کاربر هلیای تستی اضافه می‌کنیم تا فرانت در زمان اولین رندر لودینگ کامپوننت‌ها خالی نباشد
                if (allUsers.get(0) instanceof Customer) {
                    ((Customer)allUsers.get(0)).addToCart(allProductItems.get(0), 1);
                }
            }
            System.out.println("🟢 اطلاعات اولیه با موفقیت لود شدند.");
        } catch (IOException e) {
            System.out.println("❌ خطا در آماده‌سازی یا بارگذاری اولیه فایل‌ها: " + e.getMessage());
        }
    }
    public static DiscountCode findDiscountCode(String code){

        for(DiscountCode dc : allDiscountCodes){

            if(dc.getCode().equalsIgnoreCase(code)){
                return dc;
            }

        }

        return null;
    }
    // یک متد ساده برای بیرون کشیدن مقدار فیلدها از متن JSON
    private static String extractJsonValue(String json, String key) {
        String pattern = "\"" + key + "\":";
        int startIdx = json.indexOf(pattern);
        if (startIdx == -1) return "";

        startIdx += pattern.length();

        // اگر مقدار رشته بود (با " شروع می‌شد)
        if (json.charAt(startIdx) == '"') {
            startIdx++; // رد کردن کتیشن اول
            int endIdx = json.indexOf('"', startIdx);
            return json.substring(startIdx, endIdx);
        } else {
            // اگر مقدار عددی یا بولین بود
            int endIdxComma = json.indexOf(',', startIdx);
            int endIdxBracket = json.indexOf('}', startIdx);
            int endIdx = (endIdxComma != -1 && endIdxComma < endIdxBracket) ? endIdxComma : endIdxBracket;
            if (endIdx == -1) endIdx = json.length();
            return json.substring(startIdx, endIdx).trim();
        }
    }}