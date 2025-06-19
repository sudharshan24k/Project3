import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form1',
  standalone: true,
  imports: [CommonModule],
  template: `<div class='container py-5'><h3>Form 1</h3><p>This is Form 1. Implement your form here.</p></div>`
})
export class Form1Component {} 