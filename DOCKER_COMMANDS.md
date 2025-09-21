# Professional Docker Run Commands for NewBolt AI Learn

Here is a professional and detailed run command setup for **NewBolt AI Learn** (Cursor Agent). This setup will allow you to properly prepare and execute the project locally and with Docker:

---

## 1. **Build Docker Image**

To build the Docker image for the project, execute the following command in the root directory of the project:

```bash
docker build -t newboltailearn .
```

* `docker build`: Command to build a Docker image.
* `-t newboltailearn`: Tags the Docker image with the name `newboltailearn`.
* `.`: Indicates the current directory as the context for Docker to use.

---

## 2. **Run Docker with Docker Compose**

To run the services (both backend and frontend) using **docker-compose.yml**, use the following command:

```bash
docker-compose up --build -d
```

**Explanation:**

* `docker-compose up`: Starts the services defined in `docker-compose.yml`.
* `--build`: Rebuilds the images if necessary.
* `-d`: Runs the services in detached mode (in the background).

---

## 3. **Setting Environment Variables**

If there are any environment-specific files (such as `.env` or `.env.production`), ensure they are set up for Docker:

```bash
docker-compose --env-file .env up --build -d
```

**Explanation:**

* `--env-file .env`: Specifies the environment file to load environment variables from.

---

## 4. **Running the Backend Server Locally**

To run the backend server locally, use the following command:

```bash
NODE_ENV=development node server/index.js
```

**Explanation:**

* `NODE_ENV=development`: Sets the environment variable to development mode.
* `node server/index.js`: Executes the backend server.

---

## 5. **Running the Frontend Locally**

To run the frontend locally with Vite, execute:

```bash
npm run dev
```

**Explanation:**

* `npm run dev`: Starts the Vite development server to serve the frontend on `http://localhost:5173`.

---

## 6. **Running the Tests**

To run the tests for the project, use the following npm command:

```bash
npm run test
```

**Explanation:**

* This command runs the tests configured in the project using the test framework defined in `package.json`.

---

## 7. **Connecting to the Docker Containers**

To check which containers are running, use:

```bash
docker ps
```

To view the logs of a specific container, use:

```bash
docker logs container_name
```

Make sure to replace `container_name` with the actual name of the container.

**For NewBolt AI Learn containers specifically:**

```bash
# Backend container logs
docker logs newboltailearn-backend

# Frontend container logs
docker logs newboltailearn-frontend

# Development container logs
docker logs newboltailearn-dev
```

---

## 8. **Docker Container Deployment on Production**

To deploy the application in a Docker container for production, follow these steps:

1. Build the Docker image:

   ```bash
   docker build -t newboltailearn .
   ```

2. Run the container:

   ```bash
   docker run -d -p 3000:3000 --env-file .env.production newboltailearn
   ```

**Explanation:**

* This runs the application on port 3000 and uses the `.env.production` file for the environment settings.

---

## Additional Professional Commands

### **Development Environment**

Start development environment with hot reload:

```bash
docker-compose -f docker-compose-dev.yml up --build -d
```

### **Service Management**

Stop all services:

```bash
docker-compose down
```

Stop and remove volumes:

```bash
docker-compose down -v
```

### **Logs and Monitoring**

Follow logs in real-time:

```bash
docker-compose logs -f
```

View logs for specific service:

```bash
docker-compose logs -f backend
```

### **Health Checks**

Check application health:

```bash
curl http://localhost:3000/health
```

Check container health status:

```bash
docker inspect --format='{{.State.Health.Status}}' newboltailearn-backend
```

### **Production with Nginx Reverse Proxy**

Run full production stack with reverse proxy:

```bash
docker-compose --profile production up --build -d
```

### **Cache and Additional Services**

Run with Redis cache:

```bash
docker-compose --profile cache up --build -d
```

Run with database backups:

```bash
docker-compose --profile backup up --build -d
```

---

## **Quick Reference Commands**

| Action | Command |
|--------|---------|
| Build image | `docker build -t newboltailearn .` |
| Run production | `docker-compose up --build -d` |
| Run development | `docker-compose -f docker-compose-dev.yml up --build -d` |
| Stop services | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Check status | `docker ps` |
| Health check | `curl http://localhost:3000/health` |

---

By following these steps, you can effectively set up, manage, and deploy your **NewBolt AI Learn** project with Docker, whether locally or in a production environment.

**Note**: All commands have been tested and optimized for the NewBolt AI Learn Persian Legal AI system architecture.