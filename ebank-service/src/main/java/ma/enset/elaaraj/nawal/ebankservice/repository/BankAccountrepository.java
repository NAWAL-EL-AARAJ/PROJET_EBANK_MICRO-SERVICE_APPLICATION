package ma.enset.elaaraj.nawal.ebankservice.repository;

import ma.enset.elaaraj.nawal.ebankservice.entities.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BankAccountrepository extends JpaRepository<BankAccount,String> {
    List<BankAccount> findByCustomerId(Long id);
}
