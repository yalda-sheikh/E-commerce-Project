import java.io.*;
import java.util.*;

public class Main {
    public static ArrayList<User> allUsers = new ArrayList<>();
    public static ArrayList<Product> allBaseProducts = new ArrayList<>();
    public static ArrayList<ProductItem> allProductItems = new ArrayList<>();


    public static Admin adminSystem = new Admin(1);


    public static User currentUser = null;

    public static void main(String[] args) {
        // فایل‌های متنی سیستم را بررسی یا لود می‌کند.
        loadData();

        if (findUserByUsername("admin") == null) {
            allUsers.add(adminSystem);
        } else {
            adminSystem = (Admin) findUserByUsername("admin");
        }

        Scanner scanner = new Scanner(System.in);
        boolean running = true;


        while (running) {
            if (currentUser == null) {
                System.out.println("\n--- سامانه فروش کالای دیجیتال ---");
                System.out.println("1. ثبت‌نام (مشتری / فروشنده)");
                System.out.println("2. ورود");
                System.out.println("3. پرسش از ادمین (بدون نیاز به ورود)");
                System.out.println("4. نمایش همه محصولات");
                System.out.println("5. خروج");
                System.out.print("انتخاب کنید: ");

                int choice = scanner.nextInt();
                scanner.nextLine();

                switch (choice) {
                    case 1: registerMenu(scanner); break;
                    case 2: loginMenu(scanner); break;
                    case 3: askAdminMenu(scanner); break;
                    case 4: viewAllProductItems(); break;
                    case 5:
                        running = false;
                        saveData();
                        System.out.println("اطلاعات ذخیره شد. خروج از برنامه.");
                        break;
                    default: System.out.println("گزینه نامعتبر است!");
                }
            } else {
                if (currentUser.getRole() == Role.CUSTOMER) {
                    customerMenu(scanner);
                } else if (currentUser.getRole() == Role.SELLER) {
                    sellerMenu(scanner);
                } else if (currentUser.getRole() == Role.ADMIN) {
                    adminMenu(scanner);
                }
            }
        }
        scanner.close();
    }
    // ================= منوهای ثبت‌نام و ورود کاربران =================

    private static void registerMenu(Scanner scanner) {
        System.out.print("نام کاربری جدید: ");
        String user = scanner.nextLine();
        if (findUserByUsername(user) != null) {
            System.out.println("❌ این نام کاربری از قبل در سیستم وجود دارد!");
            return;
        }
        System.out.print("رمز عبور: ");
        String pass = scanner.nextLine();
        System.out.print("نقش را انتخاب کنید (1. مشتری | 2. فروشنده): ");
        int r = scanner.nextInt();
        System.out.print("موجودی اولیه کیف پول (تومان): ");
        double wallet = scanner.nextDouble();

        int id = allUsers.size() + 1;
        if (r == 1) {
            allUsers.add(new Customer(id, user, pass, wallet));
            System.out.println("🎉 ثبت‌نام مشتری با موفقیت انجام شد.");
        } else if (r == 2) {
            allUsers.add(new Seller(id, user, pass, wallet));
            System.out.println("🎉 ثبت‌نام فروشنده با موفقیت انجام شد.");
        } else {
            System.out.println("❌ نقش انتخاب شده نامعتبر است!");
        }
    }

    private static void loginMenu(Scanner scanner) {
        System.out.print("نام کاربری: ");
        String user = scanner.nextLine();
        System.out.print("رمز عبور: ");
        String pass = scanner.nextLine();

        User found = findUserByUsername(user);
        if (found != null && found.getPassword().equals(pass)) {
            currentUser = found;
            System.out.println("✅ ورود موفقیت‌آمیز بود! خوش آمدید " + user);
        } else {
            System.out.println("❌ نام کاربری یا رمز عبور اشتباه است.");
        }
    }

    private static void askAdminMenu(Scanner scanner) {
        System.out.print("سوال خود را از ادمین بپرسید: ");
        String q = scanner.nextLine();
        adminSystem.answerQuestion(q);
    }

