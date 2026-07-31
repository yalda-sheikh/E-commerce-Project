public class CheckoutResult {

    private boolean success;
    private String message;
    private double finalPrice;

    public CheckoutResult(boolean success, String message, double finalPrice) {
        this.success = success;
        this.message = message;
        this.finalPrice = finalPrice;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public double getFinalPrice() {
        return finalPrice;
    }
}