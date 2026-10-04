import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toast$ | async; as toast) {
      <div
        class="toast"
        [class.success]="toast.type === 'success'"
        [class.info]="toast.type === 'info'"
        [class.error]="toast.type === 'error'"
        role="status"
        aria-live="polite"
      >
        {{ toast.text }}
      </div>
    }
  `,
  styles: `
    .toast {
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1200;
      max-width: min(92vw, 460px);
      padding: 12px 20px;
      border-radius: 999px;
      font: 600 0.88rem 'Inter', 'Segoe UI', system-ui, sans-serif;
      color: #fffdf8;
      background: #17221f;
      box-shadow: 0 10px 30px rgba(23, 34, 31, 0.28);
      animation: toast-in 0.25s ease-out;
      text-align: center;
    }
    .toast.success {
      background: #125b52;
    }
    .toast.info {
      background: #17221f;
    }
    .toast.error {
      background: #b03a2e;
    }
    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translate(-50%, -12px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
  `,
})
export class ToastComponent {
  readonly toast$ = inject(ToastService).toast$;
}
