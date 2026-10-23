import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../core/account.service';
import { BankAccount } from '../../core/models';
import { AccountTypePipe } from '../../shared/account-type.pipe';

@Component({
  selector: 'app-account-detail',
  imports: [RouterLink, DecimalPipe, DatePipe, AccountTypePipe],
  template: `
    <a class="back" routerLink="/accounts">← Comptes</a>

    @if (account(); as a) {
      <h1>Compte <span class="mono">{{ a.id }}</span></h1>

      <div class="card details">
        <div><span class="muted">Type</span>
          <span class="badge" [class.saving]="a.type === 'saving-account'">{{ a.type | accountType }}</span></div>
        <div><span class="muted">Solde</span><strong>{{ a.balance | number: '1.2-2' }} MAD</strong></div>
        <div><span class="muted">Créé le</span>{{ a.createdAt | date: 'medium' }}</div>
      </div>

      <h2>Titulaire</h2>
      @if (customerUnavailable()) {
        <div class="card warning">
          customer-service est indisponible : le circuit breaker a renvoyé le client par défaut
          (client n°{{ a.customerId }}).
        </div>
      } @else if (a.customer; as c) {
        <div class="card details">
          <div><span class="muted">Nom</span><a [routerLink]="['/customers', c.id]">{{ c.name }}</a></div>
          <div><span class="muted">Email</span>{{ c.email }}</div>
        </div>
      }
    } @else if (loading()) {
      <p class="muted">Chargement…</p>
    } @else {
      <p class="muted">Compte introuvable.</p>
    }
  `,
})
export class AccountDetail implements OnInit {
  readonly id = input.required<string>();

  private accountService = inject(AccountService);

  protected account = signal<BankAccount | null>(null);
  protected loading = signal(true);

  // valeurs renvoyées par CustomerRestClientFallback, ou client absent
  protected customerUnavailable = computed(() => {
    const c = this.account()?.customer;
    return !c || c.name === 'NoName';
  });

  ngOnInit(): void {
    this.accountService.getById(this.id()).subscribe({
      next: account => {
        this.account.set(account);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
