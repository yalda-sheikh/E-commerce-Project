import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Random;

public class Customer extends User {
    private HashMap<ProductItem, Integer> cart;
    private ArrayList<Purchase> purchaseHistory;
    private ArrayList<String> usedDiscountCodes = new ArrayList<>();
    private DiscountCode appliedDiscount;
    private double appliedDiscountAmount;
    private double priceAfterDiscount;

    public Customer(int userId, String username, String password, double wallet ) {
        super(userId, username, password, Role.CUSTOMER, wallet);
        this.cart = new HashMap<>();
        this.purchaseHistory = new ArrayList<>();
    }
    public ArrayList<Purchase> getPurchaseHistory(){
        return purchaseHistory;
    }
    public void addPurchaseHistory(Purchase purchase) {
        if (purchase != null) {
            purchaseHistory.add(purchase);
        }
    }

    public ArrayList<String> getUsedDiscountCodes() {
        return usedDiscountCodes;
    }
    public double getAppliedDiscountAmount() {
        return appliedDiscountAmount;
    }

    public void setAppliedDiscountAmount(double appliedDiscountAmount) {
        this.appliedDiscountAmount = appliedDiscountAmount;
    }


    public double getPriceAfterDiscount() {
        return priceAfterDiscount;
    }

    public void setPriceAfterDiscount(double priceAfterDiscount) {
        this.priceAfterDiscount = priceAfterDiscount;
    }
    public DiscountCode getAppliedDiscount() {
        return appliedDiscount;
    }

    public void setAppliedDiscount(DiscountCode appliedDiscount) {
        this.appliedDiscount = appliedDiscount;
    }

    public void setUsedDiscountCodes(ArrayList<String> usedDiscountCodes) {
        this.usedDiscountCodes = usedDiscountCodes;
    }
    public boolean hasUsedCode(String code){
        System.out.println("USED CODES = " + usedDiscountCodes);
        System.out.println("CHECK CODE = " + code);
        return usedDiscountCodes.contains(code);
    }


    public void addUsedCode(String code){
        if(!usedDiscountCodes.contains(code)){
            usedDiscountCodes.add(code);
        }
    }
    public void removeAppliedDiscount() {
        this.appliedDiscount = null;
    }

    public double getDiscountEligibleTotal(DiscountCode discount) {


        if (discount == null) {
            return 0;
        }

        double total = 0;


        for (ProductItem item : cart.keySet()) {

            int quantity = cart.get(item);

            boolean include = true;


            // محدودیت فروشنده
            if (discount.isSellerOnly()) {

                if (item.getSeller() == null ||
                        !item.getSeller()
                                .getUsername()
                                .equals(discount.getSellerName())) {

                    include = false;

                }
            }


            // محدودیت محصول
            if (discount.getProductId() != null) {

                if (item.getProduct() == null ||
                        item.getProduct().getId()
                                != discount.getProductId()) {

                    include = false;
                }
            }


            // محدودیت دسته بندی
            if (discount.getCategory() != null) {

                if (item.getProduct() == null ||
                        !item.getProduct()
                                .getCategory()
                                .equalsIgnoreCase(discount.getCategory())) {

                    include = false;
                }
            }


            if (include) {

                total += item.getPriceAfterDiscount()
                        * quantity;
            }
        }


        return total;
    }



    public void addToCart(ProductItem item, int quantity) {
        if (item == null || quantity <= 0) return;
        appliedDiscount = null;

        if (item.getStock() >= quantity) {
            // متد برای تعیین اینکه از قبل محصول وجود داشته است یا خیر getOrDefault
            // پیشفرض 0
            int currentQty = cart.getOrDefault(item, 0);
            // بروز رسانی یا اضافه کردن به تعداد محصول درون سبد خرید
            cart.put(item, currentQty + quantity);
            MainServer.saveData();
            System.out.println(quantity + " عدد کالا به سبد خرید اضافه شد.");
        } else {
            System.out.println("❌ خطا: موجودی کافی نیست! موجودی فعلی: " + item.getStock());
        }
    }
    public java.util.HashMap<ProductItem, Integer> getCart() {
        return this.cart;
    }
    public void setCart(HashMap<ProductItem, Integer> cart) {
        this.cart = cart;
    }


