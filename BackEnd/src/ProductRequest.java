import java.util.List;

public class ProductRequest {

    private String name;
    private String brand;
    private String sellerName;
    private String productType;

    private int ram;
    private int storage;
    private boolean graphics;

    private int batteryMah;
    private int cameraMP;
    private boolean is5G;

    private List<VariantRequest> variants;

    public String getName() {
        return name;
    }

    public String getBrand() {
        return brand;
    }

    public String getSellerName() {
        return sellerName;
    }

    public String getProductType() {
        return productType;
    }

    public int getRam() {
        return ram;
    }

    public int getStorage() {
        return storage;
    }

    public boolean isGraphics() {
        return graphics;
    }

    public int getBatteryMah() {
        return batteryMah;
    }

    public int getCameraMP() {
        return cameraMP;
    }

    public boolean isIs5G() {
        return is5G;
    }

    public List<VariantRequest> getVariants() {
        return variants;
    }
}