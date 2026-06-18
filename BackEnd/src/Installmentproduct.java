import java.util.HashMap;
import java.util.Scanner;

class products_data {
    static HashMap<String, Integer> products = new HashMap<String, Integer>() {{
        put("Laptop", 1500);
        put("Mobile", 1000);
        put("SmartWatch", 200);
        put("Tablet", 500);
        put("Headphone", 600);
        put("Headset", 800);
        put("Earbud", 400);
    }};

    static HashMap<String, Integer> paymentCount = new HashMap<String, Integer>() {{
        put("Laptop", 0);
        put("Mobile", 0);
        put("SmartWatch", 0);
        put("Tablet", 0);
        put("Headphone", 0);
        put("Headset", 0);
        put("Earbud", 0);
    }};

    // وضعیت خرید اقساطی هر کالا (در ابتدا همه false هستند)
    static HashMap<String, Boolean> hasBought = new HashMap<String, Boolean>() {{
        put("Laptop", false);
        put("Mobile", false);
        put("SmartWatch", false);
        put("Tablet", false);
        put("Headphone", false);
        put("Headset", false);
        put("Earbud", false);
    }};
}

public class Installmentproduct {

    int currentDay;
    double installmentAmount;
    String name;
    double price;
    int paidInstallments;

    Scanner input = new Scanner(System.in);

    public void inquiry() {
        System.out.println("\n========================================");
        System.out.println("   📊 وضعیت اقساط و کالاهای خریداری شده   ");
        System.out.println("========================================");

        boolean hasAnyRegisteredPurchase = false;

        // بررسی اینکه آیا کاربر اصلاً کالایی را به صورت قسطی خریده یا نه
        for (String productName : products_data.products.keySet()) {
            if (products_data.hasBought.get(productName)) {
                int paid = products_data.paymentCount.get(productName);
                int remaining = 3 - paid;

                if (remaining > 0) {
                    System.out.println("📦 کالا: " + productName + " | 🟢 اقساط پرداخت شده: " + paid + " | 🔴 اقساط باقی‌مانده: " + remaining);
                } else {
                    System.out.println("📦 کالا: " + productName + " | 🎉 وضعیت: تسویه حساب کامل");
                }
                hasAnyRegisteredPurchase = true;
            }
        }

        // اگر هیچ کالایی قسطی خریداری نشده باشد
        if (!hasAnyRegisteredPurchase) {
            System.out.println("❌ شما هیچ خرید اقساطی انجام نداده‌اید!");
            System.out.println("========================================");
            return;
        }

        System.out.println("========================================");

        System.out.print("\nنام کالایی که می‌خواهید قسط آن را پرداخت کنید وارد کنید: ");
        String selectedName = input.nextLine();

        // بررسی معتبر بودن کالا و اینکه آیا قبلا خریده شده یا نه
        if (!products_data.products.containsKey(selectedName) || !products_data.hasBought.get(selectedName)) {
            System.out.println("❌ شما این کالا را به صورت اقساطی خریداری نکرده‌اید!");
            return;
        }

        this.name = selectedName;
        this.price = products_data.products.get(name);
        this.installmentAmount = this.price / 3;
        this.paidInstallments = products_data.paymentCount.get(name);

        if (this.paidInstallments == 3) {
            System.out.println("🎉 اقساط این کالا قبلاً کاملاً پرداخت شده است.");
            return;
        }

        System.out.println("\n💳 مبلغ قسط این دوره: " + this.installmentAmount + " دلار");
        System.out.print("روز فعلی را وارد کنید: ");
        currentDay = input.nextInt();
        input.nextLine(); // خالی کردن بافر

        double due = Math.floor(currentDay / 30);

        if (due <= paidInstallments && paidInstallments < 3) {
            products_data.paymentCount.put(name, products_data.paymentCount.get(name) + 1);
            int updatedRemaining = 3 - products_data.paymentCount.get(name);

            System.out.println("✅ پرداخت قسط با موفقیت انجام شد.");
            System.out.println("📉 تعداد اقساط باقی‌مانده برای این کالا: " + updatedRemaining);
        } else {
            System.out.println("از زمان پرداخت قسط گذشته است.");
        }
        }}