import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { adminUrl } from './admin-url';
import { Api } from './api.service';
import { NotifyService } from './notify.service';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

/** Knows who is logged in. The cookie itself is httpOnly (invisible to JavaScript), so we ask the server via /auth/me. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);

  readonly user = signal<AdminUser | null>(null);
  private checked: Promise<void> | null = null;

  constructor() {
    this.api.onError = (e, url) => this.onHttpError(e, url);
  }

  /** If the session expires while working, go to the login page (and say why). Network failures get a clear message. */
  private onHttpError(e: HttpErrorResponse, url: string) {
    const isLogin = url.endsWith('/auth/login');
    if (e.status === 401 && !isLogin) {
      if (this.user()) {
        this.user.set(null);
        this.notify.error('Your session has expired. Please log in again.');
        this.router.navigate([adminUrl('/login')], { queryParams: { returnUrl: this.router.url } });
      }
    } else if (e.status === 0) {
      this.notify.error('Cannot reach the server. Please check your internet connection and try again.');
    }
  }

  /** Called once on startup (by the route guard). */
  ensureChecked(): Promise<void> {
    this.checked ??= firstValueFrom(this.api.get<{ admin: AdminUser }>('/auth/me'))
      .then((r) => this.user.set(r.admin))
      .catch(() => this.user.set(null));
    return this.checked;
  }

  async login(email: string, password: string) {
    const r = await firstValueFrom(this.api.post<{ admin: AdminUser }>('/auth/login', { email, password }));
    this.user.set(r.admin);
  }

  async logout() {
    try {
      await firstValueFrom(this.api.post('/auth/logout'));
    } finally {
      this.user.set(null);
      await this.router.navigate([adminUrl('/login')]);
    }
  }
}
