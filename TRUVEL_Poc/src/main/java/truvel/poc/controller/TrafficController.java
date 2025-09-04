package truvel.poc.controller;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import truvel.poc.service.HereTrafficService;

@RequiredArgsConstructor
@Controller
public class TrafficController {

    private final HereTrafficService trafficService;

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("trafficData", trafficService.getTrafficFlowJson());
        return "index";
    }
}

