package ma.enset.elaaraj.nawal.customerservice.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    public String email;
    }
