package ma.enset.elaaraj.nawal.ebankservice.feign;

import ma.enset.elaaraj.nawal.ebankservice.model.Customer;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "customer-service")
public interface CustomerRestClient {
    @GetMapping("/customers/fid}")
    Customer getCustomerById(@PathVariable Long id);
}
