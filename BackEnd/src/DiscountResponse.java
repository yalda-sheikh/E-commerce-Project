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
    private String sellerName;

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
            String sellerName,
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
        this.sellerName = sellerName;
        this.sellerOnly = sellerOnly;
    }
}