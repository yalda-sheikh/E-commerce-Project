import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;


public class SearchHandler implements HttpHandler {
    private List<ProductItem> allProductItems;
    ArrayList<Product> shownProducts = new ArrayList<>();

    public SearchHandler(List<ProductItem> allProductItems) {
        this.allProductItems = allProductItems;
    }
    @Override
    public void handle(HttpExchange exchange) throws IOException{
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        if(!exchange.getRequestMethod().equalsIgnoreCase("GET")){
            exchange.sendResponseHeaders(405, -1);
            return;
        }
        String query = exchange.getRequestURI().getQuery();
        String keyword = "";
        if(keyword != null && query.startsWith("q=")){
            keyword = query.substring(2).toLowerCase();

        }
        StringBuilder json =  new StringBuilder();
        json.append("[");
        boolean first = true;
        for (ProductItem item : allProductItems) {
            if (shownProducts.contains(item.product)) {
                continue;
            }

            String name = item.product.getName().toLowerCase();
            String brand = item.product.getBrand().toLowerCase();

            if (name.contains(keyword) || brand.contains(keyword)) {
                shownProducts.add(item.product);

                if (!first)
                    json.append(",");

                json.append("{");
                json.append("\"itemId\":").append(item.getItemId()).append(",");
                json.append("\"name\":\"").append(item.product.getName()).append("\",");
                json.append("\"brand\":\"").append(item.product.getBrand()).append("\",");
                json.append("\"variants\":[");
                ArrayList<ProductItem> variants = new ArrayList<>();
                for(ProductItem p : allProductItems){
                    if(p.product == item.product){
                        variants.add(p);
                    }
                }
                for(int i = 0 ; i< variants.size(); i++ ){
                    ProductItem v = variants.get(i);
                    json.append("{");
                    json.append("\"itemId\":").append(v.getItemId()).append(",");
                    json.append("\"color\":\"").append(v.color).append("\",");
                    json.append("\"price\":").append(v.getFinalPrice()).append(",");
                    json.append("\"stock\":").append(v.getStock());
                    json.append("}");

                    if(i < variants.size() - 1){
                        json.append(",");
                    }
                }
                json.append("],");

                json.append("\"sellerName\":\"")
                        .append(item.seller.username)
                        .append("\",");

                json.append("\"productType\":\"BASE\"");

                json.append("}");

                first = false;
            }
        }
        json.append("]");
        byte[] response = json.toString().getBytes("UTF-8");

        exchange.getResponseHeaders().set("Content-Type", "application/json");

        exchange.sendResponseHeaders(200, response.length);

        OutputStream os = exchange.getResponseBody();
        os.write(response);
        os.close();

    }
}
