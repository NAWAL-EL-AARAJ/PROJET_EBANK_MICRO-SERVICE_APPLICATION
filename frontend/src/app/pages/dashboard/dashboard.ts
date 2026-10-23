import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AccountService } from '../../core/account.service';
import { CustomerService } from '../../core/customer.service';
import { BankAccount, Customer } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe],
  template: `
    <h1>Tableau de bord</h1>

    @if (loading()) {
      <p class="muted">Chargement…</p>
    } @else {
      <div class="stats">
        <a class="card stat" routerLink="/customers">
          <span class="stat-label">Clients</span>
          <span class="stat-value">{{ customers().length }}</span>
        </a>
        <a class="card stat" routerLink="/accounts">
          <span class="stat-label">Comptes</span>
          <span class="stat-value">{{ accounts().length }}</span>
        </a>
        <div class="card stat">
          <span class="stat-label">Encours total</span>
          <span class="stat-value">{{ totalBalance() | number: '1.2-2' }} MAD</span>
        </div>
      </div>

      <h2>Encours par client</h2>
      <div class="card">
        <table>
          <thead>
            <tr><th>Client</th><th class="num">Comptes</th><th class="num">Solde total (MAD)</th></tr>
          </thead>
          <tbody>
            @for (row of byCustomer(); track row.customer.id) {
              <tr>
                <td><a [routerLink]="['/customers', row.customer.id]">{{ row.customer.name }}</a></td>
                <td class="num">{{ row.count }}</td>
                <td class="num">{{ row.total | number: '1.2-2' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="actions">
        <a class="btn" routerLink="/customers/new">Nouveau client</a>
        <a class="btn" routerLink="/accounts/new">Ouvrir un compte</a>
        <a class="btn secondary" routerLink="/chat">Poser une question au chatbot</a>
      </div>
    }
  `,
})
export class Dashboard implements OnInit {
  private customerService = inject(CustomerService);
  private accountService = inject(AccountService);

  protected customers = signal<Customer[]>([]);
  protected accounts = signal<BankAccount[]>([]);
  protected loading = signal(true);

  protected totalBalance = computed(() => this.accounts().reduce((sum, a) => sum + a.balance, 0));

  protected byCustomer = computed(() =>
    this.customers().map(customer => {
      const owned = this.accounts().filter(a => a.customerId === customer.id);
      return { customer, count: owned.length, total: owned.reduce((sum, a) => sum + a.balance, 0) };
    }),
  );

  ngOnInit(): void {
    forkJoin({ customers: this.customerService.getAll(), accounts: this.accountService.getAll() }).subscribe({
      next: ({ customers, accounts }) => {
        this.customers.set(customers);
        this.accounts.set(accounts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
