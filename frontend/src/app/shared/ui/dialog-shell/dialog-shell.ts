import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';

@Component({
  selector: 'app-dialog-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      class="dialog-shell"
      [class.dialog-shell--dark]="theme() === 'dark'"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="headingId()"
    >
      <button
        type="button"
        class="dialog-shell__backdrop"
        [attr.aria-label]="closeLabel()"
        (click)="closed.emit()"
      ></button>

      <div class="dialog-shell__card">
        <div class="dialog-shell__header">
          <h2 class="dialog-shell__title" [id]="headingId()">{{ title() }}</h2>
          <button type="button" class="dialog-shell__close" (click)="closed.emit()">Close</button>
        </div>

        <div class="dialog-shell__content">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: `
    .dialog-shell {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 1rem;
    }

    .dialog-shell__backdrop {
      position: absolute;
      inset: 0;
      border: none;
      background: rgba(15, 23, 42, 0.55);
    }

    .dialog-shell__card {
      position: relative;
      width: min(100%, 760px);
      max-height: calc(100vh - 2rem);
      overflow: auto;
      padding: 1.5rem;
      border-radius: 1.25rem;
      background: #fff;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
    }

    .dialog-shell__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .dialog-shell__title {
      margin: 0;
      font-size: 1.4rem;
    }

    .dialog-shell__close {
      border: 1px solid #cbd5e1;
      background: #fff;
      border-radius: 0.75rem;
      padding: 0.6rem 0.85rem;
      cursor: pointer;
    }

    .dialog-shell__detail-grid {
      display: grid;
      gap: 1rem;
      margin: 0 0 1rem;
    }

    .dialog-shell__detail-grid dt {
      margin-bottom: 0.35rem;
      font-size: 0.85rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    .dialog-shell__detail-grid dd {
      margin: 0;
    }

    .dialog-shell__meta {
      margin: 0 0 1rem;
      color: #475569;
    }

    .dialog-shell__panel,
    .dialog-shell__panel--accent,
    .dialog-shell__panel--note {
      padding: 1rem;
      border-radius: 1rem;
    }

    .dialog-shell__panel {
      background: #f8fafc;
    }

    .dialog-shell__panel--accent {
      background: #dbeafe;
    }

    .dialog-shell__panel--note {
      background: #fef3c7;
    }

    .dialog-shell__copy {
      margin: 0;
      color: #334155;
      white-space: pre-wrap;
    }

    .dialog-shell__panel-title {
      margin: 0 0 0.5rem;
      font-weight: 700;
    }

    .dialog-shell__panel--accent .dialog-shell__panel-title {
      color: #1d4ed8;
    }

    .dialog-shell__panel--note .dialog-shell__panel-title {
      color: #92400e;
    }

    .dialog-shell__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }

    /* Dark theme overrides - More robust selectors */
    .dialog-shell.dialog-shell--dark .dialog-shell__card {
      background: #0f172a !important;
      border: 1px solid rgba(99, 102, 241, 0.4) !important;
      color: #f8fafc !important;
      box-shadow: 0 0 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(99, 102, 241, 0.15) !important;
    }

    .dialog-shell.dialog-shell--dark .dialog-shell__title {
      color: #ffffff !important;
    }

    .dialog-shell.dialog-shell--dark .dialog-shell__close {
      background: #1e293b !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
      color: #f8fafc !important;
    }

    .dialog-shell.dialog-shell--dark .dialog-shell__close:hover {
      background: #334155 !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
    }

    .dialog-shell.dialog-shell--dark .dialog-shell__panel {
      background: rgba(255, 255, 255, 0.08) !important;
    }

    .dialog-shell.dialog-shell--dark .dialog-shell__copy,
    .dialog-shell.dialog-shell--dark .dialog-shell__panel-title {
      color: #f1f5f9 !important;
    }

    @media (min-width: 768px) {
      .dialog-shell__detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `
})
export class DialogShellComponent {
  title = input.required<string>();
  theme = input<'light' | 'dark'>('light');
  headingId = input('dialog-shell-title');
  closeLabel = input('Close dialog');
  closed = output<void>();
}
