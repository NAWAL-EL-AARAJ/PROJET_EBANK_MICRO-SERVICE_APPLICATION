import { Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../core/account.service';
import { CustomerService } from '../../core/customer.service';
import { ACCOUNT_TYPES, AccountType, Customer } from '../../core/models';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-account-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <a class="back" routerLink="/accounts">← Comptes</a>
    <h1>Ouvrir un compte</h1>

    <form class="card form" [formGroup]="form" (ngSubmit)="submit()">
      <label>
        Client
        <select formControlName="customerId">
          <option [ngValue]="0" disabled>Choisir un client…</option>
          @for (c of customers(); track c.id) {
            <option [ngValue]="c.id">{{ c.name }} ({{ c.email }})</option>
          }
        </select>
        @if (form.controls.customerId.touched && form.controls.customerId.invalid) {
          <span class="error">Choisir un client.</span>
        }
      </label>

      <fieldset>
        <legend>Type de compte</legend>
        @for (t of types; track t.value) {
          <label class="radio">
            <input type="radio" formControlName="type" [value]="t.value" /> {{ t.label }}
          </label>
        }
      </fieldset>

      <label>
        Solde initial (MAD)
        <input formControlName="balance" type="number" min="0" step="0.01" />
        @if (form.controls.balance.touched && form.controls.balance.invalid) {
          <span class="error">Le solde doit être positif ou nul.</span>
        }
      </label>

      <div class="actions">
        <button type="submit" class="btn" [disabled]="saving()">{{ saving() ? 'Création…' : 'Créer le compte' }}</button>
        <a class="btn secondary" routerLink="/accounts">Annuler</a>
      </div>
    </form>
  `,
})
export class AccountForm implements OnInit {
  // ?customerId=… depuis la fiche client
  readonly customerId = input<string>();

  private fb = inject(NonNullableFormBuilder);
  private accountService = inject(AccountService);
  private customerService = inject(CustomerService);
  private notifications = inject(NotificationService);
  private router = inject(Router);

  protected readonly types = ACCOUNT_TYPES;
  protected customers = signal<Customer[]>([]);
  protected saving = signal(false);
  protected form = this.fb.group({
    customerId: [0, Validators.min(1)],
    type: ['Current-account' as AccountType, Validators.required],
    balance: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    const preselected = Number(this.customerId());
    if (preselected) {
      this.form.controls.customerId.setValue(preselected);
    }
    this.customerService.getAll().subscribe(list => this.customers.set(list));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.accountService.create(this.form.getRawValue()).subscribe({
      next: created => {
        this.notifications.success('Compte créé.');
        this.router.navigate(['/accounts', created.id]);
      },
      error: () => this.saving.set(false),
    });
  }
}
