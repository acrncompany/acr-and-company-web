import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConsultationRequest } from '../../core/models/contact';
import { FormFailure, formFailure } from '../../core/utils/form-error';
import { ConsultationModalService } from '../../core/services/consultation-modal.service';
import { ContactService } from '../../core/services/contact.service';
import { Icon } from '../icon/icon';

/** The "Book a Consultation" dialog. Rendered once in the shell; opened through ConsultationModalService. */
@Component({
  selector: 'app-consultation-modal',
  imports: [ReactiveFormsModule, Icon],
  template: `
    @if (modal.isOpen() && content(); as c) {
      @let t = c.consultation;
      <div class="backdrop" (click)="modal.close()">
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consult-title"
          (click)="$event.stopPropagation()"
        >
          <button type="button" class="dialog__close" [attr.aria-label]="t.closeLabel" (click)="modal.close()">
            <app-icon name="close" [size]="18" />
          </button>
          <h2 class="dialog__title" id="consult-title">{{ t.title }}</h2>
          <p class="dialog__subtitle">{{ t.subtitle }}</p>

          @if (sent()) {
            <p class="form-status" role="status">{{ t.successMessage }}</p>
          } @else {
            <form class="form" [formGroup]="consultation" (ngSubmit)="submit()" novalidate>
              <div class="field">
                <label class="field__label" for="m-name">Full Name</label>
                <input
                  #firstField
                  class="field__control"
                  id="m-name"
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
                <label class="field__label" for="m-phone">Phone</label>
                <input
                  class="field__control"
                  id="m-phone"
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
                <label class="field__label" for="m-service">Service</label>
                <select class="field__control" id="m-service" formControlName="service" [attr.aria-invalid]="invalid('service')">
                  <option value="">Select a service</option>
                  @for (s of c.services; track s) {
                    <option [value]="s">{{ s }}</option>
                  }
                </select>
                @if (invalid('service')) {
                  <p class="field__error">Please choose a service.</p>
                }
              </div>

              <div class="field">
                <label class="field__label" for="m-time">Preferred Time</label>
                <input
                  class="field__control"
                  id="m-time"
                  type="text"
                  formControlName="preferredTime"
                  placeholder="e.g., Weekday mornings"
                />
              </div>
              <div class="hp" aria-hidden="true">
                <label for="m-website">Website</label>
                <input id="m-website" type="text" formControlName="website" tabindex="-1" autocomplete="off" />
              </div>
              @if (failure(); as why) {
                <p class="field__error" role="alert">{{ why === 'too_many' ? t.tooManyMessage : t.errorMessage }}</p>
              }
              <button type="submit" class="btn btn--gold form__submit" [disabled]="sending()">
                {{ sending() ? t.sendingLabel : t.submitLabel }}
              </button>
            </form>
          }
        </div>
      </div>
    }
  `,
  styles: `
    @use 'variables' as *;
    @use 'mixins' as *;

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 200;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 16px;
      overflow-y: auto;
      background: rgba(5, 15, 30, 0.6);

      @include up($bp-md) {
        align-items: center;
      }
    }
    .dialog {
      position: relative;
      width: 100%;
      max-width: 560px;
      margin-block: auto;
      padding: 28px 24px;
      background: $white;
      border-radius: 12px;
      box-shadow: $shadow-lg;

      @include up($bp-sm) {
        padding: 30px;
      }
    }
    .dialog__close {
      position: absolute;
      top: 16px;
      right: 16px;
      display: inline-flex;
      padding: 6px;
      color: $muted;
      background: none;
      border: 0;
      border-radius: 6px;

      &:hover {
        color: $navy;
        background: $surface;
      }
    }
    .dialog__title {
      padding-right: 32px;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.25;
      color: $navy;
    }
    .dialog__subtitle {
      margin-top: 4px;
      font-size: 14px;
      line-height: 1.6;
      color: $muted;
    }
    .form {
      display: grid;
      gap: 18px;
      margin-top: 22px;
    }
    .form__submit {
      width: 100%;

      &:disabled {
        opacity: 0.7;
        cursor: progress;
      }
    }
    .form-status {
      margin-top: 22px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultationModal {
  protected readonly modal = inject(ConsultationModalService);
  private readonly contact = inject(ContactService);
  private readonly doc = inject(DOCUMENT);

  protected readonly content = toSignal(this.contact.getContact());
  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly failure = signal<FormFailure | null>(null);

  private readonly firstField = viewChild<ElementRef<HTMLInputElement>>('firstField');

  protected readonly consultation = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{8,15}$/)]],
    service: ['', Validators.required],
    preferredTime: [''],
    website: [''], // honeypot
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.modal.close();
    };
    this.doc.addEventListener('keydown', onKey);
    destroyRef.onDestroy(() => {
      this.doc.removeEventListener('keydown', onKey);
      this.doc.body.style.overflow = '';
    });

    // Lock page scroll while open, start with a fresh form each time, and focus the first field.
    effect(() => {
      const open = this.modal.isOpen();
      this.doc.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        this.sent.set(false);
        this.failure.set(null);
        this.consultation.reset();
      }
    });
    effect(() => this.firstField()?.nativeElement.focus());
  }

  protected invalid(name: keyof typeof this.consultation.controls): boolean {
    const c = this.consultation.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected submit(): void {
    if (this.consultation.invalid) {
      this.consultation.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    this.failure.set(null);
    const request: ConsultationRequest = this.consultation.getRawValue();
    this.contact.bookConsultation(request).subscribe({
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
