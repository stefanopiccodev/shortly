# URL Shortener

This project is a URL shortener application that allows users to create shortened URLs for easier sharing and tracking. It consists of a frontend built with React and a backend powered by Node.js and Express, with a PostgreSQL database for storage.

## Key Features

- **User Authentication**: Secure user authentication to manage personal URLs.
- **URL Shortening**: Generate short URLs for any valid URL input.
- **Custom Slugs**: Option to create custom slugs for URLs.
- **Redirection**: Redirect users from the short URL to the original URL.
- **Visit Tracking**: Track the number of visits for each shortened URL.
- **User Dashboard**: View and manage all shortened URLs in a user-friendly dashboard.
- **Responsive Design**: Frontend is designed to be responsive and user-friendly across devices.

## Technologies Used

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Containerization**: Docker

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the project directory**:
   ```bash
   cd url-shortener
   ```

3. **Start the services using Docker Compose**:
   ```bash
   docker-compose up
   ```

4. **Access the application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:4000`

## Environment Variables

Ensure you have a `.env` file in the root directory with the following variables:

```
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=urlshortener
DATABASE_URL=postgresql://user:password@postgres:5432/urlshortener
BASE_URL=http://localhost:3000
```