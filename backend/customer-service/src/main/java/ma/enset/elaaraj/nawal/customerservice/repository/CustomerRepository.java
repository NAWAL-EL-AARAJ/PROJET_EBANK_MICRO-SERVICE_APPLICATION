package ma.enset.elaaraj.nawal.customerservice.repository;

import ma.enset.elaaraj.nawal.customerservice.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
