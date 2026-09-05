import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {

  // ============================================
  // ✅ Modal Visibility
  // ============================================

  readonly visible = input(false);

  // ============================================
  // ✅ Modal Title
  // ============================================

  readonly title = input('');

  // ============================================
  // ✅ Close Event
  // ============================================

  readonly closed = output<void>();

  close(): void {

    this.closed.emit();

  }

}