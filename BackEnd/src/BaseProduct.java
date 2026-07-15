public class BaseProduct extends Product {

    public BaseProduct(int productId, String name, String brand) {
        super(productId, name, brand);
    }

    @Override
    public void displayFullInfo() {
        displayBasicInfo();
    }
}