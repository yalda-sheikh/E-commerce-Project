import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;


import java.io.IOException;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class FilterHandler implements HttpHandler {
    private List<ProductItem> allProductItems;

    public FilterHandler(List<ProductItem> allProductItems) {
        this.allProductItems = allProductItems;
    }
    @Override
    public void handle(HttpExchange exchange) throws IOException{
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");

        if("OPTIONS".equalsIgnoreCase((exchange.getRequestMethod()))){
            exchange.sendResponseHeaders(204 , -1);
            return;
        }
        if(!"GET" .equalsIgnoreCase((exchange.getRequestMethod()))){
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        Map<String , String> params = new HashMap<>();
        String query = exchange.getRequestURI().getQuery();
        if(query != null){
            String[] pairs = query.split("&");
            for(String pair : pairs){
                String[] kv = pair.split("=");
                if(kv.length == 2){
                    params.put(
                            URLDecoder.decode(kv[0] , StandardCharsets.UTF_8),
                            URLDecoder.decode(kv[1] , StandardCharsets.UTF_8)
                    );
                }

            }

        }
        String brand = params.getOrDefault("brand", "").trim();
        String type = params.getOrDefault("type", "").trim();
        double minPrice = 0;
        double maxPrice = Double.MAX_VALUE;

        if (!params.getOrDefault("minPrice", "").isEmpty()) {
            minPrice = Double.parseDouble(params.get("minPrice"));
        }

        if (!params.getOrDefault("maxPrice", "").isEmpty()) {
            maxPrice = Double.parseDouble(params.get("maxPrice"));
        }
        StringBuilder json = new StringBuilder();
        json.append("[");
        boolean first = true;
        for(ProductItem item : allProductItems){
            System.out.println(item.product.getClass().getSimpleName());

            String productBrand = item.product.getBrand();

            String productType = "BASE";

            if (item.product instanceof Laptop)
                productType = "LAPTOP";

            else if (item.product instanceof Mobile)
                productType = "MOBILE";

            boolean match = true;
            if (!brand.isEmpty()) {

                if (!productBrand.equalsIgnoreCase(brand))
                    match = false;

            }
            if (!type.isEmpty()) {

                if (!productType.equalsIgnoreCase(type))
                    match = false;

            }
            if (item.getFinalPrice() < minPrice)
                match = false;

            if (item.getFinalPrice() > maxPrice)
                match = false;


            if (match) {

                if (!first)
                    json.append(",");

                json.append("{");

                json.append("\"itemId\":").append(item.getItemId()).append(",");
                json.append("\"name\":\"").append(item.product.getName()).append("\",");
                json.append("\"brand\":\"").append(item.product.getBrand()).append("\",");
                json.append("\"color\":\"").append(item.color).append("\",");
                json.append("\"price\":").append(item.getFinalPrice()).append(",");
                json.append("\"stock\":").append(item.getStock()).append(",");
                json.append("\"sellerName\":\"").append(item.seller.username).append("\"");

                if (item.product instanceof Laptop) {

                    Laptop laptop = (Laptop) item.product;

                    json.append(",");
                    json.append("\"productType\":\"LAPTOP\",");
                    json.append("\"ram\":").append(laptop.getRamSize()).append(",");
                    json.append("\"storage\":").append(laptop.getStorage());

                }

                else if (item.product instanceof Mobile) {

                    Mobile mobile = (Mobile) item.product;

                    json.append(",");
                    json.append("\"productType\":\"MOBILE\",");
                    json.append("\"cameraMP\":").append(mobile.getCameraMP()).append(",");
                    json.append("\"batteryMah\":").append(mobile.getBatteryMah()).append(",");
                    json.append("\"is5G\":").append(mobile.is5G());

                }

                else {

                    json.append(",");
                    json.append("\"productType\":\"BASE\"");

                }

                json.append("}");

                first = false;
            }


            System.out.println("Type from React = " + type);
            System.out.println("Product = " + item.product.getName());
            System.out.println("ProductType = " + productType);
            System.out.println("----------------");

        }

        json.append("]");

        byte[] response = json.toString().getBytes(StandardCharsets.UTF_8);

        exchange.sendResponseHeaders(200, response.length);

        OutputStream os = exchange.getResponseBody();

        os.write(response);

        os.close();


}
        }

