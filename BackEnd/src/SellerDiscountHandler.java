import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
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


        exchange.sendResponseHeaders(405, -1);
        if ("PUT".equalsIgnoreCase(exchange.getRequestMethod())) {





        }

    }



}
