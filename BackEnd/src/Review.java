public class Review {
    private int reviewId;
    private String customerUsername;
    private Product product;
    private int rating;
    private String comment;
    private String date;


    public Review(int reviewId, String customerUsername, Product product, int rating, String comment, String date) {
        this.reviewId = reviewId;
        this.customerUsername = customerUsername;
        this.product = product;
        if (rating >= 1 && rating <= 5) {
            this.rating = rating;
        } else {
            this.rating = 3;
        }
        this.comment = comment;
        this.date = date;
    }


    public String getStarRating() {
        String stars = "";
        for (int i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += "★";
            } else {
                stars += "☆";
            }
        }
        return stars + " (" + rating + "/5)";
    }


    public void displayReview() {
        System.out.println(getStarRating() + " - " + customerUsername + date + " : \"" + comment + "\"");
    }
}