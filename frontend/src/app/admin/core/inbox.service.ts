import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Api } from './api.service';

export interface InboxCounts {
  contact: number;
  consultation: number;
  contactUnread: number;
  consultationUnread: number;
  messages: number;
  messagesUnread: number;
  applications: number;
  applicationsUnread: number;
}

export interface ContactMessage {
  id: number;
  type: 'CONTACT' | 'CONSULTATION';
  name: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  message: string | null;
  preferredTime: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Application {
  id: number;
  jobId: number | null;
  jobTitle: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  cvOriginalName: string;
  isRead: boolean;
  createdAt: string;
}

export interface JobFilter {
  jobId: number | null;
  title: string;
  total: number;
  unread: number;
}

export interface Page<T> {
  total: number;
  page: number;
  limit: number;
  items: T[];
}

/** The unread numbers shown on the sidebar and the dashboard. Screens call refresh() after they read or delete something. */
@Injectable({ providedIn: 'root' })
export class InboxService {
  private readonly api = inject(Api);

  readonly counts = signal<InboxCounts | null>(null);
  readonly unreadMessages = computed(() => this.counts()?.messagesUnread ?? 0);
  readonly unreadApplications = computed(() => this.counts()?.applicationsUnread ?? 0);

  async refresh(): Promise<void> {
    try {
      this.counts.set(await firstValueFrom(this.api.get<InboxCounts>('/inbox/counts')));
    } catch {
      // The badges are a convenience: a failed refresh must not disturb the screen (Api already reports a lost session).
    }
  }
}
