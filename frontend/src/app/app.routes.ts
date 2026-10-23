import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { CustomerList } from './pages/customers/customer-list';
import { CustomerForm } from './pages/customers/customer-form';
import { CustomerDetail } from './pages/customers/customer-detail';
import { AccountList } from './pages/accounts/account-list';
import { AccountForm } from './pages/accounts/account-form';
import { AccountDetail } from './pages/accounts/account-detail';
import { Chat } from './pages/chat/chat';

export const routes: Routes = [
  { path: '', component: Dashboard, title: 'eBank — Tableau de bord' },
  { path: 'customers', component: CustomerList, title: 'eBank — Clients' },
  { path: 'customers/new', component: CustomerForm, title: 'eBank — Nouveau client' },
  { path: 'customers/:id', component: CustomerDetail, title: 'eBank — Client' },
  { path: 'accounts', component: AccountList, title: 'eBank — Comptes' },
  { path: 'accounts/new', component: AccountForm, title: 'eBank — Nouveau compte' },
  { path: 'accounts/:id', component: AccountDetail, title: 'eBank — Compte' },
  { path: 'chat', component: Chat, title: 'eBank — Assistant' },
  { path: '**', redirectTo: '' },
];
