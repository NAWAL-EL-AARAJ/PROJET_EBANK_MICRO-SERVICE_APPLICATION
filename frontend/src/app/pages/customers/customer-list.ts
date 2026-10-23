import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../core/customer.service';
import { Customer } from '../../core/models';

@Component({
  selector: 'app-customer-list',
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <h1>Clients</h1>
      <a class="btn" routerLink="/customers/new">Nouveau client</a>
    </div>

    <input class="search" type="search" placeholder="Rechercher par nom ou email…"
           [value]="query()" (input)="query.set($any($event.target).value)" />

    <div class="card">
      @if (loading()) {
        <p class="muted">Chargement…</p>
      } @else {
        <table>
          <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th></th></tr></thead>
          <tbody>
            @for (c of filtered(); track c.id) {
              <tr>
                <td>{{ c.id }}</td>
                <td>{{ c.name }}</td>
                <td>{{ c.email }}</td>
                <td class="num"><a [routerLink]="['/customers', c.id]">Détails</a></td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="muted">Aucun client.</td></tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class CustomerList implements OnInit {
  private customerService = inject(CustomerService);

  protected customers = signal<Customer[]>([]);
  protected loading = signal(true);
  protected query = signal('');

  protected filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.customers().filter(c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.customerService.getAll().subscribe({
      next: list => {
        this.customers.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
