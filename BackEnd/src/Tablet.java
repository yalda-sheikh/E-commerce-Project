public class Tablet extends Product {
    private boolean hasStylus;
    private double screenSize;


    public Tablet(int productId, String name, String brand, boolean hasStylus, double screenSize) {
        super(productId, name, brand);
        this.hasStylus = hasStylus;
        this.screenSize = screenSize;
    }

    public boolean isGoodForNoteTaking() {
        return hasStylus && screenSize >= 10.0;
    }

    @Override
    public void displayFullInfo() {
        System.out.println("--- Tablet Full Info ---");
        displayBasicInfo();
        System.out.println("Has Stylus: " + (hasStylus ? "Yes" : "No"));
        System.out.println("Screen Size: " + screenSize + " inches");
        System.out.println("Good for Note Taking: " + (isGoodForNoteTaking() ? "Yes" : "No"));
        System.out.println("------------------------");
    }
}