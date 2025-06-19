import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-5">
      <h2 class="mb-4">Dashboard</h2>
      <div class="row g-3">
        <div class="col-md-4" *ngFor="let n of buttons">
          <a [routerLink]="'/forms/form' + n" class="btn btn-primary w-100 py-3">
            Go to Form {{ n }}
          </a>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  buttons = Array.from({ length: 10 }, (_, i) => i + 1);
} 