import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {

  // ============================================
  // ✅ Toast Visibility
  // ============================================

  readonly visible = input(false);

  // ============================================
  // ✅ Toast Message
  // ============================================

  readonly message = input('');

  // ============================================
  // ✅ Toast Type
  // ============================================

  readonly type = input<'success' | 'error' | 'warning' | 'info'>('success');

  // ============================================
  // ✅ Close Event
  // ============================================

  readonly closed = output<void>();

  close(): void {

    this.closed.emit();

  }

}