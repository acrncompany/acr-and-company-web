import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SiteService } from '../../core/services/site.service';
import { whatsappUrl } from '../../core/utils/whatsapp';
import { Icon } from '../../shared/icon/icon';

/** WhatsApp chat button (always visible) and a back-to-top button (after scrolling down). */
@Component({
  selector: 'app-floating-actions',
  imports: [Icon],
  template: `
    @if (site(); as s) {
      <div class="floating">
        @if (showTop()) {
          <button
            type="button"
            class="floating__btn floating__btn--top"
            aria-label="Back to top"
            (click)="toTop()"
          >
            <app-icon name="arrow-up" [size]="22" />
          </button>
        }
        <!-- Hidden until a real number is saved in the admin (whatsappUrl() returns null for the seeded placeholder). -->
        @if (whatsapp(); as url) {
          <a
            class="floating__btn floating__btn--chat"
            [href]="url"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
          >
            <app-icon name="chat" [size]="28" />
          </a>
        }
      </div>
    }
  `,
  styleUrl: './floating-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingActions {
  protected readonly site = toSignal(inject(SiteService).getSite());
  protected readonly whatsapp = computed(() => {
    const c = this.site()?.contact;
    return c ? whatsappUrl(c.whatsappNumber, c.whatsappMessage) : null;
  });
  protected readonly showTop = signal(false);

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.showTop.set(window.scrollY > 400);
  }

  protected toTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