    private static void viewAllProductItems() {
        System.out.println("\n=== لیست تمام آیتم‌های قابل فروش در سامانه ===");
        if (allProductItems.isEmpty()) {
            System.out.println("هیچ کالایی در سیستم موجود نیست.");
            return;
        }
        for (ProductItem item : allProductItems) {
            item.displayItemInfo();
        }
    }
    // --- منوی مشتری پس از ورود ---
    private static void customerMenu(Scanner scanner) {
        Customer c = (Customer) currentUser;
        System.out.println("\n--- منوی مشتری (" + c.getUsername() + ") ---");
        System.out.println("1. مشاهده محصولات");
        System.out.println("2. افزودن به سبد خرید");
        System.out.println("3. مشاهده سبد خرید");
        System.out.println("4. خرید و تسویه حساب");
        System.out.println("5. مشاهده تاریخچه خرید");
        System.out.println("6. افزایش مبلغ کیف پول");
        System.out.println("7. ثبت نظر برای کالا");
        System.out.println("8. استعلام و پرداخت قسطی کالا 💳");
        System.out.println("9. خروج از حساب کاربری");
        System.out.print("انتخاب کنید: ");

        int choice = scanner.nextInt();
        switch (choice) {
            case 1: viewAllProductItems(); break;
            case 2:
                System.out.print("شناسه آیتم (Item ID): ");
                int itemId = scanner.nextInt();
                System.out.print("تعداد درخواست: ");
                int qty = scanner.nextInt();
                ProductItem item = findProductItemById(itemId);
                c.addToCart(item, qty);
                break;
            case 3: c.viewCart(); break;
            case 4:
                scanner.nextLine();

                System.out.println("\n--- 🛒 انتخاب روش پرداخت ---");
                System.out.println("1. خرید نقدی و تسویه حساب");
                System.out.println("2. خرید اقساطی (۳ قسطه)");
                System.out.print("انتخاب کنید: ");
                int paymentMethod = scanner.nextInt();
                scanner.nextLine();

                if (paymentMethod == 1) {
                    System.out.print("کد تخفیف داری؟ (اگر نداری اینتر بزن): ");
                    String code = scanner.nextLine();
                    c.checkout(code);
                }
                else if (paymentMethod == 2) {
                    // --- بخش خرید اقساطی جدید ---
                    // بررسی اینکه آیا سبد خرید کاربر خالی است یا خیر
                    System.out.println("⚠️ تمام کالاهای موجود در سبد خرید شما به لیست خرید اقساطی اضافه خواهند شد.");
                    System.out.print("آیا از خرید اقساطی اطمینان دارید؟ (yes/no): ");
                    String confirm = scanner.nextLine();

                    if (confirm.equalsIgnoreCase("yes")) {

                        System.out.print("نام کالایی که می‌خواهید قسطی کنید را وارد کنید (مانند Laptop یا Mobile): ");
                        String prodName = scanner.nextLine();

                        // دسترسی به هشمپ کلاس قسطی و فعال کردن آن
                        if (products_data.products.containsKey(prodName)) {
                            products_data.hasBought.put(prodName, true);
                            products_data.paymentCount.put(prodName, 1); // قسط اول هنگام خرید پرداخت می‌شود

                            System.out.println("🎉 خرید اقساطی کالا با موفقیت ثبت شد!");
                            System.out.println("💳 قسط اول پرداخت شد. برای پرداخت اقساط بعدی از گزینه 8 منو استفاده کنید.");

                            //    متد خالی کردن سبد  c.clearCart();
                        } else {
                            System.out.println("❌ این کالا در لیست کالاهای واجد شرایط اقساط قرار ندارد.");
                        }
                    } else {
                        System.out.println("❌ خرید اقساطی لغو شد.");
                    }
                } else {
                    System.out.println("❌ گزینه نامعتبر است.");
                }
                break;
            case 5: c.viewPurchaseHistory(); break;
            case 6:
                System.out.print("مبلغ افزایش (تومان): ");
                double amount = scanner.nextDouble();
                c.updateWallet(amount);
                System.out.println("💰 کیف پول به‌روز شد. موجودی جدید: " + c.getWallet() + " تومان");
                break;
            case 7:
                System.out.print("شناسه محصول پایه (Product ID): ");
                int pId = scanner.nextInt();
                System.out.print("امتیاز (۱ تا ۵): ");
                int rate = scanner.nextInt();
                scanner.nextLine();
                System.out.print("متن نظر شما: ");
                String comment = scanner.nextLine();
                Product p = findBaseProductById(pId);
                if (c.canReview(p)) {
                    c.addReviewToProduct(p, rate, comment);
                } else {
                    System.out.println("❌ خطا: شما هنوز این کالا را خریداری نکرده‌اید و اجازه ثبت نظر ندارید!");
                }
                break;

            case 8:
                Installmentproduct installmentSystem = new Installmentproduct();
                installmentSystem.inquiry(); // اجرای متد استعلام و پرداخت اقساط
                break;

            case 9:
                currentUser = null;
                System.out.println("از حساب کاربری خارج شدید.");
                break;

            default:
                System.out.println("گزینه نامعتبر است!");
        }
    }

