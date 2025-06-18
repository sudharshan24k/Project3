import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  ConfigurationRequest, 
  ConfigurationResponse, 
  ConfigurationHistory, 
  TemplateInfo, 
  ValidationResult 
} from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  // Get available environments
  getEnvironments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/environments`)
      .pipe(catchError(this.handleError));
  }

  // Get available templates
  getTemplates(): Observable<Array<{environment: string, template_type: string}>> {
    return this.http.get<Array<{environment: string, template_type: string}>>(`${this.baseUrl}/templates`)
      .pipe(catchError(this.handleError));
  }

  // Get template information for an environment
  getTemplateInfo(environment: string, templateType: string = 'application'): Observable<TemplateInfo> {
    return this.http.get<TemplateInfo>(`${this.baseUrl}/templates/${environment}?template_type=${templateType}`)
      .pipe(catchError(this.handleError));
  }

  // Validate parameters
  validateParameters(request: ConfigurationRequest): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(`${this.baseUrl}/validate`, request)
      .pipe(catchError(this.handleError));
  }

  // Generate configuration
  generateConfiguration(request: ConfigurationRequest): Observable<ConfigurationResponse> {
    return this.http.post<ConfigurationResponse>(`${this.baseUrl}/generate`, request)
      .pipe(catchError(this.handleError));
  }

  // Get configuration history
  getConfigurations(environment?: string, limit: number = 50): Observable<ConfigurationHistory[]> {
    let url = `${this.baseUrl}/configurations?limit=${limit}`;
    if (environment) {
      url += `&environment=${environment}`;
    }
    return this.http.get<ConfigurationHistory[]>(url)
      .pipe(catchError(this.handleError));
  }

  // Get specific configuration by ID
  getConfiguration(configId: string): Observable<ConfigurationHistory> {
    return this.http.get<ConfigurationHistory>(`${this.baseUrl}/configurations/${configId}`)
      .pipe(catchError(this.handleError));
  }

  // Delete configuration
  deleteConfiguration(configId: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.baseUrl}/configurations/${configId}`)
      .pipe(catchError(this.handleError));
  }

  // Health check
  healthCheck(): Observable<{status: string, database: string}> {
    return this.http.get<{status: string, database: string}>(`${this.baseUrl}/health`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.detail) {
        errorMessage = error.error.detail;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 