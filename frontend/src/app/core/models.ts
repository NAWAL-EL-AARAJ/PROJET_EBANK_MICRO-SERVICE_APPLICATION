// Modèles alignés sur les entités Java (customer-service et ebank-service)

export interface Customer {
  id: number;
  name: string;
  email: string;
}

export type AccountType = 'Current-account' | 'saving-account';

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'Current-account', label: 'Compte courant' },
  { value: 'saving-account', label: 'Compte épargne' },
];

export interface BankAccount {
  id: string;
  createdAt: string;
  balance: number;
  type: AccountType;
  customerId: number;
  // rempli uniquement par GET /accounts/{id} (appel Feign vers customer-service)
  customer: Customer | null;
}

export type NewCustomer = Omit<Customer, 'id'>;
export type NewBankAccount = Pick<BankAccount, 'balance' | 'type' | 'customerId'>;

export interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}
