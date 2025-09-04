package truvel.poc.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class HereTrafficService {

    @Value("${here.api.key}")
    private String apiKey;

    public String getTrafficFlowJson() {
        String url = "https://data.traffic.hereapi.com/v7/flow" +
                "?in=circle:52.5200,13.4050;r=300" +
                "&locationReferencing=shape" +
                "&functionalClasses=1,2,3,4,5" +
                "&apikey=" + apiKey;

        RestTemplate restTemplate = new RestTemplate();
        System.out.println(restTemplate.getForObject(url, String.class));
        return restTemplate.getForObject(url, String.class);
    }
}
