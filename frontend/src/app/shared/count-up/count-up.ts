import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';

/**
 * Shows a stat like "2,000+" and counts it up from 0 when the page opens in the browser.
 * The server renders the final value (so crawlers and no-JS visitors see the real number);
 * the animation is skipped for visitors who prefer reduced motion.
 */
@Component({
  selector: 'app-count-up',
  template: `<span aria-hidden="true">{{ text() }}</span><span class="sr-only">{{ value() }}</span>`,
  styles: `
    @use 'mixins' as *;

    :host {
      font-variant-numeric: tabular-nums;
    }
    .sr-only {
      @include visually-hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountUp {
  /** The final text, e.g. "20+", "2,000+", "500+". The number inside it is what counts up. */
  readonly value = input.required<string>();
  /** Animation length in milliseconds. */
  readonly duration = input(2000);

  private readonly current = signal<number | null>(null);

  /** Splits "2,000+" into prefix "", number 2000, suffix "+", and remembers whether it uses thousands separators. */
  private readonly parts = computed(() => {
    const m = /^(\D*)([\d,]+)(.*)$/.exec(this.value());
    if (!m) return null;
    return { prefix: m[1], target: Number(m[2].replace(/,/g, '')), grouped: m[2].includes(','), suffix: m[3] };
  });

  protected readonly text = computed(() => {
    const p = this.parts();
    if (!p) return this.value();
    const n = this.current() ?? p.target;
    const digits = p.grouped ? Math.round(n).toLocaleString('en-US') : String(Math.round(n));
    return p.prefix + digits + p.suffix;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const p = this.parts();
      if (!p || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      let frame = 0;
      destroyRef.onDestroy(() => cancelAnimationFrame(frame));
      this.current.set(0);
      const start = performance.now();
      const step = (now: number) => {
        // The frame timestamp can be slightly earlier than `start`, so clamp to 0 (no negative numbers).
        const t = Math.min(Math.max((now - start) / this.duration(), 0), 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out: fast at first, settles on the final number
        this.current.set(p.target * eased);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });
  }
}
