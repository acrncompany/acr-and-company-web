import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactFormContent, EnquiryRequest } from '../../../core/models/contact';
import { FormFailure, formFailure } from '../../../core/utils/form-error';
import { ContactService } from '../../../core/services/contact.service';
import { Reveal } from '../../../shared/reveal/reveal';

/** The "Send Us a Message" form. */
@Component({
  selector: 'app-contact-form-section',
  imports: [ReactiveFormsModule, Reveal],
  template: `
    @let f = form();
    <section [appReveal]="0" aria-labelledby="form-title">
      <h2 class="title" id="form-title">{{ f.title }}</h2>

      @if (sent()) {
        <p class="form-status" role="status">{{ f.successMessage }}</p>
      } @else {
        <form class="form" [formGroup]="enquiry" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label class="field__label" for="c-name">Name</label>
            <input
              class="field__control"
              id="c-name"
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
            <label class="field__label" for="c-email">Email</label>
            <input
              class="field__control"
              id="c-email"
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
            <label class="field__label" for="c-phone">Phone</label>
            <input
              class="field__control"
              id="c-phone"
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
            <label class="field__label" for="c-service">Service Interested In</label>
            <select class="field__control" id="c-service" formControlName="service">
              <option value="">Select service</option>
              @for (s of services(); track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </div>

          <div class="field field--wide">
            <label class="field__label" for="c-message">Message</label>
            <textarea
              class="field__control"
              id="c-message"
              rows="5"
              formControlName="message"
              placeholder="Tell us about your requirements..."
              [attr.aria-invalid]="invalid('message')"
            ></textarea>
            @if (invalid('message')) {
              <p class="field__error">Please tell us how we can help.</p>
            }
          </div>

          <div class="hp" aria-hidden="true">
            <label for="c-website">Website</label>
            <input id="c-website" type="text" formControlName="website" tabindex="-1" autocomplete="off" />
          </div>

          <div class="form__actions">
            @if (failure(); as why) {
              <p class="field__error" role="alert">{{ why === 'too_many' ? f.tooManyMessage : f.errorMessage }}</p>
            }
            <button type="submit" class="btn btn--gold" [disabled]="sending()">
              {{ sending() ? f.sendingLabel : f.submitLabel }}
            </button>
          </div>
        </form>
      }
    </section>
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .title {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
      color: $navy;

      @include up($bp-md) {
        font-size: 28px;
      }
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
export class ContactFormSection {
  readonly form = input.required<ContactFormContent>();
  readonly services = input.required<string[]>();

  private readonly contact = inject(ContactService);

  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly failure = signal<FormFailure | null>(null);

  protected readonly enquiry = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{8,15}$/)]],
    service: [''],
    message: ['', Validators.required],
    website: [''], // honeypot
  });

  /** Shows the error for a field after it was touched or the form was submitted. */
  protected invalid(name: keyof typeof this.enquiry.controls): boolean {
    const c = this.enquiry.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected submit(): void {
    if (this.enquiry.invalid) {
      this.enquiry.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    this.failure.set(null);
    const request: EnquiryRequest = this.enquiry.getRawValue();
    this.contact.sendEnquiry(request).subscribe({
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
