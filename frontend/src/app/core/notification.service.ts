import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  kind: 'error' | 'success';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly items = signal<Notification[]>([]);
  private nextId = 0;

  error(text: string): void {
    this.push('error', text);
  }

  success(text: string): void {
    this.push('success', text);
  }

  dismiss(id: number): void {
    this.items.update(list => list.filter(n => n.id !== id));
  }

  private push(kind: Notification['kind'], text: string): void {
    const id = ++this.nextId;
    this.items.update(list => [...list, { id, kind, text }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
