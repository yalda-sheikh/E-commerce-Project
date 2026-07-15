import java.util.ArrayList;
public abstract class Product {
    protected int productId;
    protected String name;
    protected String brand;
    protected ArrayList<String> reviews;
    public Product(int productId, String name, String brand) {

        this.productId = productId;
        this.name = name;
        this.brand = brand;
        this.reviews = new ArrayList<>();
    }
    public void addReview(String reviewText){
        if(this.reviews != null){
            this.reviews.add(reviewText);
        }
    }

    public int getId(){
        return this.productId;
    }
    public String getName(){
        return name;
    }
    public String getBrand(){
        return brand;
    }
    public void setName(String name) {
        this.name = name;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }


    public ArrayList<String> getReviews() {
        return reviews;
    }

    public void displayBasicInfo() {
        System.out.println("ID: " + productId + " | Name: " + name + " | Brand: " + brand);
    }
    public abstract void displayFullInfo();
}
