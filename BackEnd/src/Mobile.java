public class Mobile extends Product {
    private int cameraMP;
    private int batteryMah;
    private boolean is5G;
    public Mobile( int productId, String name, String brand ,int cameraMP , int batteryMah , boolean is5G ){
        super(productId, name, brand);
        this.batteryMah = batteryMah;
        this.cameraMP = cameraMP;
        this.is5G = is5G;

    }
    public int getCameraMP() { return cameraMP; }
    public int getBatteryMah() { return batteryMah; }
    public boolean is5G() { return is5G; }
    public void setCameraMP(int cameraMP) {
        this.cameraMP = cameraMP;
    }
    public void setBatteryMah(int batteryMah) {
        this.batteryMah = batteryMah;
    }

    public void set5G(boolean is5G) {
        this.is5G = is5G;
    }
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
