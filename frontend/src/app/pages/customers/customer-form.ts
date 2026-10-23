import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../core/customer.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <a class="back" routerLink="/customers">← Clients</a>
    <h1>Nouveau client</h1>

    <form class="card form" [formGroup]="form" (ngSubmit)="submit()">
      <label>
        Nom
        <input formControlName="name" placeholder="ex. Mohamed" />
        @if (form.controls.name.touched && form.controls.name.invalid) {
          <span class="error">Le nom est obligatoire (2 caractères minimum).</span>
        }
      </label>

      <label>
        Email
        <input formControlName="email" type="email" placeholder="ex. med@gmail.com" />
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <span class="error">Adresse email invalide.</span>
        }
      </label>

      <div class="actions">
        <button type="submit" class="btn" [disabled]="saving()">{{ saving() ? 'Enregistrement…' : 'Enregistrer' }}</button>
        <a class="btn secondary" routerLink="/customers">Annuler</a>
      </div>
    </form>
  `,
})
export class CustomerForm {
  private fb = inject(NonNullableFormBuilder);
  private customerService = inject(CustomerService);
  private notifications = inject(NotificationService);
  private router = inject(Router);

  protected saving = signal(false);
  protected form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.customerService.create(this.form.getRawValue()).subscribe({
      next: created => {
        this.notifications.success(`Client ${created.name} créé.`);
        this.router.navigate(['/customers', created.id]);
      },
      error: () => this.saving.set(false),
    });
  }
}
