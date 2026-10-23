import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { API } from './api';
import { ChatMessage } from './models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  // identifiant de conversation : le backend garde la mémoire par chatId
  private chatId = `web-${crypto.randomUUID()}`;

  // conservé dans le service pour retrouver la conversation en changeant de page
  readonly messages = signal<ChatMessage[]>([]);
  readonly pending = signal(false);

  ask(question: string): Observable<string> {
    this.messages.update(m => [...m, { from: 'user', text: question }]);
    this.pending.set(true);
    const params = new HttpParams().set('question', question).set('chatId', this.chatId);
    return this.http.get(API.chat, { params, responseType: 'text' }).pipe(
      tap(answer => this.messages.update(m => [...m, { from: 'bot', text: answer }])),
      finalize(() => this.pending.set(false)),
    );
  }

  reset(): void {
    this.chatId = `web-${crypto.randomUUID()}`;
    this.messages.set([]);
  }
}
