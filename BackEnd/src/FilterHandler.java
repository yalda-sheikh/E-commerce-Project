import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;


import java.io.IOException;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;


public class FilterHandler implements HttpHandler {
    private List<ProductItem> allProductItems;

    public FilterHandler(List<ProductItem> allProductItems) {
        this.allProductItems = allProductItems;
    }
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");

        if ("OPTIONS".equalsIgnoreCase((exchange.getRequestMethod()))) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {

            Map<String, String> params = new HashMap<>();

            String query = exchange.getRequestURI().getQuery();

            if (query != null) {

                String[] pairs = query.split("&");

                for (String pair : pairs) {

                    String[] kv = pair.split("=");

                    if (kv.length == 2) {

                        params.put(
                                URLDecoder.decode(kv[0], StandardCharsets.UTF_8),
                                URLDecoder.decode(kv[1], StandardCharsets.UTF_8)
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

            StringBuilder jsonBuilder = new StringBuilder();

            jsonBuilder.append("[");

            boolean firstProduct = true;

            ArrayList<Product> shownProducts = new ArrayList<>();

            for (ProductItem item : allProductItems) {

                if (shownProducts.contains(item.product))
                    continue;

                shownProducts.add(item.product);

                Product product = item.product;

                String productType = "BASE";

                if (product instanceof Laptop)
                    productType = "LAPTOP";

                else if (product instanceof Mobile)
                    productType = "MOBILE";

                if (!brand.isEmpty() &&
                        !product.getBrand().equalsIgnoreCase(brand))
                    continue;

                if (!type.isEmpty() &&
                        !productType.equalsIgnoreCase(type))
                    continue;

                ArrayList<ProductItem> productVariants = new ArrayList<>();

                boolean priceMatch = false;

                for (ProductItem p : allProductItems) {

                    if (p.product == product) {

                        productVariants.add(p);

                        if (p.getFinalPrice() >= minPrice &&
                                p.getFinalPrice() <= maxPrice) {

                            priceMatch = true;

                        }

                    }

                }

                if (!priceMatch)
                    continue;

                if (!firstProduct)
                    jsonBuilder.append(",");

                firstProduct = false;

                jsonBuilder.append("{");

                jsonBuilder.append("\"itemId\":")
                        .append(item.getItemId())
                        .append(",");

                jsonBuilder.append("\"name\":\"")
                        .append(product.getName())
                        .append("\",");

                jsonBuilder.append("\"brand\":\"")
                        .append(product.getBrand())
                        .append("\",");

                jsonBuilder.append("\"sellerName\":\"")
                        .append(item.seller.username)
                        .append("\",");

                jsonBuilder.append("\"productType\":\"")
                        .append(productType)
                        .append("\",");

                if (product instanceof Laptop) {

                    Laptop laptop = (Laptop) product;

                    jsonBuilder.append("\"ram\":")
                            .append(laptop.getRamSize())
                            .append(",");

                    jsonBuilder.append("\"storage\":")
                            .append(laptop.getStorage())
                            .append(",");


                } else if (product instanceof Mobile) {

                    Mobile mobile = (Mobile) product;

                    jsonBuilder.append("\"cameraMP\":")
                            .append(mobile.getCameraMP())
                            .append(",");

                    jsonBuilder.append("\"batteryMah\":")
                            .append(mobile.getBatteryMah())
                            .append(",");

                    jsonBuilder.append("\"is5G\":")
                            .append(mobile.is5G())
                            .append(",");

                }

                jsonBuilder.append("\"variants\":[");

                for (int j = 0; j < productVariants.size(); j++) {

                    ProductItem v = productVariants.get(j);

                    jsonBuilder.append("{");

                    jsonBuilder.append("\"itemId\":")
                            .append(v.getItemId())
                            .append(",");

                    jsonBuilder.append("\"color\":\"")
                            .append(v.color)
                            .append("\",");

                    jsonBuilder.append("\"price\":")
                            .append(v.getFinalPrice())
                            .append(",");

                    jsonBuilder.append("\"stock\":")
                            .append(v.getStock());

                    jsonBuilder.append("}");

                    if (j < productVariants.size() - 1)
                        jsonBuilder.append(",");

                }

                jsonBuilder.append("]");

                jsonBuilder.append("}");

            }

            jsonBuilder.append("]");

            byte[] response = jsonBuilder.toString().getBytes(StandardCharsets.UTF_8);

            exchange.sendResponseHeaders(200, response.length);

            OutputStream os = exchange.getResponseBody();

            os.write(response);

            os.close();

            return;
        }
    }}