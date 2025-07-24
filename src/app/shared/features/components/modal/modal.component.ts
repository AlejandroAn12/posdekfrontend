import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  // @Input() showModal: boolean = false;
  // @Output() closeModal = new EventEmitter<void>();
  // @Input() title: string = 'Título del Modal';

  // close() {
  //   this.closeModal.emit();
  // }

  @Input() visible = false;
  @Input() title: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<void>();

  isClosing = false;

  closeModal() {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
      this.isClosing = false;
    }, 300);
  }

  submit() {
    this.submitForm.emit();
  }
  
}
