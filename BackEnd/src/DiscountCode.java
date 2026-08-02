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

    public DiscountCode(
            String code,
            String discountType,
            double value,
            double minimumPrice,
            String sellerName,
            LocalDate startDate,
            LocalDate endDate,
            int usageLimit,
            double maxDiscount
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
        this.usedCount = 0;


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