    public void removeFromCart(int itemId) {
        ProductItem toRemove = null;
        //جاوا لیستی از تمام کلیدها (که همان اشیاء ProductItem هستند) را در اختیار حلقه می‌گذارد.
        for (ProductItem item : cart.keySet()) {
            if (item.getItemId() == itemId) {
                toRemove = item;
                appliedDiscount = null;
                break;
            }
        }
        if (toRemove != null) {
            cart.remove(toRemove);
            MainServer.saveData();
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
    public CheckoutResult checkout(String discountCode) {

        if (cart.isEmpty()) {
            System.out.println("❌ سبد خرید خالی است.");

            return new CheckoutResult(
                    false,
                    "CART_EMPTY",
                    0
            );
        }


        double totalCost = getCartTotal();
        double discountAmount = 0;

        String usedCode = null;


        // ===============================
        // اعمال تخفیف تایید شده
        // ===============================

        if (appliedDiscount != null) {

            DiscountCode discount = appliedDiscount;


            double eligiblePrice =
                    getDiscountEligibleTotal(discount);




            if (discount.getDiscountType()
                    .equalsIgnoreCase("PERCENT")) {


                discountAmount =
                        eligiblePrice *
                                discount.getValue() / 100;


                if (discount.getMaxDiscount() > 0 &&
                        discountAmount > discount.getMaxDiscount()) {

                    discountAmount =
                            discount.getMaxDiscount();
                }


            } else if (discount.getDiscountType()
                    .equalsIgnoreCase("FIXED")) {


                discountAmount =
                        discount.getValue();


                if (discountAmount > eligiblePrice) {
                    discountAmount = eligiblePrice;
                }

            }


            totalCost -= discountAmount;


            if (totalCost < 0) {
                totalCost = 0;
            }


            usedCode = discount.getCode();


            System.out.println(
                    "🎉 تخفیف اعمال شد. مبلغ نهایی: "
                            + totalCost
            );

        }



        // ===============================
        // بررسی موجودی کیف پول
        // ===============================

        if (this.wallet < totalCost) {

            System.out.println(
                    "❌ موجودی کیف پول کافی نیست."
            );


            return new CheckoutResult(
                    false,
                    "INSUFFICIENT_WALLET",
                    totalCost
            );
        }



        // ===============================
        // کم کردن پول
        // ===============================

        this.wallet -= totalCost;



        // ===============================
        // کم کردن موجودی و تقسیم پول
        // ===============================

        for (ProductItem item : cart.keySet()) {


            int quantity = cart.get(item);


            double itemTotalPrice =
                    item.getPriceAfterDiscount()
                            * quantity;



            item.reduceStock(quantity);



            if (item.getSeller() != null) {

                item.getSeller()
                        .updateWallet(
                                itemTotalPrice * 0.90
                        );
            }



            Main.adminSystem.updateWallet(
                    itemTotalPrice * 0.10
            );
        }




        // ===============================
        // ثبت خرید
        // ===============================

        int randomPurchaseId =
                new Random().nextInt(90000) + 10000;


        Purchase newPurchase =
                new Purchase(
                        randomPurchaseId,
                        "1405/03/09",
                        cart,
                        totalCost,
                        usedCode,
                        discountAmount

                );


        purchaseHistory.add(newPurchase);







        // ===============================
        // مصرف کردن کد تخفیف بعد از خرید موفق
        // ===============================

        if (usedCode != null) {


            DiscountCode discount =
                    MainServer.findDiscountCode(
                            usedCode
                    );


            if (discount != null) {


                discount.setUsedCount(
                        discount.getUsedCount() + 1
                );
            }


            addUsedCode(usedCode);


            // پاک کردن تخفیف فعال بعد از خرید
            appliedDiscount = null;


            MainServer.saveData();
        }




        cart.clear();
        appliedDiscount = null;



        System.out.println(
                "✅ خرید با موفقیت انجام شد."
        );



        return new CheckoutResult(
                true,
                "SUCCESS",
                totalCost
        );
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