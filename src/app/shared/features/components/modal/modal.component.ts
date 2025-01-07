import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  @Input() showModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Input() title: string = 'Título del Modal';

  close() {
    this.closeModal.emit();
  }
  
}
