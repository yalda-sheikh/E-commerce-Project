public class DiscountResponse {

    String code;
    String discountType;
    double value;
    double minimumPrice;
    double maxDiscount;
    int usageLimit;
    String startDate;
    String endDate;
    String category;
    String productName;
    boolean sellerOnly;

    public DiscountResponse(
            String code,
            String discountType,
            double value,
            double minimumPrice,
            double maxDiscount,
            int usageLimit,
            String startDate,
            String endDate,
            String category,
            String productName,
            boolean sellerOnly
    ) {
        this.code = code;
        this.discountType = discountType;
        this.value = value;
        this.minimumPrice = minimumPrice;
        this.maxDiscount = maxDiscount;
        this.usageLimit = usageLimit;
        this.startDate = startDate;
        this.endDate = endDate;
        this.category = category;
        this.productName = productName;
        this.sellerOnly = sellerOnly;
    }
}