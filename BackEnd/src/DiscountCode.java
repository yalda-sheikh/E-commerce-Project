public class DiscountCode {

    private String code;              // کد تخفیف
    private String discountType;      // PERCENT یا FIXED
    private double value;             // مقدار تخفیف
    private double minimumPrice;      // حداقل مبلغ خرید
    private boolean active;
    private String sellerName;

    public DiscountCode(String code,
                        String discountType,
                        double value,
                        double minimumPrice,
                        boolean active , String sellerName) {

        this.code = code;
        this.discountType = discountType;
        this.value = value;
        this.minimumPrice = minimumPrice;
        this.active = active;
        this.sellerName= sellerName;
    }

    public String getCode() {
        return code;
    }

    public String getDiscountType() {
        return discountType;
    }

    public double getValue() {
        return value;
    }

    public double getMinimumPrice() {
        return minimumPrice;
    }

    public boolean isActive() {
        return active;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public void setMinimumPrice(double minimumPrice) {
        this.minimumPrice = minimumPrice;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }


}