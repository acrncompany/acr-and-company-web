import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { ConsultationModalService } from '../../core/services/consultation-modal.service';
import { NavService } from '../../core/services/nav.service';
import { SiteService } from '../../core/services/site.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly router = inject(Router);
  private readonly consultationModal = inject(ConsultationModalService);

  protected readonly nav = toSignal(inject(NavService).getNav());
  protected readonly site = toSignal(inject(SiteService).getSite());

  protected readonly scrolled = signal(false);
  protected readonly megaOpen = signal(false);
  protected readonly mobileOpen = signal(false);
  /** Which category is expanded in the mobile accordion (-1 = none). */
  protected readonly mobileCategory = signal(-1);
  protected readonly mobileServicesOpen = signal(false);

  constructor() {
    // Close every menu after navigating.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.closeAll());
  }

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  @HostListener('document:keydown.escape')
  protected closeAll(): void {
    this.megaOpen.set(false);
    this.mobileOpen.set(false);
  }

  @HostListener('window:resize')
  protected onResize(): void {
    if (window.innerWidth >= 1024) this.mobileOpen.set(false);
  }

  /** The header button opens the Book Consultation dialog instead of navigating. */
  protected openConsultation(): void {
    this.closeAll();
    this.consultationModal.open();
  }

  protected openMega(): void {
    this.megaOpen.set(true);
  }

  protected closeMega(): void {
    this.megaOpen.set(false);
  }

  protected toggleMega(): void {
    this.megaOpen.update((v) => !v);
  }

  protected toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  protected toggleMobileCategory(i: number): void {
    this.mobileCategory.update((c) => (c === i ? -1 : i));
  }
}
