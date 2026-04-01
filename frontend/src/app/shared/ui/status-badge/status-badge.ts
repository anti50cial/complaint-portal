import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="status-badge" [class.status-badge--pending]="variant() === 'Pending'" [class.status-badge--seen]="variant() === 'Seen'" [class.status-badge--resolved]="variant() === 'Resolved'">{{ status() }}</span>`,
  styles: `
    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .status-badge--pending {
      color: #991b1b;
      background: #fee2e2;
    }

    .status-badge--seen {
      color: #1d4ed8;
      background: #dbeafe;
    }

    .status-badge--resolved {
      color: #166534;
      background: #dcfce7;
    }
  `
})
export class StatusBadgeComponent {
  status = input.required<string>();
  variant = computed(() => this.status());
}
