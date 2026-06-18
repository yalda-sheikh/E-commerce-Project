import java.util.HashMap;

public class Purchase {
    private int purchaseId;
    private String purchaseDate;
    private HashMap<ProductItem, Integer> items;
    private double totalAmount;
    private String discountCodeUsed;
    public int getPurchaseId(){
        return this.purchaseId;
    }
    public String getPurchaseDate(){
        return this.purchaseDate;
    }
    public double getTotalAmount(){
        return this.totalAmount;
    }
    public String getDiscountCodeUsed(){
        return this.discountCodeUsed;
    }


    public Purchase(int purchaseId, String purchaseDate, HashMap<ProductItem, Integer> items,
                    double totalAmount, String discountCodeUsed) {
        this.purchaseId = purchaseId;
        this.purchaseDate = purchaseDate;
        this.items = new HashMap<>(items);
        this.totalAmount = totalAmount;
        this.discountCodeUsed = discountCodeUsed;
    }


    public void displayPurchase() {
        System.out.println("🧾 Invoice ID: " + purchaseId + " | Date: " + purchaseDate);
        System.out.println("Total Paid: " + totalAmount + " toman");
        System.out.println("Discount Code Used: " + (discountCodeUsed != null ? discountCodeUsed : "None"));
        System.out.println("Items:");
        for (ProductItem item : items.keySet()) {
            int quantity = items.get(item);
            System.out.println("  - Item ID: " + item.getItemId() + " | Quantity: " + quantity);
        }
        System.out.println("-----------------------------------");
    }
}