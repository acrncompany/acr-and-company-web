import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { ADMIN_BASE, adminUrl } from '../core/admin-url';
import { AuthService } from '../core/auth.service';
import { messageOf } from '../core/notify.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="wrap">
      <div class="card">
        <div class="brand">
          <img class="brand__mark" src="/assets/images/logo.png" alt="ACR &amp; Company logo" width="96" height="58" />
          <span class="brand__divider" aria-hidden="true"></span>
          <span class="brand__text">
            <span class="brand__name">ACR &amp; Company</span>
            <span class="brand__tag">Chartered Accountants</span>
          </span>
        </div>
        <p class="subtitle">Admin Portal</p>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label class="field">
            <span class="label">Email</span>
            <input class="input" type="email" formControlName="email" autocomplete="username" autofocus
              [class.invalid]="form.controls.email.touched && form.controls.email.invalid" />
            @if (form.controls.email.touched && form.controls.email.hasError('email')) {
              <span class="field-error">Please enter a valid email address.</span>
            }
          </label>
          <label class="field">
            <span class="label">Password</span>
            <span class="input-wrap">
              <input class="input" [type]="show() ? 'text' : 'password'" formControlName="password" autocomplete="current-password"
                [class.invalid]="form.controls.password.touched && form.controls.password.invalid" />
              <button class="toggle" type="button" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Hide password' : 'Show password'">
                <mat-icon>{{ show() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </span>
          </label>
          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }
          <button class="submit" type="submit" [disabled]="busy()">
            @if (busy()) {
              <mat-spinner diameter="22" />
            } @else {
              Sign In
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .wrap { box-sizing: border-box; min-height: 100vh; min-height: 100dvh; display: grid; place-items: center; padding: 16px; background: #f5f7fb; }
    .card { width: 100%; max-width: 480px; padding: 40px; background: var(--acr-white); border: 1px solid var(--acr-border); border-radius: var(--acr-radius-lg); box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12); }
    .brand { display: flex; align-items: center; justify-content: center; gap: 14px; }
    .brand__mark { width: 96px; height: auto; }
    .brand__divider { width: 1px; height: 46px; background: var(--acr-border); }
    .brand__text { display: flex; flex-direction: column; line-height: 1.25; }
    .brand__name { font-size: 21px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--acr-navy); }
    .brand__tag { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--acr-muted); }
    .subtitle { margin: 20px 0 32px; text-align: center; font-size: 17px; color: var(--acr-muted); }
    .field { display: block; margin-bottom: 20px; }
    .label { display: block; margin-bottom: 6px; font-size: 17px; color: var(--acr-foreground); }
    .input-wrap { position: relative; display: block; }
    .input { width: 100%; height: 50px; padding: 0 16px; box-sizing: border-box; font: inherit; font-size: 16px; color: var(--acr-foreground); background: #e8f0fe; border: 1px solid var(--acr-border); border-radius: var(--acr-radius); outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
    .input-wrap .input { padding-right: 48px; }
    .input:focus { border-color: var(--acr-gold); box-shadow: 0 0 0 3px var(--acr-gold-tint); }
    .input.invalid { border-color: var(--acr-danger); }
    .toggle { position: absolute; top: 50%; right: 8px; transform: translateY(-50%); display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--acr-muted); cursor: pointer; }
    .toggle:hover { background: rgba(15, 23, 42, 0.06); }
    .field-error { display: block; margin-top: 6px; font-size: 13px; color: var(--acr-danger); }
    .error { color: var(--acr-danger); margin: 0 0 12px; }
    .submit { display: grid; place-items: center; width: 100%; height: 50px; margin-top: 4px; font: inherit; font-size: 17px; font-weight: 500; color: var(--acr-navy); background: var(--acr-gold); border: 0; border-radius: var(--acr-radius); box-shadow: 0 4px 10px rgba(200, 166, 75, 0.3); cursor: pointer; transition: background 0.15s; }
    .submit:hover:not(:disabled) { background: var(--acr-gold-dark); }
    .submit:disabled { opacity: 0.7; cursor: default; }
    @media (max-width: 480px) {
      .card { padding: 28px 20px; }
      .brand__mark { width: 72px; }
      .brand__name { font-size: 16px; }
      .brand__tag { font-size: 9px; }
    }
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly busy = signal(false);
  readonly show = signal(false);
  readonly error = signal('');

  constructor() {
    this.auth.ensureChecked().then(() => {
      if (this.auth.user()) this.router.navigateByUrl(adminUrl('/'));
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      await this.router.navigateByUrl(returnUrl && returnUrl.startsWith(ADMIN_BASE + '/') && !returnUrl.startsWith('//') ? returnUrl : adminUrl('/'));
    } catch (e) {
      this.error.set(e instanceof HttpErrorResponse && e.status === 401 ? 'The email or password is not correct. Please try again.' : messageOf(e) || 'Could not log in. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }
}
