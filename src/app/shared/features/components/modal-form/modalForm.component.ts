import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modalForm',
  imports: [CommonModule, FormsModule],
  templateUrl: './modalForm.component.html',
  styleUrl: './modalForm.component.css'
})
export class ModalFormComponent {

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
