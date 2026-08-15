import java.time.LocalDate;

public class DiscountCode {

    private String code;              // کد تخفیف
    private String discountType;      // PERCENT یا FIXED
    private double value;             // مقدار تخفیف
    private double minimumPrice;      // حداقل مبلغ خرید
    private String sellerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private int usageLimit;
    private int usedCount;
    private double maxDiscount;
    private String category;
    private Integer productId;
    private boolean sellerOnly;
    private Integer customerId;
    private Integer maxPurchaseCount;

    public DiscountCode(
            String code,
            String discountType,
            double value,
            double minimumPrice,
            String sellerName,
            LocalDate startDate,
            LocalDate endDate,
            int usageLimit,
            double maxDiscount,
            int usedCount,
            String category,
            Integer productId,
            boolean sellerOnly,
            Integer customerId,
            Integer maxPurchaseCount
    ){

        this.code = code;
        this.discountType = discountType;
        this.value = value;
        this.minimumPrice = minimumPrice;
        this.sellerName= sellerName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.usageLimit = usageLimit;
        this.maxDiscount = maxDiscount;
        this.usedCount= usedCount;
        this.category = category;
        this.productId = productId;
        this.sellerOnly = sellerOnly;
        this.customerId = customerId;
        this.maxPurchaseCount = maxPurchaseCount;


    }
    public Integer getCustomerId() {
        return customerId;
    }

    public Integer getMaxPurchaseCount() {
        return maxPurchaseCount;
    }

    public void setMaxPurchaseCount(Integer maxPurchaseCount) {
        this.maxPurchaseCount = maxPurchaseCount;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }
    public Integer getProductId() {
        return productId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
    public boolean isSellerOnly() {
        return sellerOnly;
    }
    public void setSellerOnly(boolean sellerOnly) {
        this.sellerOnly = sellerOnly;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public void setMaxDiscount(double maxDiscount) {
        this.maxDiscount = maxDiscount;
    }

    public double getMaxDiscount() {
        return maxDiscount;
    }

    public int getUsageLimit() {
        return usageLimit;
    }

    public int getUsedCount() {
        return usedCount;
    }

    public void setUsageLimit(int usageLimit) {
        this.usageLimit = usageLimit;
    }

    public void setUsedCount(int usedCount) {
        this.usedCount = usedCount;
    }

    public LocalDate getStartDate(){
        return  startDate;
    }
    public LocalDate getEndDate(){
        return  endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    public void setStartDate(LocalDate startDate){
        this.startDate = startDate;
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



    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }


}