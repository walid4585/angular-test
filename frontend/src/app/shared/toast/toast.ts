import { Injectable, signal } from '@angular/core';

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  // ============================================
  // ✅ Toast State
  // ============================================

  readonly visible = signal(false);

  readonly message = signal('');

  readonly type = signal<ToastType>('success');

  // ============================================
  // ✅ Show Toast
  // ============================================

  show(
    message: string,
    type: ToastType = 'success',
    duration = 3000
  ): void {

    this.message.set(message);

    this.type.set(type);

    this.visible.set(true);

    setTimeout(() => {

      this.visible.set(false);

    }, duration);

  }

  // ============================================
  // ✅ Helpers
  // ============================================

  success(message: string): void {

    this.show(message, 'success');

  }

  error(message: string): void {

    this.show(message, 'error');

  }

  warning(message: string): void {

    this.show(message, 'warning');

  }

  info(message: string): void {

    this.show(message, 'info');

  }

  // ============================================
  // ✅ Hide Toast
  // ============================================

  hide(): void {

    this.visible.set(false);

  }

}