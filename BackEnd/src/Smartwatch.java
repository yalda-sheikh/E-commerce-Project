public class Smartwatch extends Product {

    private boolean hasHeartRateMonitor;
    private boolean hasGPS;
    private int batteryLifeDays;
    private double screenSizeInches;


    public Smartwatch(int productId, String name, String brand,
                      boolean hasHeartRateMonitor, boolean hasGPS,
                      int batteryLifeDays, double screenSizeInches) {
        super(productId, name, brand);
        this.hasHeartRateMonitor = hasHeartRateMonitor;
        this.hasGPS = hasGPS;
        this.batteryLifeDays = batteryLifeDays;
        this.screenSizeInches = screenSizeInches;
    }


    public boolean isGoodForSports() {
        return hasGPS && hasHeartRateMonitor;
    }

    public String getBatteryRating() {
        if (batteryLifeDays > 7) {
            return "عالی";
        } else if (batteryLifeDays >= 3) {
            return "خوب";
        } else {
            return "معمولی";
        }
    }


    @Override
    public void displayFullInfo() {
        System.out.println("--- Smartwatch Full Info ---");
        displayBasicInfo();
        System.out.println("Heart Rate Monitor: " + (hasHeartRateMonitor ? "Yes" : "No"));
        System.out.println("GPS: " + (hasGPS ? "Yes" : "No"));
        System.out.println("Battery Life: " + batteryLifeDays + " days (" + getBatteryRating() + ")");
        System.out.println("Screen Size: " + screenSizeInches + " inches");
        System.out.println("Suitable for Sports: " + (isGoodForSports() ? "Yes" : "No"));
        System.out.println("----------------------------");
    }
}