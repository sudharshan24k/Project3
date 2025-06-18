import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationHistory } from '../../models/config.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>Configuration History</h2>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">Filter by Environment</label>
              <select class="form-select" (change)="onEnvironmentFilter($event)">
                <option value="">All Environments</option>
                <option *ngFor="let env of environments" [value]="env">{{ env }}</option>
              </select>
            </div>
          </div>
          
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Environment</th>
                  <th>File Name</th>
                  <th>File Path</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let config of configurations">
                  <td>
                    <span class="badge" [class]="'environment-' + config.environment.toLowerCase()">
                      {{ config.environment }}
                    </span>
                  </td>
                  <td>{{ config.filename }}</td>
                  <td>{{ config.file_path }}</td>
                  <td>{{ config.created_at | date:'short' }}</td>
                  <td>
                    <button class="btn btn-sm btn-danger" (click)="deleteConfig(config.id)">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div *ngIf="configurations.length === 0" class="text-center py-4">
            <p class="text-muted">No configurations found.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit {
  configurations: ConfigurationHistory[] = [];
  environments: string[] = [];
  selectedEnvironment: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadEnvironments();
    this.loadConfigurations();
  }

  private loadEnvironments(): void {
    this.apiService.getEnvironments().subscribe({
      next: (environments) => this.environments = environments,
      error: (error) => console.error('Failed to load environments:', error)
    });
  }

  private loadConfigurations(): void {
    this.apiService.getConfigurations(this.selectedEnvironment).subscribe({
      next: (configurations) => this.configurations = configurations,
      error: (error) => console.error('Failed to load configurations:', error)
    });
  }

  onEnvironmentFilter(event: any): void {
    this.selectedEnvironment = event.target.value;
    this.loadConfigurations();
  }

  deleteConfig(configId: string): void {
    if (confirm('Are you sure you want to delete this configuration?')) {
      this.apiService.deleteConfiguration(configId).subscribe({
        next: () => {
          this.loadConfigurations();
        },
        error: (error) => console.error('Failed to delete configuration:', error)
      });
    }
  }
} 