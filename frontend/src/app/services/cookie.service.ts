import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormData } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class FormCookieService {
  private readonly COOKIE_PREFIX = 'config_generator_';
  private readonly FORM_DATA_KEY = 'form_data';
  private readonly COOKIE_EXPIRY_DAYS = 7;

  constructor(private cookieService: CookieService) { }

  // Save form data to cookies
  saveFormData(formData: FormData): void {
    try {
      const cookieValue = JSON.stringify(formData);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.COOKIE_EXPIRY_DAYS);
      
      this.cookieService.set(
        this.COOKIE_PREFIX + this.FORM_DATA_KEY,
        cookieValue,
        expiryDate,
        '/',
        undefined,
        false,
        'Lax'
      );
    } catch (error) {
      console.error('Error saving form data to cookies:', error);
    }
  }

  // Load form data from cookies
  loadFormData(): FormData | null {
    try {
      const cookieValue = this.cookieService.get(this.COOKIE_PREFIX + this.FORM_DATA_KEY);
      if (cookieValue) {
        return JSON.parse(cookieValue);
      }
    } catch (error) {
      console.error('Error loading form data from cookies:', error);
    }
    return null;
  }

  // Save individual form field
  saveFormField(fieldName: string, value: any): void {
    try {
      const currentData = this.loadFormData() || {};
      currentData[fieldName] = value;
      this.saveFormData(currentData);
    } catch (error) {
      console.error('Error saving form field to cookies:', error);
    }
  }

  // Load individual form field
  loadFormField(fieldName: string): any {
    try {
      const formData = this.loadFormData();
      return formData ? formData[fieldName] : null;
    } catch (error) {
      console.error('Error loading form field from cookies:', error);
      return null;
    }
  }

  // Save environment selection
  saveEnvironment(environment: string): void {
    this.saveFormField('environment', environment);
  }

  // Load environment selection
  loadEnvironment(): string | null {
    return this.loadFormField('environment');
  }

  // Save filename
  saveFilename(filename: string): void {
    this.saveFormField('filename', filename);
  }

  // Load filename
  loadFilename(): string | null {
    return this.loadFormField('filename');
  }

  // Save parameters
  saveParameters(parameters: { [key: string]: any }): void {
    this.saveFormField('parameters', parameters);
  }

  // Load parameters
  loadParameters(): { [key: string]: any } | null {
    return this.loadFormField('parameters');
  }

  // Save template type
  saveTemplateType(templateType: string): void {
    this.saveFormField('template_type', templateType);
  }

  // Load template type
  loadTemplateType(): string | null {
    return this.loadFormField('template_type');
  }

  // Clear all form data
  clearFormData(): void {
    try {
      this.cookieService.delete(this.COOKIE_PREFIX + this.FORM_DATA_KEY, '/');
    } catch (error) {
      console.error('Error clearing form data from cookies:', error);
    }
  }

  // Check if form data exists
  hasFormData(): boolean {
    return this.cookieService.check(this.COOKIE_PREFIX + this.FORM_DATA_KEY);
  }

  // Get cookie expiry date
  getCookieExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.COOKIE_EXPIRY_DAYS);
    return expiryDate;
  }

  // Check if cookies are enabled
  areCookiesEnabled(): boolean {
    return this.cookieService.check('test_cookie');
  }
} 