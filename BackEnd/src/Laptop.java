public class Laptop extends Product implements Tax {
    private int ramSize;
    private int storage;
    private boolean hasGraphicsCard;
    ProductItem productItem;

    public Laptop(int productId, String name, String brand, int ramSize, int storage, boolean hasGraphicsCard) {
        super(productId, name, brand);
        this.ramSize = ramSize;
        this.storage = storage;
        this.hasGraphicsCard = hasGraphicsCard;
    }
    public int getRamSize(){
        return ramSize;
    }
    public int getStorage(){
        return storage;
    }

    public boolean isGamingLaptop() {
        return ramSize >= 16 && hasGraphicsCard;
    }

    @Override
    public double calculateTax() {
        return productItem.getPrice() * 0.09;
    }

    @Override
    public void displayFullInfo() {
        displayBasicInfo();
        System.out.println("Tax: " + calculateTax());
        System.out.println("RAM: " + ramSize + "GB");
        System.out.println("Storage: " + storage + "GB");
        System.out.println("Graphics Card: " + (hasGraphicsCard ? "Yes" : "No"));
        System.out.println("Gaming Status: " + (isGamingLaptop() ? "Gaming Laptop" : "Standard Laptop"));
    }
}