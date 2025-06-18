import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ConfigurationRequest, ConfigurationResponse, TemplateInfo, FormData } from '../../models/config.model';
import { ApiService } from '../../services/api.service';
import { FormCookieService } from '../../services/cookie.service';

@Component({
  selector: 'app-config-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>Configuration File Generator</h2>
        </div>
        <div class="card-body">
          <form [formGroup]="configForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6">
                <label class="form-label">Environment *</label>
                <select class="form-select" formControlName="environment" (change)="onEnvironmentChange()">
                  <option value="">Select Environment</option>
                  <option *ngFor="let env of environments" [value]="env">{{ env }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">File Name *</label>
                <input type="text" class="form-control" formControlName="filename">
              </div>
            </div>
            
            <div *ngIf="templateInfo && templateInfo.parameters.length > 0">
              <h5>Parameters</h5>
              <div *ngFor="let param of templateInfo.parameters">
                <label>{{ param.key }}</label>
                <input type="text" class="form-control" [formControlName]="'param_' + param.key">
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary" [disabled]="configForm.invalid || isLoading">
              Generate Configuration
            </button>
          </form>
        </div>
      </div>
      
      <div *ngIf="generatedConfig" class="alert alert-success">
        Configuration generated successfully! File: {{ generatedConfig.file_path }}
      </div>
    </div>
  `
})
export class ConfigGeneratorComponent implements OnInit {
  configForm: FormGroup;
  environments: string[] = [];
  templateInfo: TemplateInfo | null = null;
  isLoading = false;
  generatedConfig: ConfigurationResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private cookieService: FormCookieService,
    private ngxCookieService: CookieService
  ) {
    this.configForm = this.fb.group({
      environment: ['', Validators.required],
      filename: ['', Validators.required],
      templateType: ['application']
    });
  }

  ngOnInit(): void {
    this.loadEnvironments();
    this.loadSavedFormData();
  }

  private loadEnvironments(): void {
    this.apiService.getEnvironments().subscribe({
      next: (environments) => this.environments = environments,
      error: (error) => console.error('Failed to load environments:', error)
    });
  }

  private loadSavedFormData(): void {
    const savedData = this.cookieService.loadFormData();
    if (savedData) {
      this.configForm.patchValue({
        environment: savedData.environment || '',
        filename: savedData.filename || '',
        templateType: savedData.templateType || 'application'
      });
      if (savedData.environment) {
        this.loadTemplateInfo(savedData.environment, savedData.templateType || 'application');
      }
    }
  }

  onEnvironmentChange(): void {
    const environment = this.configForm.get('environment')?.value;
    if (environment) {
      this.loadTemplateInfo(environment, 'application');
    }
    this.saveFormData();
  }

  private loadTemplateInfo(environment: string, templateType: string): void {
    this.isLoading = true;
    this.apiService.getTemplateInfo(environment, templateType).subscribe({
      next: (templateInfo) => {
        this.templateInfo = templateInfo;
        this.setupParameterControls();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load template info:', error);
        this.isLoading = false;
      }
    });
  }

  private setupParameterControls(): void {
    if (!this.templateInfo) return;
    this.templateInfo.parameters.forEach(param => {
      const controlName = 'param_' + param.key;
      if (this.configForm.contains(controlName)) {
        this.configForm.removeControl(controlName);
      }
      this.configForm.addControl(controlName, this.fb.control(''));
    });
  }

  private getParametersFromForm(): { [key: string]: any } {
    const parameters: { [key: string]: any } = {};
    if (this.templateInfo) {
      this.templateInfo.parameters.forEach(param => {
        const control = this.configForm.get('param_' + param.key);
        if (control) {
          parameters[param.key] = control.value;
        }
      });
    }
    return parameters;
  }

  onSubmit(): void {
    if (this.configForm.invalid) return;

    const request: ConfigurationRequest = {
      environment: this.configForm.get('environment')?.value,
      filename: this.configForm.get('filename')?.value,
      templateType: this.configForm.get('templateType')?.value,
      parameters: this.getParametersFromForm()
    };

    this.isLoading = true;
    this.apiService.generateConfiguration(request).subscribe({
      next: (response) => {
        this.generatedConfig = response;
        this.isLoading = false;
        this.cookieService.clearFormData();
      },
      error: (error) => {
        console.error('Failed to generate configuration:', error);
        this.isLoading = false;
      }
    });
  }

  private saveFormData(): void {
    const formData: FormData = {
      environment: this.configForm.get('environment')?.value || '',
      filename: this.configForm.get('filename')?.value || '',
      templateType: this.configForm.get('templateType')?.value || 'application',
      parameters: this.getParametersFromForm()
    };
    this.cookieService.saveFormData(formData);
  }
} 