public abstract class Accessory extends Product {
    protected String connectivityType;
    protected boolean isOriginal;

    public Accessory(int productId, String name, String brand, String connectivityType, boolean isOriginal) {
        super(productId, name, brand);
        this.connectivityType = connectivityType;
        this.isOriginal = isOriginal;
    }


    public abstract String getSoundQuality();

}