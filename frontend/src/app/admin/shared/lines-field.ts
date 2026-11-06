import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmService } from '../core/confirm.service';

const split = (v: unknown): string[] => String(v ?? '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);

/**
 * A list of short texts with an Add and a Remove button. One item per box; stored in the form control as one text,
 * one item per line (the way the server keeps it).
 */
@Component({
  selector: 'app-lines-field',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="lines">
      <label class="label">{{ label() }}</label>
      @for (item of items(); track $index) {
        <div class="row">
          <input
            class="box"
            type="text"
            maxlength="200"
            [value]="item"
            [attr.aria-label]="label() + ' ' + ($index + 1)"
            (input)="edit($index, $any($event.target).value)"
          />
          <button mat-icon-button type="button" aria-label="Remove" title="Remove" (click)="remove($index)"><mat-icon>delete</mat-icon></button>
        </div>
      }
      <button mat-stroked-button type="button" (click)="add()"><mat-icon>add</mat-icon> {{ addLabel() }}</button>
      @if (hint()) {
        <span class="hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: `
    .lines { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin: 4px 0 16px; }
    .label { font-size: 14px; font-weight: 500; }
    .row { display: flex; align-items: center; gap: 4px; width: 100%; max-width: 520px; }
    .box { flex: 1; padding: 10px 12px; font: inherit; border: 1px solid #bbb; border-radius: 6px; }
    .box:focus { outline: 2px solid var(--acr-navy, #1e3a5f); outline-offset: -1px; }
    .hint { font-size: 12px; color: var(--acr-muted); }
  `,
})
export class LinesField implements OnInit {
  readonly control = input.required<FormControl>();
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly addLabel = input('Add option');

  protected readonly items = signal<string[]>([]);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirm = inject(ConfirmService);

  ngOnInit() {
    this.items.set(split(this.control().value));
    // The form was reset or reloaded from outside (for example after saving): show what it holds now.
    this.control().valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v) => {
      if (split(v).join('\n') !== split(this.items().join('\n')).join('\n')) this.items.set(split(v));
    });
  }

  protected add() {
    this.items.update((l) => [...l, '']);
  }

  protected async remove(i: number) {
    const name = this.items()[i]?.trim();
    const ok = await this.confirm.ask({
      title: 'Remove this option?',
      message: `${name ? `"${name}"` : 'This empty option'} will be removed from the list.
It is only deleted from the website after you press "Save changes".`,
      confirmText: 'Remove',
      danger: true,
    });
    if (!ok) return;
    this.items.update((l) => l.filter((_, k) => k !== i));
    this.push();
  }

  protected edit(i: number, value: string) {
    this.items.update((l) => l.map((x, k) => (k === i ? value : x)));
    this.push();
  }

  /** Blank boxes are kept on screen while typing but left out of the saved text. */
  private push() {
    const c = this.control();
    c.setValue(this.items().map((x) => x.trim()).filter(Boolean).join('\n'));
    c.markAsDirty();
  }
}
