import java.util.ArrayList;
import java.util.HashMap;
import java.util.Random;

public class Customer extends User {
    private HashMap<ProductItem, Integer> cart;
    private ArrayList<Purchase> purchaseHistory;
    private ArrayList<String> discountCodes;

    public Customer(int userId, String username, String password, double wallet) {
        super(userId, username, password, Role.CUSTOMER, wallet);
        this.cart = new HashMap<>();
        this.purchaseHistory = new ArrayList<>();
        this.discountCodes = new ArrayList<>();
    }
    public ArrayList<Purchase> getPurchaseHistory(){
        return purchaseHistory;
    }
    public ArrayList<String> getDiscountCodes() {
        return discountCodes;
    }

    public void addToCart(ProductItem item, int quantity) {
        if (item == null || quantity <= 0) return;

        if (item.getStock() >= quantity) {
            // متد برای تعیین اینکه از قبل محصول وجود داشته است یا خیر getOrDefault
            // پیشفرض 0
            int currentQty = cart.getOrDefault(item, 0);
            // بروز رسانی یا اضافه کردن به تعداد محصول درون سبد خرید
            cart.put(item, currentQty + quantity);
            System.out.println(quantity + " عدد کالا به سبد خرید اضافه شد.");
        } else {
            System.out.println("❌ خطا: موجودی کافی نیست! موجودی فعلی: " + item.getStock());
        }
    }
    public java.util.HashMap<ProductItem, Integer> getCart() {
        return this.cart;
    }


    public void removeFromCart(int itemId) {
        ProductItem toRemove = null;
        //جاوا لیستی از تمام کلیدها (که همان اشیاء ProductItem هستند) را در اختیار حلقه می‌گذارد.
        for (ProductItem item : cart.keySet()) {
            if (item.getItemId() == itemId) {
                toRemove = item;
                break;
            }
        }
        if (toRemove != null) {
            cart.remove(toRemove);
            System.out.println("کالا با موفقیت از سبد خرید حذف شد.");
        } else {
            System.out.println("این کالا در سبد خرید شما یافت نشد.");
        }
    }

    public void viewCart() {
        System.out.println("🛒 === سبد خرید شما ===");
        if (cart.isEmpty()) {
            System.out.println("سبد خرید شما خالی است.");
            return;
        }
        //جاوا لیستی از تمام کلیدها (که همان اشیاء ProductItem هستند) را در اختیار حلقه می‌گذارد.
        for (ProductItem item : cart.keySet()) {

            System.out.println("کالا: " + item.getItemId() +
                    " | تعداد: " + cart.get(item) +
                    " | قیمت واحد: " + item.getPriceAfterDiscount() + " toman");
        }
        System.out.println("مجموع کل سبد خرید: " + getCartTotal() + " toman");
    }


    public double getCartTotal() {
        double total = 0;

        for (ProductItem item : cart.keySet()) {

            int quantity = cart.get(item);

            System.out.println("قیمت: " + item.getPriceAfterDiscount());
            System.out.println("تعداد: " + quantity);

            total += item.getPriceAfterDiscount() * quantity;
        }

        System.out.println("جمع کل = " + total);

        return total;
    }
    public boolean checkout(String discountCode) {
        if (cart.isEmpty()) {
            System.out.println("❌ سبد خرید شما خالی است و محصولی برای تسویه وجود ندارد.");
            return false;
        }

        double totalCost = getCartTotal();
        String usedCode = null;
        if (discountCode != null && !discountCode.isEmpty()) {

            DiscountCode discount = MainServer.findDiscountCode(discountCode);

            if (discount != null && discount.isActive()) {

                if (totalCost >= discount.getMinimumPrice()) {

                    if (discount.getDiscountType().equalsIgnoreCase("PERCENT")) {

                        double discountAmount =
                                totalCost * discount.getValue() / 100;

                        totalCost -= discountAmount;

                    }
                    else if (discount.getDiscountType().equalsIgnoreCase("FIXED")) {

                        totalCost -= discount.getValue();

                        if(totalCost < 0){
                            totalCost = 0;
                        }
                    }

                    usedCode = discountCode;
                    discount.setActive(false);

                    System.out.println(
                            "🎉 کد تخفیف با موفقیت اعمال شد."
                    );

                } else {

                    System.out.println(
                            "⚠️ مبلغ خرید به حداقل لازم برای این کد نرسیده است."
                    );

                }

            } else {

                System.out.println(
                        "⚠️ کد تخفیف نامعتبر یا غیرفعال است."
                );

            }
        }





        if (this.wallet < totalCost) {
            System.out.println("❌ خطا: موجودی کیف پول کافی نیست! مبلغ فاکتور: " + totalCost + " تومان");
            return false;
        }


        this.wallet -= totalCost;

        for (ProductItem item : cart.keySet()) {
            int quantity = cart.get(item);
            double itemTotalPrice = item.getPriceAfterDiscount() * quantity;

            item.reduceStock(quantity);

            if (item.getSeller() != null) {
                item.getSeller().updateWallet(itemTotalPrice * 0.90);
            }
            //به سیستم یا حساب کاربری ادمین اصلی برنامه ( به صورت static در کلاس Main تعریف شده ) دسترسی پیدا می‌کند.
            Main.adminSystem.updateWallet(itemTotalPrice * 0.10);
        }

        int randomPurchaseId = new Random().nextInt(90000) + 10000;
        Purchase newPurchase = new Purchase(randomPurchaseId, "1405/03/09", cart, totalCost, usedCode);
        purchaseHistory.add(newPurchase);

        generateDiscountCode();

        cart.clear();
        System.out.println("✅ تسویه حساب با موفقیت انجام شد و فاکتور شماره " + randomPurchaseId + " ثبت گردید.");
        return true;
    }

    public boolean canReview(Product product) {
        if (product == null) return false;

        return !purchaseHistory.isEmpty();
    }

    public void addReviewToProduct(Product product, int rating, String comment) {
        if (product != null) {
            String reviewText = "User: " + this.username + " | Rating: " + rating + " | Comment: " + comment;
            product.addReview(reviewText);
            System.out.println("نظر شما با موفقیت برای محصول ثبت شد.");
        }
    }

    public void generateDiscountCode() {

        Random random = new Random();
        String code = "";

        for (int i = 0; i < 8; i++) {
            code += random.nextInt(10);
        }

        discountCodes.add(code);


        DiscountCode newDiscount = new DiscountCode(
                code,
                "PERCENT",
                5,
                0,
                true,
                "ADMIN"
        );

        MainServer.allDiscountCodes.add(newDiscount);


        System.out.println(
                "🎁 کد تخفیف ۵ درصدی ساخته شد: " + code
        );
    }

    public void viewPurchaseHistory() {
        System.out.println("📜 === تاریخچه خریدهای شما ===");
        if (purchaseHistory.isEmpty()) {
            System.out.println("هیچ خریدی در تاریخچه شما ثبت نشده است.");
            return;
        }
        for (Purchase p : purchaseHistory) {
            p.displayPurchase();
        }
    }
}