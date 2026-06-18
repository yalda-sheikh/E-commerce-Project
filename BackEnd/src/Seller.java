import java.util.ArrayList;

public class Seller extends User {
    private ArrayList<ProductItem> myProducts;


    public Seller(int userId, String username, String password, double wallet) {
        super(userId, username, password, Role.SELLER, wallet);
        this.myProducts = new ArrayList<>();
    }

    public void addProductItem(ProductItem item) {
        if (item != null) {
            myProducts.add(item);
            System.out.println("محصول جدید با موفقیت به لیست فروشنده اضافه شد.");
        }
    }

    public void removeProductItem(int itemId) {
        ProductItem found = findProductItem(itemId);
        if (found != null) {
            myProducts.remove(found);
            System.out.println("کالا با شناسه " + itemId + " با موفقیت از لیست فروشنده حذف شد.");
        } else {
            System.out.println("کالایی با این شناسه در لیست شما یافت نشد!");
        }
    }


    public void applyDiscount(int itemId, double percent) {
        ProductItem found = findProductItem(itemId);
        if (found != null) {
            found.applyDiscount(percent);
            System.out.println("تخفیف " + percent + "% روی کالای " + itemId + " اعمال شد.");
        } else {
            System.out.println("کالا یافت نشد!");
        }
    }


    public void viewMyProducts() {
        System.out.println("=== لیست محصولات فروشنده: " + this.username + " ===");
        if (myProducts.isEmpty()) {
            System.out.println("هیچ محصولی توسط این فروشنده ثبت نشده است.");
        } else {
            for (ProductItem item : myProducts) {
                item.displayItemInfo();
            }
        }
    }


    public ProductItem findProductItem(int itemId) {
        for (ProductItem item : myProducts) {
            if (item.getItemId() == itemId) {
                return item;
            }
        }
        return null;
    }
}