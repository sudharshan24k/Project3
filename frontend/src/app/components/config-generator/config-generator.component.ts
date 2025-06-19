import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
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
      <div class="card mt-4">
        <div class="card-header">
          <h2>Configuration File Generator</h2>
        </div>
        <div class="card-body">
          <form [formGroup]="configForm" (ngSubmit)="onPreview()">
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">App Name *</label>
                <input type="text" class="form-control" formControlName="appName" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Version *</label>
                <input type="text" class="form-control" formControlName="version" required>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Environment *</label>
                <input type="text" class="form-control" formControlName="environment" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Owner *</label>
                <input type="text" class="form-control" formControlName="owner" required>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-12">
                <label class="form-label">Description *</label>
                <input type="text" class="form-control" formControlName="description" required>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-12">
                <label class="form-label">Additional Parameters</label>
                <div formArrayName="parameters">
                  <div *ngFor="let param of parameters.controls; let i = index" [formGroupName]="i" class="row mb-2 align-items-center">
                    <div class="col-md-5">
                      <input type="text" class="form-control" formControlName="key" placeholder="Key">
                    </div>
                    <div class="col-md-5">
                      <input type="text" class="form-control" formControlName="value" placeholder="Value">
                    </div>
                    <div class="col-md-2">
                      <button type="button" class="btn btn-danger" (click)="removeParameter(i)">Remove</button>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary mt-2" (click)="addParameter()">Add Parameter</button>
              </div>
            </div>

            <div class="row mt-4">
              <div class="col-12 text-end">
                <button type="submit" class="btn btn-success" [disabled]="configForm.invalid">Preview Config</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div *ngIf="previewContent" class="card mt-4">
        <div class="card-header bg-info text-white">
          <h5>Preview Configuration</h5>
        </div>
        <div class="card-body">
          <pre style="background:#f8f9fa; padding:1em; border-radius:8px;">{{ previewContent }}</pre>
          <button class="btn btn-primary mt-2" (click)="onDownload()">Download Config</button>
        </div>
      </div>

      <div *ngIf="downloadUrl" class="alert alert-success mt-4">
        Config generated! <a [href]="downloadUrl" download="config.conf">Click here to download your config file</a>
      </div>
    </div>
  `
})
export class ConfigGeneratorComponent implements OnInit {
  configForm: FormGroup;
  previewContent: string | null = null;
  downloadUrl: string | null = null;

  constructor(private fb: FormBuilder) {
    this.configForm = this.fb.group({
      appName: ['', Validators.required],
      version: ['', Validators.required],
      environment: ['', Validators.required],
      owner: ['', Validators.required],
      description: ['', Validators.required],
      parameters: this.fb.array([])
    });
  }

  ngOnInit(): void {}

  get parameters(): FormArray {
    return this.configForm.get('parameters') as FormArray;
  }

  addParameter(): void {
    this.parameters.push(this.fb.group({ key: '', value: '' }));
  }

  removeParameter(index: number): void {
    this.parameters.removeAt(index);
  }

  onPreview(): void {
    if (this.configForm.invalid) return;
    const formValue = this.configForm.value;
    let configContent = '';
    configContent += `app_name = ${formValue.appName}\n`;
    configContent += `version = ${formValue.version}\n`;
    configContent += `environment = ${formValue.environment}\n`;
    configContent += `owner = ${formValue.owner}\n`;
    configContent += `description = ${formValue.description}\n`;
    formValue.parameters.forEach((param: any) => {
      if (param.key && param.value) {
        configContent += `${param.key} = ${param.value}\n`;
      }
    });
    this.previewContent = configContent;
    this.downloadUrl = null;
  }

  onDownload(): void {
    if (!this.previewContent) return;
    const blob = new Blob([this.previewContent], { type: 'text/plain' });
    this.downloadUrl = window.URL.createObjectURL(blob);
  }
} 