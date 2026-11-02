import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shows rich text written in the admin (HTML). The API sanitises it on save and again when it is sent, and Angular
 * sanitises [innerHTML] a third time. The styles reach into the injected HTML with ::ng-deep because Angular does not
 * add its scoping attribute to markup inserted this way.
 */
@Component({
  selector: 'app-rich-text',
  template: `<div class="rich" [innerHTML]="html()"></div>`,
  styles: `
    @use 'variables' as *;

    :host ::ng-deep .rich {
      font-size: 17px;
      line-height: 1.85;
      color: $muted;

      > :first-child {
        margin-top: 0;
      }
      p {
        margin-top: 12px;
      }
      h2 {
        margin-top: 32px;
        font-size: 20px;
        font-weight: 600;
        line-height: 1.4;
        color: $navy;
      }
      h3,
      h4 {
        margin-top: 24px;
        font-size: 17px;
        font-weight: 600;
        line-height: 1.4;
        color: $navy;
      }
      ul,
      ol {
        margin-top: 12px;
        padding-left: 22px;
      }
      ul {
        list-style: disc;
      }
      ol {
        list-style: decimal;
      }
      li::marker {
        color: $gold-dark;
      }
      a {
        color: $gold-dark;
        text-decoration: underline;
      }
      blockquote {
        margin: 20px 0 0;
        padding-left: 16px;
        border-left: 3px solid $gold;
      }
      img {
        max-width: 100%;
        height: auto;
        margin-top: 16px;
        border-radius: 8px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichText {
  readonly html = input.required<string>();
}
