public class Mobile extends Product {
    private final int cameraMP;
    private final int batteryMah;
    private final boolean is5G;
    public Mobile( int productId, String name, String brand ,int cameraMP , int batteryMah , boolean is5G ){
        super(productId, name, brand);
        this.batteryMah = batteryMah;
        this.cameraMP = cameraMP;
        this.is5G = is5G;

    }
    public int getCameraMP() { return cameraMP; }
    public int getBatteryMah() { return batteryMah; }
    public boolean is5G() { return is5G; }
    public String getBatteryStatus() {
        if (batteryMah < 4000) {
            return "ضعیف";
        } else if (batteryMah <= 5000) {
            return "متوسط";
        } else {
            return "عالی";
        }
    }

    @Override
    public void displayFullInfo() {
        displayBasicInfo();
        System.out.println("Camera: " + cameraMP + "MP");
        System.out.println("Battery: " + batteryMah + "mAh (" + getBatteryStatus() + ")");
        System.out.println("5G Support: " + (is5G ? "Yes" : "No"));
    }
}
