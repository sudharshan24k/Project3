# Configuration File Generator - Setup Guide

This guide will help you set up and run the Configuration File Generator application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (for MongoDB)
- **Python 3.8+** (for FastAPI backend)
- **Node.js 18+** and **npm** (for Angular frontend)
- **Git** (for cloning the repository)

## Quick Start (Recommended)

The easiest way to get started is using the provided startup script:

```bash
# Make the script executable (if not already)
chmod +x start.sh

# Run the startup script
./start.sh
```

This script will:
1. Start MongoDB using Docker Compose
2. Set up Python virtual environment and install dependencies
3. Start the FastAPI backend server
4. Install Node.js dependencies and start the Angular frontend
5. Provide you with all the necessary URLs

## Manual Setup

If you prefer to set up each component manually, follow these steps:

### 1. Start MongoDB

```bash
# Start MongoDB and Mongo Express
docker-compose up -d

# Verify MongoDB is running
docker-compose ps
```

MongoDB will be available at:
- **MongoDB**: `mongodb://admin:password123@localhost:27017/`
- **Mongo Express**: `http://localhost:8081` (admin/password123)

### 2. Set Up Backend (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- **API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`
- **Interactive API Docs**: `http://localhost:8000/redoc`

### 3. Set Up Frontend (Angular)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at:
- **Application**: `http://localhost:4200`

## Application Features

### 1. Configuration Generation
- Select environment (UAT, PROD, COB)
- Enter configuration file name
- Fill in environment-specific parameters
- Generate configuration files using Jinja2 templates

### 2. Form Persistence
- Form data is automatically saved to cookies
- Data persists across page refreshes
- Cookies are cleared after successful generation

### 3. Configuration History
- View all generated configurations
- Filter by environment
- Delete configurations
- Track creation timestamps

### 4. Template System
- Environment-specific templates
- Dynamic parameter extraction
- Support for different template types (application, database, logging, security)

## API Endpoints

### Core Endpoints
- `GET /` - API information
- `GET /health` - Health check
- `GET /environments` - Get available environments
- `GET /templates` - Get available templates
- `GET /templates/{environment}` - Get template info for environment

### Configuration Endpoints
- `POST /validate` - Validate configuration parameters
- `POST /generate` - Generate configuration file
- `GET /configurations` - Get configuration history
- `GET /configurations/{id}` - Get specific configuration
- `DELETE /configurations/{id}` - Delete configuration

## Database Schema

### Collections

#### configurations
- `_id`: ObjectId
- `environment`: String (UAT, PROD, COB)
- `filename`: String
- `file_path`: String
- `parameters`: Object
- `template_type`: String
- `created_at`: DateTime
- `updated_at`: DateTime

#### templates
- `environment`: String
- `template_type`: String
- `template_content`: String (Jinja2 template)

## File Structure

Generated configuration files are saved in:
```
backend/generated_configs/
├── UAT/
│   ├── app.conf
│   └── database.conf
├── PROD/
│   ├── app.conf
│   └── security.conf
└── COB/
    ├── app.conf
    └── logging.conf
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure Docker is running
   - Check if port 27017 is available
   - Verify docker-compose.yml configuration

2. **Backend Won't Start**
   - Check if port 8000 is available
   - Verify Python dependencies are installed
   - Check MongoDB connection

3. **Frontend Won't Start**
   - Check if port 4200 is available
   - Verify Node.js dependencies are installed
   - Check if backend is running

4. **CORS Errors**
   - Ensure backend is running on http://localhost:8000
   - Check CORS configuration in backend/app/main.py

### Logs

- **Backend logs**: Check terminal where uvicorn is running
- **Frontend logs**: Check browser developer console
- **MongoDB logs**: `docker-compose logs mongodb`

## Development

### Adding New Templates

1. Add template to MongoDB:
```javascript
db.templates.insertOne({
  environment: "NEW_ENV",
  template_type: "application",
  template_content: "# Your Jinja2 template here\n[Section]\nkey = {{ parameter }}"
})
```

2. Update Environment enum in `backend/app/models/config.py`

### Adding New Parameters

1. Update template content with new parameters
2. Parameters are automatically extracted from template
3. Frontend will dynamically create form fields

### Customizing Styles

- Global styles: `frontend/src/styles.css`
- Component styles: Inline in component decorators
- Bootstrap 5 is included for responsive design

## Production Deployment

For production deployment, consider:

1. **Environment Variables**
   - Set `MONGO_URI` for production MongoDB
   - Configure CORS origins
   - Set proper logging levels

2. **Security**
   - Use HTTPS
   - Implement authentication
   - Validate file paths
   - Rate limiting

3. **Performance**
   - Use production build for Angular
   - Configure MongoDB indexes
   - Implement caching

4. **Monitoring**
   - Add health checks
   - Implement logging
   - Set up monitoring

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the API documentation at `http://localhost:8000/docs`
3. Check the browser console for frontend errors
4. Review backend logs for server errors 