import { Component, effect, inject, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { ICONS, IconName } from '../../shared/icon/icons';
import { Icon } from '../../shared/icon/icon';

/** Every icon the website can show, for the icon picker. Names are the keys the API stores (for example "shield-check"). */
const ICON_CHOICES = (Object.keys(ICONS) as IconName[])
  .sort()
  .map((name) => ({ name, label: name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()) }));

@Component({
  selector: 'app-icon-picker-dialog',
  imports: [MatDialogModule, MatButtonModule, Icon],
  template: `
    <h2 mat-dialog-title>Choose an icon</h2>
    <mat-dialog-content>
      <div class="grid">
        @for (i of icons; track i.name) {
          <button type="button" class="icon" [class.current]="i.name === data.current" (click)="ref.close(i.name)" [attr.aria-label]="i.label">
            <app-icon [name]="i.name" [size]="26" />
            <span class="name">{{ i.label }}</span>
          </button>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>Cancel</button>
    </mat-dialog-actions>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
    .icon { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 4px; border: 2px solid transparent; border-radius: 10px; background: var(--acr-surface); color: var(--acr-navy); cursor: pointer; font: inherit; }
    .icon:hover, .icon:focus-visible { border-color: var(--acr-gold); outline: none; }
    .icon.current { border-color: var(--acr-navy); background: var(--acr-active); }
    .name { font-size: 11px; color: var(--acr-muted); text-align: center; }
  `,
})
export class IconPickerDialog {
  readonly ref = inject<MatDialogRef<IconPickerDialog, string>>(MatDialogRef);
  readonly data = inject<{ current: string }>(MAT_DIALOG_DATA);
  readonly icons = ICON_CHOICES;
}

/** Picks the small card icon. The control holds the icon's name, such as "shield-check" (the website draws it). */
@Component({
  selector: 'app-icon-field',
  imports: [MatButtonModule, MatIconModule, Icon],
  template: `
    <div class="field">
      <span class="label">{{ label() }}</span>
      <div class="row">
        <div class="box" aria-hidden="true">
          @if (value()) {
            <app-icon [name]="$any(value())" [size]="26" />
          } @else {
            <mat-icon>interests</mat-icon>
          }
        </div>
        <span class="name">{{ value() ? pretty(value()) : 'No icon' }}</span>
        <button mat-stroked-button type="button" (click)="choose()"><mat-icon>apps</mat-icon> Choose icon</button>
        @if (value()) {
          <button mat-button type="button" (click)="clear()">Remove</button>
        }
      </div>
      @if (hint()) {
        <span class="hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: `
    .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
    .label { font-size: 14px; font-weight: 600; color: var(--acr-navy); }
    .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .box { width: 56px; height: 56px; border-radius: 12px; background: var(--acr-gold-tint); display: grid; place-items: center; flex: none; color: var(--acr-gold-dark); }
    .name { min-width: 90px; color: var(--acr-muted); }
    .hint { font-size: 12px; color: var(--acr-muted); }
  `,
})
export class IconField {
  readonly control = input.required<FormControl<string | null>>();
  readonly label = input('Icon');
  readonly hint = input('');
  private readonly dialog = inject(MatDialog);
  /** Mirror of the control's value as a signal, so the view updates (the app runs without zone.js). */
  readonly value = signal('');

  constructor() {
    effect((onCleanup) => {
      const c = this.control();
      this.value.set(c.value ?? '');
      const sub = c.valueChanges.subscribe((v) => this.value.set(v ?? ''));
      onCleanup(() => sub.unsubscribe());
    });
  }

  pretty(name: string): string {
    return name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
  }

  async choose() {
    const name = await firstValueFrom(
      this.dialog.open<IconPickerDialog, { current: string }, string>(IconPickerDialog, { data: { current: this.control().value ?? '' }, width: '680px', maxWidth: '96vw' }).afterClosed(),
    );
    if (!name) return;
    this.control().setValue(name);
    this.control().markAsDirty();
  }

  clear() {
    this.control().setValue('');
    this.control().markAsDirty();
  }
}
