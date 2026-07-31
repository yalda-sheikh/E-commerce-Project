import java.time.LocalDate;

public class DiscountCode {

    private String code;              // کد تخفیف
    private String discountType;      // PERCENT یا FIXED
    private double value;             // مقدار تخفیف
    private double minimumPrice;      // حداقل مبلغ خرید
    private String sellerName;
    private LocalDate startDate;
    private LocalDate endDate;

    public DiscountCode(String code,
                        String discountType,
                        double value,
                        double minimumPrice
                         , String sellerName, LocalDate startDate,
                        LocalDate endDate) {

        this.code = code;
        this.discountType = discountType;
        this.value = value;
        this.minimumPrice = minimumPrice;

        this.sellerName= sellerName;
        this.endDate = endDate;
        this.startDate = startDate;

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