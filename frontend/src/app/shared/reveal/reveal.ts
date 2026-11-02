import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Fades and slides an element in the first time it scrolls into view.
 * `[appReveal]="delayMs"` lets a list stagger its items (e.g. `$index * 100`).
 * `revealFrom` picks the direction it travels from: 'up' (default), 'left' or 'right'.
 *
 * The server renders the element fully visible (crawlers and no-JS visitors see everything);
 * the hidden starting state is only applied in the browser, and skipped for "reduce motion".
 * The styles for `.reveal` / `.reveal--in` are in styles.scss.
 */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  /** Delay in milliseconds before this element animates once it is visible. */
  readonly delay = input(0, { alias: 'appReveal' });

  /** Side the element slides in from. */
  readonly from = input<'up' | 'left' | 'right'>('up', { alias: 'revealFrom' });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const el = this.el;
      el.style.transitionDelay = `${this.delay() || 0}ms`;
      el.classList.add('reveal', `reveal--${this.from()}`);

      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          el.classList.add('reveal--in');
          observer.disconnect();
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
      );
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
