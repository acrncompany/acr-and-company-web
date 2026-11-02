import { Injectable, signal } from '@angular/core';

/** Opens and closes the Book Consultation modal (rendered once, in the shell). */
@Injectable({ providedIn: 'root' })
export class ConsultationModalService {
  private readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }
}
