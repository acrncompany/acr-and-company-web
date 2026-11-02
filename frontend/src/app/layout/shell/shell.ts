import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConsultationModalService } from '../../core/services/consultation-modal.service';
import { ConsultationModal } from '../../shared/consultation-modal/consultation-modal';
import { FloatingActions } from '../floating-actions/floating-actions';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

/** Shared layout: header, routed page, footer, floating buttons. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Footer, FloatingActions, ConsultationModal],
  template: `
    <a class="skip-link" href="#main">Skip to content</a>
    <app-header />
    <main id="main">
      <router-outlet />
    </main>
    <app-footer />
    <app-floating-actions />
    <!-- Loaded when the browser is idle (or at once if it is opened first), so the form code is not part of the initial download. -->
    @defer (on idle; when modal.isOpen()) {
      <app-consultation-modal />
    }
  `,
  styles: `
    .skip-link {
      position: absolute;
      left: 8px;
      top: -48px;
      z-index: 100;
      padding: 8px 14px;
      color: #fff;
      background: #0a2342;
      border-radius: 6px;
    }
    .skip-link:focus {
      top: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  protected readonly modal = inject(ConsultationModalService);
}
