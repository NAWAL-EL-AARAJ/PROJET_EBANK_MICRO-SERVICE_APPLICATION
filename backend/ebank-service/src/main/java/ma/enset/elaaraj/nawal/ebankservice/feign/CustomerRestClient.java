package ma.enset.elaaraj.nawal.ebankservice.feign;

import ma.enset.elaaraj.nawal.ebankservice.model.Customer;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Circuit breaker géré par Spring Cloud OpenFeign (spring.cloud.openfeign.circuitbreaker.enabled=true) :
// si customer-service est en panne ou trop lent, la méthode de CustomerRestClientFallback est appelée.
@FeignClient(name = "customer-service", fallback = CustomerRestClientFallback.class)
public interface CustomerRestClient {
    @GetMapping("/customers/{id}")
    Customer getCustomerById(@PathVariable Long id);
}