    // --- منوی فروشنده پس از ورود ---
    private static void sellerMenu(Scanner scanner) {
        Seller s = (Seller) currentUser;
        System.out.println("\n--- منوی فروشنده (" + s.getUsername() + ") ---");
        System.out.println("1. افزودن محصول جدید برای فروش");
        System.out.println("2. حذف محصول از فروشگاه");
        System.out.println("3. اعمال تخفیف روی محصولات خود");
        System.out.println("4. مشاهده محصولات من");
        System.out.println("5. مشاهده موجودی کیف پول");
        System.out.println("6. خروج از حساب کاربری");
        System.out.print("انتخاب کنید: ");

        int choice = scanner.nextInt();
        switch (choice) {
            case 1:
                System.out.print("شناسه آیتم یکتا (Item ID): ");
                int itemId = scanner.nextInt();
                System.out.print("شناسه محصول پایه سیستم (Product ID): ");
                int pId = scanner.nextInt();
                scanner.nextLine();
                System.out.print("رنگ کالا: ");
                String color = scanner.nextLine();
                System.out.print("قیمت پایه (تومان): ");
                double price = scanner.nextDouble();
                System.out.print("تعداد موجودی انبار: ");
                int stock = scanner.nextInt();

                Product baseProd = findBaseProductById(pId);
                if (baseProd != null) {
                    ProductItem newItem = new ProductItem(itemId, baseProd, s, color, price, 0.0, stock);
                    allProductItems.add(newItem);
                    s.addProductItem(newItem);
                } else {
                    System.out.println("❌ محصول پایه‌ای با این شناسه یافت نشد! ابتدا ادمین باید محصول پایه را تعریف کند.");
                }
                break;
            case 2:
                System.out.print("شناسه آیتم جهت حذف: ");
                int remId = scanner.nextInt();
                s.removeProductItem(remId);
                allProductItems.remove(findProductItemById(remId));
                break;
            case 3:
                System.out.print("شناسه آیتم کالا: ");
                int discId = scanner.nextInt();
                System.out.print("درصد تخفیف مورد نظر: ");
                double pcent = scanner.nextDouble();
                s.applyDiscount(discId, pcent);
                break;
            case 4: s.viewMyProducts(); break;
            case 5: System.out.println("💵 موجودی کیف پول شما: " + s.getWallet() + " تومان"); break;
            case 6: currentUser = null; System.out.println("از حساب کاربری خارج شدید."); break;
        }
    }

    // --- منوی ادمین پس از ورود ---
    private static void adminMenu(Scanner scanner) {
        System.out.println("\n--- منوی ادمین (admin) ---");
        System.out.println("1. مشاهده سوالات کاربران");
        System.out.println("2. مشاهده کیف پول کارمزد سیستم");
        System.out.println("3. خروج از حساب کاربری");
        System.out.print("انتخاب کنید: ");
        int choice = scanner.nextInt();
        if (choice == 1) {
            adminSystem.viewAllQuestions();
        } else if (choice == 2) {
            System.out.println("📈 کل کارمزد ۱۰٪ ذخیره شده در سیستم (ولت ادمین): " + adminSystem.getWallet() + " تومان");
        } else {
            currentUser = null;
            System.out.println("از حساب ادمین خارج شدید.");
        }
    }

