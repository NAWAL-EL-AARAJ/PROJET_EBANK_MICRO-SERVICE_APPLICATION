import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from './api';
import { BankAccount, NewBankAccount } from './models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  getAll(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(API.accounts);
  }

  getById(id: string): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${API.accounts}/${id}`);
  }

  create(account: NewBankAccount): Observable<BankAccount> {
    return this.http.post<BankAccount>(API.accounts, account);
  }
}
