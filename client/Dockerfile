# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Pass in any build-time variables (like API URL)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom Nginx configuration if any, else we can use default but setup SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to nginx root
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
