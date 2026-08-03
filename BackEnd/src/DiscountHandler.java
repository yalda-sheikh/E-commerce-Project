import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.GsonBuilder;
import java.time.LocalDate;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;


public class DiscountHandler implements HttpHandler {

    private List<DiscountCode> allDiscountCodes;
    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, new LocalDateAdapter())
            .create();

    public DiscountHandler(List<DiscountCode> allDiscountCodes) {
        this.allDiscountCodes = allDiscountCodes;
    }
    @Override
    public void handle(HttpExchange exchange) throws IOException {


        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS ,PUT , DELETE" );
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");

        if("OPTIONS".equalsIgnoreCase((exchange.getRequestMethod()))){
            exchange.sendResponseHeaders(204, -1);}
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {

                try {

                    System.out.println("GET /api/discount called");
                    System.out.println("Discount count: " + allDiscountCodes.size());

                    String json = gson.toJson(allDiscountCodes);

                    byte[] response = json.getBytes(StandardCharsets.UTF_8);

                    exchange.sendResponseHeaders(200, response.length);

                    OutputStream os = exchange.getResponseBody();
                    os.write(response);
                    os.close();

                    return;

                } catch (Exception e) {

                    e.printStackTrace();

                    String error =
                            "{\"error\":\"" + e.getMessage() + "\"}";

                    byte[] response =
                            error.getBytes(StandardCharsets.UTF_8);

                    exchange.sendResponseHeaders(500, response.length);

                    OutputStream os = exchange.getResponseBody();
                    os.write(response);
                    os.close();

                    return;
                }
            }


        if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            try {
                InputStream is = exchange.getRequestBody();

                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                DiscountRequest request = gson.fromJson(body, DiscountRequest.class);
                System.out.println("BODY = " + body);
                System.out.println("startDate = " + request.startDate);
                System.out.println("endDate = " + request.endDate);

                LocalDate startDate = LocalDate.parse(request.startDate);
                LocalDate endDate = LocalDate.parse(request.endDate);



                DiscountCode discount = new DiscountCode(
                        request.code,
                        request.discountType,
                        request.value,
                        request.minimumPrice,
                        request.sellerName,
                        startDate,
                        endDate,
                        request.usageLimit,
                        request.maxDiscount,
                        0

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


    }
    }