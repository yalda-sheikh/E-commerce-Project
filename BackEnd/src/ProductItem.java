public class ProductItem implements StockManageable, Discountable {

    int itemId;
    Product product;
    Seller seller;
    String color;
    double price;
    double discountPercent;
    int stock;
    public ProductItem(int itemId , Product product  , Seller seller, String color , double price, double discountPercent , int stock){
        this.itemId = itemId;
        this.price = price;
        this.product = product;
        this.seller = seller;
        this.color = color;
        this.discountPercent = discountPercent;
        this.stock = stock;


    }
    public double getFinalPrice() {
        return price * (1 - (discountPercent / 100.0));
    }

    public int getItemId(){
        return itemId;
    }

    public Seller getSeller(){
        return this.seller;
    }



    @Override
    public void applyDiscount(double percent) {
        if (percent >= 0 && percent <= 100) {
            this.discountPercent = percent;
        } else {
            System.out.println("درصد تخفیف نامعتبر است!");
        }
    }

    public double getPrice() {
        return price;
    }

    @Override
    public double getPriceAfterDiscount() {
        return getFinalPrice();
    }

    @Override
    public void reduceStock(int quantity) {
        if (quantity > 0 && this.stock >= quantity) {
            this.stock -= quantity;
        } else {
            System.out.println("خطا: موجودی کافی نیست یا تعداد وارد شده نامعتبر است.");
        }
    }

    @Override
    public boolean isLowStock() {
        return stock < 3;
    }

    @Override
    public int getStock() {
        return stock;
    }

    void displayItemInfo() {
        System.out.println("Item ID: " + itemId);

        if (product != null) {
            product.displayBasicInfo();
        }

        System.out.println("Color: " + color);
        System.out.println("Price: " + price);
        System.out.println("Discount: " + discountPercent + "%");
        System.out.println("Final Price: " + getFinalPrice());
        System.out.println("Stock: " + stock);
    }

}
