package ma.enset.elaaraj.nawal.ebankservice.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
import lombok.*;
import ma.enset.elaaraj.nawal.ebankservice.model.Customer;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankAccount {
    @Id
    private String id;
    private Date createdAt;
    private double balance;
    private String type;
    private long customerId;
    @Transient
    private Customer customer;
}
