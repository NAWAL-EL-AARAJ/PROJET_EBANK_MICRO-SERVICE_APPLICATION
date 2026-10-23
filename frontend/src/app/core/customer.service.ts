import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from './api';
import { Customer, NewCustomer } from './models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(API.customers);
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${API.customers}/${id}`);
  }

  create(customer: NewCustomer): Observable<Customer> {
    return this.http.post<Customer>(API.customers, customer);
  }
}
