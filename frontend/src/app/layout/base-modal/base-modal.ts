import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  templateUrl: './base-modal.html',
  styleUrls: ['./base-modal.css']
})
export class BaseModal {

  // ============================================
  // ✅ Inputs
  // ============================================

  visible = input(false);

  title = input('');

  // ============================================
  // ✅ Outputs
  // ============================================

  close = output<void>();

  // ============================================
  // ✅ Close Modal
  // ============================================

  onClose(): void {

    this.close.emit();

  }

}