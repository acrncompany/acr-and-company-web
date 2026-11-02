import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONS, IconName, Shape } from './icons';

export type { IconName };

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    @for (s of shapes(); track $index) {
      @switch (s.t) {
        @case ('path') {
          <svg:path [attr.d]="s.d" />
        }
        @case ('circle') {
          <svg:circle [attr.cx]="s.cx" [attr.cy]="s.cy" [attr.r]="s.r" />
        }
        @case ('rect') {
          <svg:rect [attr.x]="s.x" [attr.y]="s.y" [attr.width]="s.w" [attr.height]="s.h" [attr.rx]="s.rx" />
        }
      }
    }
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  // Icon names now come from the admin: an unknown name draws nothing instead of breaking the page.
  protected readonly shapes = computed<Shape[]>(() => (ICONS as Record<string, Shape[]>)[this.name()] ?? []);
}
