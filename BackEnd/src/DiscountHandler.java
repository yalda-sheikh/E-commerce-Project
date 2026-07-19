import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;


import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class DiscountHandler implements HttpHandler {

    private List<DiscountCode> allDiscountCodes;

    public DiscountHandler(List<DiscountCode> allDiscountCodes) {
        this.allDiscountCodes = allDiscountCodes;
    }
    @Override
    public void handle(HttpExchange exchange) throws IOException {

        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");

        if("OPTIONS".equalsIgnoreCase((exchange.getRequestMethod()))){
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        if("GET".equalsIgnoreCase(exchange.getRequestMethod())){
            StringBuilder json = new StringBuilder();
            json.append("[");
            for(int i = 0; i< allDiscountCodes.size() ; i++){
                DiscountCode discount = allDiscountCodes.get(i);
                json.append("{");
                json.append("\"code\":\"").append(discount.getCode()).append("\",");
                json.append("\"discountType\":\"").append(discount.getDiscountType()).append("\",");
                json.append("\"value\":").append(discount.getValue()).append(",");
                json.append("\"minimumPrice\":").append(discount.getMinimumPrice()).append(",");
                json.append("\"active\":").append(discount.isActive());
                json.append("}");

                if(i < allDiscountCodes.size() -1){
                    json.append(",");
                }


            }
            json.append("]");
            byte[] response = json.toString().getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, response.length);
            OutputStream os = exchange.getResponseBody();
            os.write(response);
            os.close();
            return;

        }

        if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            try {
                InputStream is = exchange.getRequestBody();

                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                System.out.println("BODY = " + body);

                String code = body.split("\"code\":\"")[1].split("\"")[0];

                String discountType = body.split("\"discountType\":\"")[1].split("\"")[0];

                double value = Double.parseDouble(
                        body.split("\"value\":")[1].split(",")[0]
                );

                double minimumPrice = Double.parseDouble(
                        body.split("\"minimumPrice\":")[1].split(",")[0]
                );

                boolean active = Boolean.parseBoolean(
                        body.split("\"active\":")[1].split("}")[0]
                );
                String sellerName = body.split("\"sellerName\":\"")[1].split("\"")[0];

                DiscountCode discount = new DiscountCode(
                        code,
                        discountType,
                        value,
                        minimumPrice,
                        active,
                        sellerName

                );

                allDiscountCodes.add(discount);
                MainServer.saveData();
                String responseJson =
                        "{\"message\":\"Discount Created Successfully\"}";

                byte[] response = responseJson.getBytes(StandardCharsets.UTF_8);

                exchange.sendResponseHeaders(201, response.length);

                OutputStream os = exchange.getResponseBody();

                os.write(response);

                os.close();

                return;

            }
            catch (Exception e) {

                e.printStackTrace();

                String error = "{\"error\":\"" + e.getMessage() + "\"}";
                byte[] response = error.getBytes(StandardCharsets.UTF_8);

                exchange.sendResponseHeaders(500, response.length);

                OutputStream os = exchange.getResponseBody();
                os.write(response);
                os.close();
            }


        }

        exchange.sendResponseHeaders(405, -1);

    }
    }