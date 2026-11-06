import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminUrlPipe } from '../core/admin-url';

/** Heading of every screen: optional "back" link, title, help text, and action buttons (projected content). */
@Component({
  selector: 'app-page-header',
  imports: [RouterLink, MatIconModule, AdminUrlPipe],
  template: `
    @if (back()) {
      <a class="back" [routerLink]="back() | adminUrl"><mat-icon>arrow_back</mat-icon> {{ backLabel() || 'Back' }}</a>
    }
    <div class="head">
      <div class="text">
        <h1>{{ title() }}</h1>
      </div>
      <div class="actions"><ng-content /></div>
    </div>
  `,
  styles: `
    :host { display: block; margin-bottom: 16px; }
    .back { display: inline-flex; align-items: center; gap: 4px; color: #555; text-decoration: none; font-size: 14px; margin-bottom: 4px; min-height: 36px; }
    .back mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
    h1 { margin: 0; font-size: 26px; font-weight: 500; line-height: 1.25; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    @media (max-width: 600px) { h1 { font-size: 22px; } .actions { width: 100%; } }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly help = input('');
  readonly back = input('');
  readonly backLabel = input('');
}
