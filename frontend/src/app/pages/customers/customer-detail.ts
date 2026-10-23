import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AccountService } from '../../core/account.service';
import { CustomerService } from '../../core/customer.service';
import { BankAccount, Customer } from '../../core/models';
import { AccountTypePipe } from '../../shared/account-type.pipe';

@Component({
  selector: 'app-customer-detail',
  imports: [RouterLink, DecimalPipe, DatePipe, AccountTypePipe],
  template: `
    <a class="back" routerLink="/customers">← Clients</a>

    @if (customer(); as c) {
      <div class="page-header">
        <h1>{{ c.name }}</h1>
        <a class="btn" routerLink="/accounts/new" [queryParams]="{ customerId: c.id }">Ouvrir un compte</a>
      </div>

      <div class="card details">
        <div><span class="muted">ID</span>{{ c.id }}</div>
        <div><span class="muted">Email</span>{{ c.email }}</div>
        <div><span class="muted">Solde total</span>{{ total() | number: '1.2-2' }} MAD</div>
      </div>

      <h2>Comptes ({{ accounts().length }})</h2>
      <div class="card">
        <table>
          <thead>
            <tr><th>Compte</th><th>Type</th><th>Créé le</th><th class="num">Solde (MAD)</th></tr>
          </thead>
          <tbody>
            @for (a of accounts(); track a.id) {
              <tr>
                <td><a class="mono" [routerLink]="['/accounts', a.id]">{{ a.id }}</a></td>
                <td><span class="badge" [class.saving]="a.type === 'saving-account'">{{ a.type | accountType }}</span></td>
                <td>{{ a.createdAt | date: 'short' }}</td>
                <td class="num">{{ a.balance | number: '1.2-2' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="muted">Aucun compte pour ce client.</td></tr>
            }
          </tbody>
        </table>
      </div>
    } @else if (loading()) {
      <p class="muted">Chargement…</p>
    } @else {
      <p class="muted">Client introuvable.</p>
    }
  `,
})
export class CustomerDetail implements OnInit {
  // lié au paramètre de route :id (withComponentInputBinding)
  readonly id = input.required<string>();

  private customerService = inject(CustomerService);
  private accountService = inject(AccountService);

  protected customer = signal<Customer | null>(null);
  protected accounts = signal<BankAccount[]>([]);
  protected loading = signal(true);
  protected total = computed(() => this.accounts().reduce((sum, a) => sum + a.balance, 0));

  ngOnInit(): void {
    const id = Number(this.id());
    // l'API n'a pas d'endpoint "comptes d'un client" : on filtre la liste complète
    forkJoin({ customer: this.customerService.getById(id), accounts: this.accountService.getAll() }).subscribe({
      next: ({ customer, accounts }) => {
        this.customer.set(customer);
        this.accounts.set(accounts.filter(a => a.customerId === id));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
