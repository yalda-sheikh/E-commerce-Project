public class Headset extends Accessory {
    // ویژگی‌های خاص هدست
    private boolean hasRGB;
    private boolean surroundSound;


    public Headset(int productId, String name, String brand,
                   String connectivityType, boolean isOriginal,
                   boolean hasRGB, boolean surroundSound) {

        super(productId, name, brand, connectivityType, isOriginal);
        this.hasRGB = hasRGB;
        this.surroundSound = surroundSound;
    }

    public boolean isGamingHeadset() {
        return surroundSound && hasRGB;
    }

    @Override
    public String getSoundQuality() {
        if (isGamingHeadset()) {
            return "عالی";
        } else {
            return "متوسط";
        }
    }


    @Override
    public void displayFullInfo() {
        System.out.println("--- Headset Full Info ---");
        displayBasicInfo();
        System.out.println("Connectivity: " + connectivityType);
        System.out.println("Original: " + (isOriginal ? "Yes" : "No"));
        System.out.println("Has RGB: " + (hasRGB ? "Yes" : "No"));
        System.out.println("Surround Sound: " + (surroundSound ? "Yes" : "No"));
        System.out.println("Is Gaming Headset: " + (isGamingHeadset() ? "Yes" : "No"));
        System.out.println("Sound Quality: " + getSoundQuality());
        System.out.println("-------------------------");
    }
}