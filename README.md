# Automated Configuration File Generator

A full-stack web application that allows users to specify configuration parameters via a frontend UI and automatically generates structured configuration files in predefined formats.

## Features

- **Dynamic UI**: Form-based interface with environment-specific options
- **Form Persistence**: Cookie-based data persistence to prevent data loss
- **Template-based Generation**: Uses Jinja2 templates for config file generation
- **Database Storage**: MongoDB integration for audit and history
- **Organized File Structure**: Generated files saved in structured directories

## Tech Stack

- **Frontend**: Angular 17 with ngx-cookie-service
- **Backend**: Python FastAPI with Pydantic validation
- **Database**: MongoDB
- **Templates**: Jinja2 for configuration file generation

## Project Structure

```
Project3/
├── frontend/                 # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── ...
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── models/
│   │   ├── services/
│   │   ├── templates/
│   │   └── main.py
│   ├── generated_configs/    # Generated configuration files
│   └── requirements.txt
├── docker-compose.yml        # MongoDB setup
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Docker (for MongoDB)

### Setup Instructions

1. **Start MongoDB**:
   ```bash
   docker-compose up -d
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   ng serve --host 0.0.0.0 --port 4200
   ```

4. **Access the Application**:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Workflow

1. User selects environment (UAT, PROD, COB) from dropdown
2. Form displays environment-specific configuration options
3. User fills in file name and parameters
4. Form data is automatically saved to cookies
5. On submission, data is sent to FastAPI backend
6. Backend validates data and generates config files using templates
7. Files are saved to organized directory structure
8. Metadata is stored in MongoDB for audit purposes
9. Success response with file paths is returned to frontend

## Environment Support

- **UAT**: User Acceptance Testing environment
- **PROD**: Production environment  
- **COB**: Close of Business environment

Each environment has specific configuration templates and validation rules. # Project3
# Project3