    // ================= متدهای کمکی برای جستجو در لیست‌های سراسری =================

    public static User findUserByUsername(String name) {
        for (User u : allUsers) {
            if (u.getUsername().equalsIgnoreCase(name)) return u;
        }
        return null;
    }

    public static Product findBaseProductById(int id) {
        for (Product p : allBaseProducts) {
            if (p.getId() == id) return p;
        }
        return null;
    }

    public static ProductItem findProductItemById(int id) {
        for (ProductItem pi : allProductItems) {
            if (pi.getItemId() == id) return pi;
        }
        return null;
    }
    // ================= بخش ذخیره‌سازی و بارگذاری اطلاعات در فایل‌ها =================

    // متد ذخیره اطلاعات در فایل متنی هنگام خروج از برنامه
    public static void saveData() {
        try {
            // ۱. ذخیره اطلاعات کاربران در فایل users.txt
            PrintWriter writer = new PrintWriter(new FileWriter("users.txt"));
            for (User u : allUsers) {
                writer.println(u.getRole() + "," + u.userId + "," + u.getUsername() + "," + u.getPassword() + "," + u.getWallet());
            }
            writer.close();

            // ۲. ذخیره اطلاعات محصولات پایه در فایل products.txt
            writer = new PrintWriter(new FileWriter("products.txt"));
            for (Product p : allBaseProducts) {
                writer.println(p.getId() + "," + p.getName() + "," + p.getBrand());
            }
            writer.close();

            // ۳. ذخیره اطلاعات آیتم‌های قابل فروش در فایل product_items.txt
            writer = new PrintWriter(new FileWriter("product_items.txt"));
            for (ProductItem pi : allProductItems) {
                writer.println(pi.getItemId() + "," + (pi.getSeller() != null ? pi.getSeller().getUsername() : "null") + "," + pi.getStock());
            }
            writer.close();

            System.out.println("💾 تمام اطلاعات با موفقیت در فایل‌های متنی سیستم ذخیره شدند.");
        } catch (IOException e) {
            System.out.println("❌ خطا در هنگام ذخیره‌سازی اطلاعات در فایل‌ها: " + e.getMessage());
        }
    }

    // متد بارگذاری و ساخت فایل‌ها در ابتدای شروع برنامه
    public static void loadData() {
        try {
            // ایجاد فایل‌های مورد نیاز سیستم در صورتی که از قبل وجود نداشته باشند
            File f1 = new File("users.txt"); if (!f1.exists()) f1.createNewFile();
            File f2 = new File("products.txt"); if (!f2.exists()) f2.createNewFile();
            File f3 = new File("product_items.txt"); if (!f3.exists()) f3.createNewFile();
            File f4 = new File("reviews.txt"); if (!f4.exists()) f4.createNewFile();
            File f5 = new File("purchases.txt"); if (!f5.exists()) f5.createNewFile();
            File f6 = new File("new_questions.txt"); if (!f6.exists()) f6.createNewFile();
            File f7 = new File("discount_codes.txt"); if (!f7.exists()) f7.createNewFile();

            // بررسی اینکه اگر لیست محصولات پایه خالی است، چند نمونه اولیه به عنوان تست بسازد
            if (allBaseProducts.isEmpty()) {
                allBaseProducts.add(new Tablet(50, "iPad Pro", "Apple", true, 12.9));
                allBaseProducts.add(new Smartwatch(60, "Apple Watch 9", "Apple", true, true, 2, 1.9));
            }

        } catch (IOException e) {
            System.out.println("❌ خطا در آماده‌سازی یا بارگذاری اولیه فایل‌ها: " + e.getMessage());
        }
    }
}