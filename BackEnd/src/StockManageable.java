public interface StockManageable {
    void reduceStock(int quantity);
    boolean isLowStock();
    int getStock();
}
