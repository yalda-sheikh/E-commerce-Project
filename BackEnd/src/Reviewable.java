public interface Reviewable {
    void addReview(Review review);
    void showReviews();
    double getAverageRating();
}
