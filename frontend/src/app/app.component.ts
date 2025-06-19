import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="container-fluid">
      <!-- Navigation Header -->
      <nav class="navbar navbar-expand-lg navbar-dark" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div class="container">
          <a class="navbar-brand fw-bold" href="#">
            <i class="fas fa-cogs me-2"></i>
            Configuration File Generator
          </a>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/history" routerLinkActive="active">
                  <i class="fas fa-history me-1"></i>
                  History
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="py-4">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="text-center text-white py-3" style="background: rgba(0,0,0,0.1);">
        <div class="container">
          <p class="mb-0">
            <i class="fas fa-code me-1"></i>
            Configuration File Generator v1.0.0
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .navbar {
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .navbar-brand {
      font-size: 1.5rem;
    }
    
    .nav-link {
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .nav-link:hover {
      transform: translateY(-1px);
    }
    
    .nav-link.active {
      background: rgba(255,255,255,0.2);
      border-radius: 8px;
    }
    
    main {
      min-height: calc(100vh - 200px);
    }
    
    footer {
      backdrop-filter: blur(10px);
    }
  `]
})
export class AppComponent {
  title = 'Configuration File Generator';
} 