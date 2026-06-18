public class Headphone extends Accessory {

    private boolean hasMicrophone;
    private int impedance;

    public Headphone(int productId, String name, String brand,
                     String connectivityType, boolean isOriginal,
                     boolean hasMicrophone, int impedance) {
        super(productId, name, brand, connectivityType, isOriginal);
        this.hasMicrophone = hasMicrophone;
        this.impedance = impedance;
    }

    @Override
    public String getSoundQuality() {
        if (impedance < 32) {
            return "معمولی";
        } else if (impedance >= 80) {
            return "عالی";
        } else {
            return "خوب";
        }
    }

    @Override
    public void displayFullInfo() {
        System.out.println("--- Headphone Full Info ---");
        displayBasicInfo();
        System.out.println("Connectivity: " + connectivityType);
        System.out.println("Original: " + (isOriginal ? "Yes" : "No"));
        System.out.println("Has Microphone: " + (hasMicrophone ? "Yes" : "No"));
        System.out.println("Impedance: " + impedance + " ohm");
        System.out.println("Sound Quality: " + getSoundQuality());
        System.out.println("---------------------------");
    }
}