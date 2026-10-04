import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'info' | 'error';

export interface ToastMessage {
  text: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  readonly toast$: Observable<ToastMessage | null> = this.toastSubject.asObservable();

  show(text: string, type: ToastType = 'success', duration = 2800): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
    }

    this.toastSubject.next({ text, type });

    this.hideTimer = setTimeout(() => {
      this.toastSubject.next(null);
      this.hideTimer = null;
    }, duration);
  }
}
