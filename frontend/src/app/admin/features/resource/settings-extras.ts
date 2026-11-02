import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../core/api.service';
import { NotifyService } from '../../core/notify.service';
import { whatsappUrl } from '../../../core/utils/whatsapp';

/** Tools shown under the Settings form: a WhatsApp test link and the browser-icon (favicon) buttons. */
@Component({
  selector: 'app-settings-extras',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>WhatsApp button</mat-card-title>
        <mat-card-subtitle>What visitors will see, based on the number and message above.</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        @if (link(); as url) {
          <p class="ok"><mat-icon>check_circle</mat-icon><span>The green WhatsApp button is <strong>shown</strong> on the website.</span></p>
          <a mat-stroked-button [href]="url" target="_blank" rel="noopener"><mat-icon>open_in_new</mat-icon> Test it: open WhatsApp with this message</a>
        } @else {
          <p class="warn"><mat-icon>visibility_off</mat-icon><span>The green WhatsApp button is <strong>hidden</strong> because no valid number is set. Type the number with its country code (digits only), then save.</span></p>
        }
      </mat-card-content>
    </mat-card>

    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Browser icon (favicon)</mat-card-title>
        <mat-card-subtitle>The tiny picture on browser tabs, bookmarks and phone home screens.</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="fav">
          @if (faviconId()) {
            <img class="fav__img" [src]="'/favicon-32x32.png?v=' + version()" width="32" height="32" alt="Current browser icon" />
            <span>An icon is set. It was created in all the sizes browsers and phones need.</span>
          } @else {
            <span class="warn nofav"><mat-icon>info</mat-icon> No browser icon yet.</span>
          }
        </div>
        <div class="buttons">
          <button mat-flat-button type="button" (click)="fromLogo()" [disabled]="busy() || logoUnsaved()">
            @if (busy()) { <mat-spinner diameter="20" /> } @else { <mat-icon>auto_awesome</mat-icon> }
            Create the browser icon from my logo
          </button>
          @if (faviconId()) {
            <button mat-stroked-button type="button" (click)="regenerate()" [disabled]="busy()"><mat-icon>refresh</mat-icon> Rebuild the icon files</button>
          }
        </div>
        @if (logoUnsaved()) {
          <p class="hint">You changed the logo: save the settings first, then create the icon.</p>
        } @else {
          <p class="hint">Uses the logo chosen above. To use a different picture, choose it in "Browser icon (favicon)" above and save.</p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    mat-card { margin-top: 16px; }
    mat-card-content { padding-top: 16px; }
    p { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 12px; }
    .ok { color: var(--acr-success); }
    .warn { color: #8a5a00; }
    .fav { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
    .fav__img { border: 1px solid var(--acr-border); border-radius: 6px; background: #fff; padding: 4px; }
    .buttons { display: flex; gap: 10px; flex-wrap: wrap; }
    .hint { margin: 12px 0 0; font-size: 13px; color: var(--acr-muted); }
  `,
})
export class SettingsExtras {
  readonly form = input.required<FormGroup>();
  /** Current form values (a signal in the parent, so this panel updates while typing). */
  readonly values = input.required<Record<string, any>>();
  /** Emits the settings row after the icon was (re)created, so the form can show the new icon. */
  readonly changed = output<any>();

  private readonly api = inject(Api);
  private readonly notify = inject(NotifyService);
  readonly busy = signal(false);
  readonly stamp = signal(Date.now());

  readonly link = computed(() => whatsappUrl(this.values()['whatsappNumber'], this.values()['whatsappMessage']));
  readonly faviconId = computed(() => this.values()['faviconId'] as number | null);
  readonly version = computed(() => `${this.faviconId()}-${this.stamp()}`);
  readonly logoUnsaved = computed(() => {
    this.values(); // re-evaluate while typing
    return !!this.form().controls['logoId']?.dirty;
  });

  async fromLogo() {
    this.busy.set(true);
    try {
      const saved = await firstValueFrom(this.api.post('/settings/favicon/from-logo'));
      this.stamp.set(Date.now());
      this.changed.emit(saved);
      this.notify.success('Browser icon created from your logo');
    } catch (e) {
      this.notify.error(e);
    } finally {
      this.busy.set(false);
    }
  }

  async regenerate() {
    this.busy.set(true);
    try {
      await firstValueFrom(this.api.post('/settings/favicon/regenerate'));
      this.stamp.set(Date.now());
      this.notify.success('Icon files rebuilt');
    } catch (e) {
      this.notify.error(e);
    } finally {
      this.busy.set(false);
    }
  }
}
