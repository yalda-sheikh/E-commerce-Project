public abstract class User {
    protected int userId;
    protected String username;
    protected String password;
    protected Role role;
    protected double wallet;

    public User(int userId, String username, String password, Role role, double wallet) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.role = role;
        this.wallet = wallet;
    }


    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }
    public void setWallet(double wallet) {
        this.wallet = wallet;
    }
    public double getWallet() {
        return wallet;
    }

    public void updateWallet(double amount) {
        this.wallet += amount;
    }
}