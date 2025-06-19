export interface ConfigParameter {
  key: string;
  value: any;
  type: string;
  required: boolean;
  description?: string;
}

export interface ConfigurationRequest {
  environment: string;
  filename: string;
  parameters: { [key: string]: any };
  template_type?: string;
}

export interface ConfigurationResponse {
  id: string;
  environment: string;
  filename: string;
  file_path: string;
  parameters: { [key: string]: any };
  created_at: string;
  status: string;
}

export interface ConfigurationHistory {
  id: string;
  environment: string;
  filename: string;
  file_path: string;
  parameters: { [key: string]: any };
  template_type: string;
  created_at: string;
  updated_at?: string;
}

export interface TemplateInfo {
  environment: string;
  template_type: string;
  parameters: ConfigParameter[];
}

export interface ValidationResult {
  valid: boolean;
  missing_parameters?: string[];
  message: string;
}

export interface Environment {
  name: string;
  displayName: string;
  description: string;
}

export interface FormData {
  environment: string;
  filename: string;
  parameters: { [key: string]: any };
  template_type: string;
  [key: string]: any;
} 