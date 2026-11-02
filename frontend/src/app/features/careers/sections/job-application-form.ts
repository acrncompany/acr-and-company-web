import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApplyFormContent } from '../../../core/models/careers';
import { CareersService } from '../../../core/services/careers.service';
import { FormFailure, formFailure } from '../../../core/utils/form-error';

/** The CV rules, same as the server's (the server checks again: it never trusts this). */
const CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const CV_MAX_BYTES = 5 * 1024 * 1024;

/** "Apply for this position" form on /careers/:slug, with the CV upload. */
@Component({
  selector: 'app-job-application-form',
  imports: [ReactiveFormsModule],
  template: `
    @let a = content();
    <section class="apply" id="apply" aria-labelledby="apply-title">
      <h2 class="apply__title" id="apply-title">{{ a.title }}</h2>
      <p class="apply__subtitle">{{ a.subtitle }}</p>

      @if (sent()) {
        <p class="form-status" role="status">{{ a.successMessage }}</p>
      } @else {
        <form class="form" [formGroup]="application" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label class="field__label" for="a-name">Full Name</label>
            <input
              class="field__control"
              id="a-name"
              type="text"
              formControlName="name"
              autocomplete="name"
              placeholder="Your name"
              [attr.aria-invalid]="invalid('name')"
            />
            @if (invalid('name')) {
              <p class="field__error">Please enter your name.</p>
            }
          </div>

          <div class="field">
            <label class="field__label" for="a-email">Email</label>
            <input
              class="field__control"
              id="a-email"
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="your@email.com"
              [attr.aria-invalid]="invalid('email')"
            />
            @if (invalid('email')) {
              <p class="field__error">Please enter a valid email address.</p>
            }
          </div>

          <div class="field">
            <label class="field__label" for="a-phone">Phone</label>
            <input
              class="field__control"
              id="a-phone"
              type="tel"
              formControlName="phone"
              autocomplete="tel"
              placeholder="+91 XXXXX XXXXX"
              [attr.aria-invalid]="invalid('phone')"
            />
            @if (invalid('phone')) {
              <p class="field__error">Please enter a valid phone number.</p>
            }
          </div>

          <div class="field">
            <label class="field__label" for="a-cv">CV</label>
            <input
              class="field__control"
              id="a-cv"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              (change)="onFile($event)"
              [attr.aria-invalid]="cvProblem() ? true : null"
              aria-describedby="a-cv-hint"
            />
            <p class="hint" id="a-cv-hint">{{ a.cvHint }}</p>
            @if (cvProblem()) {
              <p class="field__error" role="alert">{{ a.cvErrorMessage }}</p>
            }
          </div>

          <div class="field field--wide">
            <label class="field__label" for="a-message">Message (optional)</label>
            <textarea
              class="field__control"
              id="a-message"
              rows="4"
              formControlName="message"
              placeholder="Anything you would like us to know..."
            ></textarea>
          </div>

          <div class="hp" aria-hidden="true">
            <label for="a-website">Website</label>
            <input id="a-website" type="text" formControlName="website" tabindex="-1" autocomplete="off" />
          </div>

          <div class="form__actions">
            @if (failure(); as why) {
              <p class="field__error" role="alert">{{ message(why, a) }}</p>
            }
            <button type="submit" class="btn btn--gold" [disabled]="sending()">
              {{ sending() ? a.sendingLabel : a.submitLabel }}
            </button>
          </div>
        </form>
      }
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .apply {
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px solid $border;
      scroll-margin-top: calc($header-height + 16px);
    }
    .apply__title {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
      color: $navy;

      @include up($bp-md) {
        font-size: 28px;
      }
    }
    .apply__subtitle {
      margin-top: 8px;
      color: $muted;
    }
    .form {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
      margin-top: 24px;

      @include up($bp-sm) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    .field--wide,
    .form__actions {
      @include up($bp-sm) {
        grid-column: 1 / -1;
      }
    }
    .hint {
      margin-top: 4px;
      font-size: 12px;
      color: $muted;
    }
    .btn:disabled {
      opacity: 0.7;
      cursor: progress;
    }
    .form-status {
      margin-top: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobApplicationForm {
  readonly content = input.required<ApplyFormContent>();
  /** The position being applied for (the last part of /careers/<slug>). */
  readonly jobSlug = input.required<string>();

  private readonly careers = inject(CareersService);

  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly failure = signal<FormFailure | null>(null);
  protected readonly cvProblem = signal(false);
  private cv: File | null = null;

  protected readonly application = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{8,15}$/)]],
    message: [''],
    website: [''], // honeypot
  });

  protected invalid(name: 'name' | 'email' | 'phone'): boolean {
    const c = this.application.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected message(why: FormFailure, a: ApplyFormContent): string {
    switch (why) {
      case 'too_many':
        return a.tooManyMessage;
      case 'cv':
        return a.cvErrorMessage;
      case 'closed':
        return a.closedMessage;
      default:
        return a.errorMessage;
    }
  }

  protected onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    const name = file?.name.toLowerCase() ?? '';
    const fine = !!file && file.size > 0 && file.size <= CV_MAX_BYTES && CV_EXTENSIONS.some((ext) => name.endsWith(ext));
    this.cv = fine ? file : null;
    this.cvProblem.set(!!file && !fine);
  }

  protected submit(): void {
    this.failure.set(null);
    if (!this.cv) this.cvProblem.set(true);
    if (this.application.invalid || !this.cv) {
      this.application.markAllAsTouched();
      return;
    }
    const v = this.application.getRawValue();
    const body = new FormData();
    body.append('jobSlug', this.jobSlug());
    body.append('name', v.name);
    body.append('email', v.email);
    body.append('phone', v.phone);
    body.append('message', v.message);
    body.append('website', v.website);
    body.append('cv', this.cv, this.cv.name);

    this.sending.set(true);
    this.careers.apply(body).subscribe({
      next: () => {
        this.sending.set(false);
        this.sent.set(true);
      },
      error: (err) => {
        this.sending.set(false);
        this.failure.set(formFailure(err));
      },
    });
  }
}
