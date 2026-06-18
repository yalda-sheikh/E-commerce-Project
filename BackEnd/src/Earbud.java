public class Earbud extends Accessory {

    private int batteryLifeHours;
    private boolean hasNoiseCancellation;

    public Earbud(int productId, String name, String brand,
                  String connectivityType, boolean isOriginal,
                  int batteryLifeHours, boolean hasNoiseCancellation) {

        super(productId, name, brand, connectivityType, isOriginal);
        this.batteryLifeHours = batteryLifeHours;
        this.hasNoiseCancellation = hasNoiseCancellation;
    }

    @Override
    public String getSoundQuality() {
        if (batteryLifeHours > 6 && hasNoiseCancellation) {
            return "عالی";
        } else {
            return "متوسط";
        }
    }

    @Override
    public void displayFullInfo() {
        System.out.println("--- Earbud Full Info ---");
        displayBasicInfo();
        System.out.println("Connectivity: " + connectivityType);
        System.out.println("Original: " + (isOriginal ? "Yes" : "No"));
        System.out.println("Battery Life: " + batteryLifeHours + " hours");
        System.out.println("Noise Cancellation: " + (hasNoiseCancellation ? "Yes" : "No"));
        System.out.println("Sound Quality: " + getSoundQuality());
        System.out.println("------------------------");
    }
}