import { ChangeDetectionStrategy, Component, RESPONSE_INIT, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

/**
 * One placeholder for every page that is not built yet (About, Services, Learning, Careers, Contact).
 * The heading comes from the route's `data.heading`, so there is no hardcoded page content here beyond the notice.
 */
@Component({
  selector: 'app-placeholder-page',
  imports: [RouterLink],
  template: `
    <section class="placeholder container">
      <h1>{{ heading() }}</h1>
      <p>This page is coming soon.</p>
      <a class="btn btn--gold" routerLink="/">Back to home</a>
    </section>
  `,
  styles: `
    .placeholder {
      padding-block: 120px;
      text-align: center;
    }
    h1 {
      font-size: 40px;
      font-weight: 700;
      color: #0a2342;
    }
    p {
      margin: 12px 0 28px;
      color: #5b6b7b;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderPage {
  constructor() {
    // Unknown URLs answer with a real 404 status during SSR (the route sets data.notFound).
    const init = inject(RESPONSE_INIT, { optional: true });
    if (init && inject(ActivatedRoute).snapshot.data['notFound']) init.status = 404;
  }

  protected readonly heading = toSignal(inject(ActivatedRoute).data.pipe(map((d) => d['heading'] as string)));
}
