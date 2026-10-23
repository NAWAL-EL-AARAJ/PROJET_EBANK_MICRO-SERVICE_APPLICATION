package ma.enset.elaaraj.nawal.ebankservice.feign;

import ma.enset.elaaraj.nawal.ebankservice.model.Customer;
import org.springframework.stereotype.Component;

/**
 * Réponse de secours utilisée par le circuit breaker (Resilience4j via OpenFeign)
 * quand customer-service ne répond pas ou renvoie une erreur.
 */
@Component
public class CustomerRestClientFallback implements CustomerRestClient {

    @Override
    public Customer getCustomerById(Long id) {
        return new Customer(id, "NoName", "noEmail");
    }
}
