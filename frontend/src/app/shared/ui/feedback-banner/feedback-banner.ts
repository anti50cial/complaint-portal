import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-feedback-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="feedback-banner"
      [class.feedback-banner--error]="tone() === 'error'"
      [class.feedback-banner--success]="tone() === 'success'"
      [attr.role]="tone() === 'error' ? 'alert' : 'status'"
    >
      <span>{{ message() }}</span>
      @if (dismissible()) {
        <button type="button" class="feedback-banner__dismiss" (click)="dismissed.emit()">
          Close
        </button>
      }
    </div>
  `,
  styles: `
    .feedback-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 0.95rem 1rem;
      border-radius: 1rem;
    }

    .feedback-banner--success {
      color: #166534;
      background: #dcfce7;
    }

    .feedback-banner--error {
      color: #991b1b;
      background: #fee2e2;
    }

    .feedback-banner__dismiss {
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
  `
})
export class FeedbackBannerComponent {
  message = input.required<string>();
  tone = input<'success' | 'error'>('success');
  dismissible = input(true);
  dismissed = output<void>();
}
