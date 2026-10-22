package ma.enset.elaaraj.nawal.ebankservice.feign;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import ma.enset.elaaraj.nawal.ebankservice.model.Customer;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "customer-service")
public interface CustomerRestClient {
    @GetMapping("/customers/{id}")
    @CircuitBreaker(name = "customerService", fallbackMethod = "getDefaultCustomer")
    Customer getCustomerById(@PathVariable Long id);

    // Fallback Resilience4j : mêmes paramètres que la méthode d'origine + l'exception en dernier
    default Customer getDefaultCustomer(Long id, Exception e) {
        return new Customer(id, "NoName", "noEmail");
    }
}
