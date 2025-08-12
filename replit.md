# Bill Reminder App

## Overview

This is a Flask-based web application for managing personal bills and payment reminders. Users can add, edit, track, and receive notifications for their upcoming bills. The application provides a dashboard view with bill status tracking, overdue notifications, and user-friendly interfaces for bill management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive UI
- **CSS Framework**: Bootstrap 5 with custom CSS for enhanced styling
- **JavaScript**: Vanilla JavaScript for form validation, interactive elements, and client-side functionality
- **Icons**: Font Awesome for consistent iconography throughout the application

### Backend Architecture
- **Web Framework**: Flask with modular design separating concerns across multiple files
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy extension for database operations
- **Session Management**: Flask sessions for user state management
- **Middleware**: ProxyFix for handling proxy headers in deployment environments
- **Application Structure**:
  - `app.py`: Application factory and configuration
  - `models.py`: Database models and business logic
  - `routes.py`: Request handling and view logic
  - `main.py`: Application entry point

### Data Storage
- **Primary Database**: SQLAlchemy ORM with support for multiple database backends
- **Default Configuration**: SQLite for development with PostgreSQL support for production
- **Database Features**:
  - Connection pooling with automatic reconnection
  - Automatic table creation on startup
  - Cascade delete relationships between users and bills

### Data Models
- **User Model**: Stores contact information (email, phone) for notifications
- **Bill Model**: Comprehensive bill tracking with due dates, amounts, payment status
- **Relationships**: One-to-many relationship between users and bills with cascade deletion

### Authentication and Authorization
- **Session-based Authentication**: Simple session management without complex user authentication
- **User Identification**: Session-stored user IDs for bill association
- **Access Control**: Basic user separation ensuring users only see their own bills

## External Dependencies

### Core Dependencies
- **Flask**: Web framework for request handling and templating
- **SQLAlchemy**: Database ORM for data persistence and relationships
- **Werkzeug**: WSGI utilities including ProxyFix middleware

### Frontend Dependencies
- **Bootstrap 5**: UI framework loaded via CDN for responsive design
- **Font Awesome 6**: Icon library loaded via CDN for consistent iconography

### Development and Deployment
- **Database Support**: Built-in SQLite support with PostgreSQL compatibility
- **Environment Configuration**: Environment variable support for database URLs and session secrets
- **Logging**: Python logging module for debugging and monitoring

### Future Integration Points
- **Email Services**: Architecture prepared for email notification integration
- **SMS Services**: User phone number collection suggests planned SMS functionality
- **External APIs**: Modular design allows for easy integration of notification services