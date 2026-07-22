import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class SellerDiscountHandler implements HttpHandler {
    private List<DiscountCode> allDiscountCodes;
    public SellerDiscountHandler(List<DiscountCode> allDiscountCodes) {
        this.allDiscountCodes = allDiscountCodes;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException{
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");

        if("OPTIONS".equalsIgnoreCase((exchange.getRequestMethod()))){
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        if("GET".equalsIgnoreCase(exchange.getRequestMethod())){
            StringBuilder json = new StringBuilder();
            json.append("[");
            String query = exchange.getRequestURI().getQuery();

            String sellerName = "";

            if (query != null) {
                String[] params = query.split("&");

                for (String param : params) {

                    String[] pair = param.split("=");

                    if (pair.length == 2 && pair[0].equals("sellerName")) {
                        sellerName = URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
                    }
                }
            }
            boolean first = true;
            for(int i = 0; i< allDiscountCodes.size() ; i++){
                DiscountCode discount = allDiscountCodes.get(i);
                if (!discount.getSellerName().equals(sellerName)) {
                    continue;
                }
                if (!first) {
                    json.append(",");
                }
                first = false;

                json.append("{");
                json.append("\"code\":\"").append(discount.getCode()).append("\",");
                json.append("\"discountType\":\"").append(discount.getDiscountType()).append("\",");
                json.append("\"value\":").append(discount.getValue()).append(",");
                json.append("\"minimumPrice\":").append(discount.getMinimumPrice()).append(",");
                json.append("\"active\":").append(discount.isActive()).append(",");
                json.append("\"sellerName\":\"").append(discount.getSellerName()).append("\"");
                json.append("}");



            }
            json.append("]");
            byte[] response = json.toString().getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, response.length);
            OutputStream os = exchange.getResponseBody();
            os.write(response);
            os.close();
            return;
        }


        if ("PUT".equalsIgnoreCase(exchange.getRequestMethod())) {

            InputStream is = exchange.getRequestBody();

            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            String code = body.split("\"code\":\"")[1].split("\"")[0];

            String discountType = body.split("\"discountType\":\"")[1].split("\"")[0];

            double value = Double.parseDouble(
                    body.split("\"value\":")[1].split(",")[0]
            );

            double minimumPrice = Double.parseDouble(
                    body.split("\"minimumPrice\":")[1].split(",")[0]
            );

            boolean active = Boolean.parseBoolean(
                    body.split("\"active\":")[1].split(",")[0]
            );

            String sellerName = body.split("\"sellerName\":\"")[1].split("\"")[0];

            for (DiscountCode discount : allDiscountCodes) {

                if (discount.getCode().equals(code)
                        && discount.getSellerName().equals(sellerName)) {

                    discount.setDiscountType(discountType);
                    discount.setValue(value);
                    discount.setMinimumPrice(minimumPrice);
                    discount.setActive(active);

                    MainServer.saveData();

                    String responseJson =
                            "{\"message\":\"Discount Updated Successfully\"}";

                    byte[] response = responseJson.getBytes(StandardCharsets.UTF_8);

                    exchange.sendResponseHeaders(200, response.length);

                    OutputStream os = exchange.getResponseBody();

                    os.write(response);

                    os.close();

                    return;
                }
            }

            String responseJson =
                    "{\"error\":\"Discount Not Found\"}";

            byte[] response = responseJson.getBytes(StandardCharsets.UTF_8);

            exchange.sendResponseHeaders(404, response.length);

            OutputStream os = exchange.getResponseBody();

            os.write(response);

            os.close();

            return;
        }
        if ("DELETE".equalsIgnoreCase(exchange.getRequestMethod())) {

            String query = exchange.getRequestURI().getQuery();

            String code = "";
            String sellerName = "";

            if (query != null) {

                String[] params = query.split("&");

                for (String param : params) {

                    String[] pair = param.split("=");

                    if (pair.length == 2) {

                        if (pair[0].equals("code")) {
                            code = URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
                        }

                        if (pair[0].equals("sellerName")) {
                            sellerName = URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
                        }
                    }
                }
            }

            for (int i = 0; i < allDiscountCodes.size(); i++) {

                DiscountCode discount = allDiscountCodes.get(i);

                if (discount.getCode().equals(code)
                        && discount.getSellerName().equals(sellerName)) {

                    allDiscountCodes.remove(i);

                    MainServer.saveData();

                    String responseJson =
                            "{\"message\":\"Discount Deleted Successfully\"}";

                    byte[] response = responseJson.getBytes(StandardCharsets.UTF_8);

                    exchange.sendResponseHeaders(200, response.length);

                    OutputStream os = exchange.getResponseBody();

                    os.write(response);

                    os.close();

                    return;
                }
            }

            exchange.sendResponseHeaders(404, -1);

            return;
        }

    }



}
