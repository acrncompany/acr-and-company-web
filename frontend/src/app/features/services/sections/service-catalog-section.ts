import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ConsultationModalService } from '../../../core/services/consultation-modal.service';
import { ServiceGroup } from '../../../core/models/services';
import { Icon } from '../../../shared/icon/icon';
import { Reveal } from '../../../shared/reveal/reveal';

/** Filter tabs plus one block of cards per service group. The first tab (null) shows every group. */
@Component({
  selector: 'app-service-catalog-section',
  imports: [Icon, Reveal],
  template: `
    <section class="catalog">
      <div class="container">
        <div class="tabs" role="group" aria-label="Filter services by category" [appReveal]="0">
          <button
            type="button"
            class="tab"
            [class.tab--active]="selected() === null"
            [attr.aria-pressed]="selected() === null"
            (click)="selected.set(null)"
          >
            {{ allLabel() }}
          </button>
          @for (g of groups(); track g.title) {
            <button
              type="button"
              class="tab"
              [class.tab--active]="selected() === g.title"
              [attr.aria-pressed]="selected() === g.title"
              (click)="selected.set(g.title)"
            >
              {{ g.title }}
            </button>
          }
        </div>

        @for (g of visibleGroups(); track g.title) {
          <section class="group" [attr.aria-labelledby]="'group-' + $index">
            <h2 class="group__title" [id]="'group-' + $index" [appReveal]="0">
              <span class="group__icon"><app-icon [name]="g.icon" [size]="28" /></span>
              {{ g.title }}
            </h2>
            <ul class="group__grid">
              @for (item of g.items; track item.title; let i = $index) {
                <li [appReveal]="(i % 3) * 100">
                  <div class="card">
                    <h3 class="card__title">{{ item.title }}</h3>
                    <p class="card__text">{{ item.description }}</p>
                    <button type="button" class="card__link" (click)="modal.open()">
                      Get Started <app-icon name="chevron-right" [size]="14" />
                    </button>
                  </div>
                </li>
              }
            </ul>
          </section>
        }
      </div>
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .catalog {
      padding-block: 40px $section-y-sm;
      background: $white;

      @include up($bp-md) {
        padding-block: 64px $section-y-sm;
      }
    }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      @include up($bp-md) {
        gap: 10px;
      }
    }
    .tab {
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.2;
      color: $muted;
      background: $surface;
      border: 0;
      border-radius: 999px;
      transition:
        background-color 0.2s,
        color 0.2s;

      @include up($bp-md) {
        padding: 12px 20px;
        font-size: 15px;
      }

      &:hover {
        color: $navy;
        background: hsl(214 32% 91%);
      }
    }
    .tab--active,
    .tab--active:hover {
      color: $white;
      background: $navy;
    }

    .group {
      margin-top: 48px;

      @include up($bp-md) {
        margin-top: 56px;
      }
    }
    .group__title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
      color: $navy;

      @include up($bp-md) {
        font-size: 28px;
      }
    }
    .group__icon {
      display: inline-flex;
      color: $gold;
    }
    .group__grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 14px;
      margin-top: 24px;

      @include up($bp-sm) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      @include up($bp-lg) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    // The <li> only carries the scroll reveal; the hover effect lives on the inner card so the two transitions never override each other.
    .card {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 18px 20px;
      background: $white;
      border: 1px solid $border;
      border-radius: 12px;
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;

      &:hover {
        transform: translateY(-3px);
        border-color: hsl(44 53% 54% / 0.5);
        box-shadow: $shadow-md;
      }
    }
    .card__title {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.35;
      color: $navy;
    }
    .card__text {
      margin-top: 6px;
      font-size: 13px;
      line-height: 1.6;
      color: $muted;
    }
    .card__link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      align-self: flex-start;
      margin-top: auto;
      padding-top: 10px;
      background: none;
      border: 0;
      cursor: pointer;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      color: $gold-dark;

      &:hover {
        color: $navy;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCatalogSection {
  protected readonly modal = inject(ConsultationModalService);
  readonly groups = input.required<ServiceGroup[]>();
  readonly allLabel = input.required<string>();

  /** Title of the selected group, or null for "all". */
  protected readonly selected = signal<string | null>(null);

  protected readonly visibleGroups = computed(() => {
    const title = this.selected();
    return title === null ? this.groups() : this.groups().filter((g) => g.title === title);
  });
}
