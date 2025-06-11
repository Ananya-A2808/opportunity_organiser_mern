# Use a base image with Node.js and Nginx
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy frontend source code
COPY frontend/package*.json ./frontend/
COPY frontend/ ./frontend/

# Build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Build backend
WORKDIR /app
COPY backend/package*.json ./backend/
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm install

# Final stage: create a lightweight image with backend and frontend build
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend files and node_modules
COPY --from=build /app/backend /app/backend

# Copy frontend build files to serve with Nginx
RUN apk add --no-cache nginx
COPY --from=build /app/frontend/build /usr/share/nginx/html

# Set environment variable for OpenAI API key
ENV OPENAI_API_KEY=your_openai_api_key_here

# Copy custom nginx config if exists
# Create a minimal default nginx.conf to avoid missing file error
RUN mkdir -p /etc/nginx && echo -e 'user nginx;\nworker_processes auto;\nerror_log /var/log/nginx/error.log warn;\npid /var/run/nginx.pid;\nevents { worker_connections 1024; }\nhttp { include /etc/nginx/mime.types; default_type application/octet-stream; sendfile on; keepalive_timeout 65; include /etc/nginx/conf.d/*.conf; }' > /etc/nginx/nginx.conf

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports for backend and frontend
EXPOSE 5000 80

# Start both backend and nginx frontend
# Use a script to start both processes
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
