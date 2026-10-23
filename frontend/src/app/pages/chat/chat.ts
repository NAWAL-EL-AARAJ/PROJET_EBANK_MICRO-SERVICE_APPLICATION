import { Component, ElementRef, afterRenderEffect, inject, signal, viewChild } from '@angular/core';
import { marked } from 'marked';
import { ChatService } from '../../core/chat.service';

@Component({
  selector: 'app-chat',
  template: `
    <div class="page-header">
      <h1>Assistant eBank</h1>
      <button class="btn secondary" (click)="chat.reset()" [disabled]="chat.pending()">Nouvelle conversation</button>
    </div>
    <p class="muted">L'agent IA interroge customer-service et ebank-service via MCP. Il garde le fil de la conversation.</p>

    <div class="card chat">
      <div class="messages" #messages>
        @for (m of chat.messages(); track $index) {
          @if (m.from === 'user') {
            <div class="msg user">{{ m.text }}</div>
          } @else {
            <!-- [innerHTML] est assaini par Angular -->
            <div class="msg bot" [innerHTML]="toHtml(m.text)"></div>
          }
        } @empty {
          <div class="suggestions">
            @for (s of suggestions; track s) {
              <button class="chip" (click)="send(s)">{{ s }}</button>
            }
          </div>
        }
        @if (chat.pending()) {
          <div class="msg bot muted">L'agent réfléchit…</div>
        }
      </div>

      <form class="composer" (submit)="$event.preventDefault(); send(question())">
        <input placeholder="Posez une question sur les clients ou les comptes…"
               [value]="question()" (input)="question.set($any($event.target).value)" [disabled]="chat.pending()" />
        <button class="btn" type="submit" [disabled]="chat.pending() || !question().trim()">Envoyer</button>
      </form>
    </div>
  `,
})
export class Chat {
  protected chat = inject(ChatService);
  protected question = signal('');
  private messagesEl = viewChild.required<ElementRef<HTMLElement>>('messages');

  protected readonly suggestions = [
    'Donne moi la liste des clients',
    'Quels sont les comptes du client Mohamed ?',
    'Quel client a le solde total le plus élevé ?',
  ];

  constructor() {
    // fait défiler vers le dernier message
    afterRenderEffect(() => {
      this.chat.messages();
      this.chat.pending();
      const el = this.messagesEl().nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }

  send(text: string): void {
    const question = text.trim();
    if (!question || this.chat.pending()) {
      return;
    }
    this.question.set('');
    this.chat.ask(question).subscribe({ error: () => {} });
  }

  protected toHtml(markdown: string): string {
    return marked.parse(markdown, { async: false });
  }
}
