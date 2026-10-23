import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AccountService } from '../../core/account.service';
import { CustomerService } from '../../core/customer.service';
import { ACCOUNT_TYPES, BankAccount, Customer } from '../../core/models';
import { AccountTypePipe } from '../../shared/account-type.pipe';

@Component({
  selector: 'app-account-list',
  imports: [RouterLink, DecimalPipe, DatePipe, AccountTypePipe],
  template: `
    <div class="page-header">
      <h1>Comptes bancaires</h1>
      <a class="btn" routerLink="/accounts/new">Ouvrir un compte</a>
    </div>

    <div class="filters">
      <select (change)="typeFilter.set($any($event.target).value)">
        <option value="">Tous les types</option>
        @for (t of types; track t.value) {
          <option [value]="t.value">{{ t.label }}</option>
        }
      </select>
      <select (change)="customerFilter.set($any($event.target).value)">
        <option value="">Tous les clients</option>
        @for (c of customers(); track c.id) {
          <option [value]="c.id">{{ c.name }}</option>
        }
      </select>
      <span class="muted">{{ filtered().length }} compte(s) — {{ filteredTotal() | number: '1.2-2' }} MAD</span>
    </div>

    <div class="card">
      @if (loading()) {
        <p class="muted">Chargement…</p>
      } @else {
        <table>
          <thead>
            <tr><th>Compte</th><th>Client</th><th>Type</th><th>Créé le</th><th class="num">Solde (MAD)</th></tr>
          </thead>
          <tbody>
            @for (a of filtered(); track a.id) {
              <tr>
                <td><a class="mono" [routerLink]="['/accounts', a.id]">{{ a.id.slice(0, 8) }}…</a></td>
                <td><a [routerLink]="['/customers', a.customerId]">{{ customerName(a.customerId) }}</a></td>
                <td><span class="badge" [class.saving]="a.type === 'saving-account'">{{ a.type | accountType }}</span></td>
                <td>{{ a.createdAt | date: 'short' }}</td>
                <td class="num">{{ a.balance | number: '1.2-2' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="muted">Aucun compte.</td></tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class AccountList implements OnInit {
  private accountService = inject(AccountService);
  private customerService = inject(CustomerService);

  protected readonly types = ACCOUNT_TYPES;
  protected accounts = signal<BankAccount[]>([]);
  protected customers = signal<Customer[]>([]);
  protected loading = signal(true);
  protected typeFilter = signal('');
  protected customerFilter = signal('');

  protected filtered = computed(() =>
    this.accounts().filter(a =>
      (!this.typeFilter() || a.type === this.typeFilter()) &&
      (!this.customerFilter() || a.customerId === Number(this.customerFilter())),
    ),
  );
  protected filteredTotal = computed(() => this.filtered().reduce((sum, a) => sum + a.balance, 0));

  ngOnInit(): void {
    // GET /accounts ne renvoie pas le client : on récupère les noms via customer-service
    forkJoin({ accounts: this.accountService.getAll(), customers: this.customerService.getAll() }).subscribe({
      next: ({ accounts, customers }) => {
        this.accounts.set(accounts);
        this.customers.set(customers);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected customerName(id: number): string {
    return this.customers().find(c => c.id === id)?.name ?? `Client ${id}`;
  }
}
