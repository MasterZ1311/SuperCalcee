# SuperCalcee Production Deployment Guide

This guide provides technical instructions for packaging and deploying SuperCalcee across desktop platforms, cloud servers, and web/PWA hosting environments.

---

## 1. Overview of Deployment Architecture

SuperCalcee operates on a decoupled client-server architecture:

```text
+-------------------------------------------------------------+
|                SuperCalcee Frontend Client                  |
|  - Desktop: React 19 inside Electron shell                  |
|  - Mobile / Web: React 19 PWA via Mobile/Desktop Browser     |
+-------------------------------------------------------------+
                               |
                   HTTPS / REST API Transport
                               |
+-------------------------------------------------------------+
|              FastAPI Scientific Backend Core                |
|  - Symbolic CAS Engine (SymPy)                              |
|  - Dimensional Analysis & Physical Constants                |
|  - Numerical Analysis & Formula Solver Engines              |
+-------------------------------------------------------------+
```

---

## 2. Desktop Distribution Packaging

Desktop binaries package the compiled React client, the Electron runtime, and an isolated Python runtime containing SymPy, FastAPI, and scientific dependencies.

### Step 1: Prepare Clean Production Virtual Environment
```bash
# On Windows (PowerShell):
python -m venv venv
.\venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

# On macOS / Linux:
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 2: Build and Package Executable
```bash
# From repository root:
npm run package

# Or inside src_electron:
cd src_electron
npm run package
```

The output artifacts will be placed in `src_electron/release/`:
* `SuperCalcee.exe` (Windows executable)
* `resources/venv/` (Bundled Python runtime)
* `resources/src_python/` (Scientific engine scripts and constants)
* `resources/app.asar` (Compiled React application)

### Configuring Windows Installer (`.exe` NSIS Installer)
In [`src_electron/package.json`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/package.json), change the `build.win` target:
```json
"win": {
  "target": ["nsis", "zip"]
}
```
Run `npm run package` again to produce `SuperCalcee Setup 1.0.0.exe`.

---

## 3. Cloud Backend Deployment (Docker & Container Services)

To deploy the Python computational core so that web, desktop, and mobile clients can access it remotely:

### Option A: Deploy via Docker Container

The repository includes a production-ready [`Dockerfile`](file:///e:/Github/GitProjects/SuperCalcee/Dockerfile) and [`docker-compose.yml`](file:///e:/Github/GitProjects/SuperCalcee/docker-compose.yml).

#### 1. Build and Run Container
```bash
# Build Docker image
docker build -t supercalcee-core:latest .

# Run container binding to port 8000
docker run -d -p 8000:8000 --name supercalcee-api supercalcee-core:latest
```

#### 2. Deploy to Cloud Container Platforms
You can deploy this container directly to:
* **Render**: Create a *Web Service* from your Git repository using Docker environment.
* **Railway**: Create a new project and select *Deploy from GitHub repo*.
* **Fly.io**: Run `fly launch` to automatically detect Dockerfile and deploy.
* **AWS ECS / DigitalOcean App Platform**: Deploy the Docker container image.

### Option B: Bare Metal / Linux VPS Deployment (systemd)

If hosting on an Ubuntu/Debian virtual server:

1. Clone repository and install dependencies in `/opt/supercalcee`:
   ```bash
   git clone https://github.com/MasterZ1311/SuperCalcee.git /opt/supercalcee
   cd /opt/supercalcee
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Create a systemd service file `/etc/systemd/system/supercalcee.service`:
   ```ini
   [Unit]
   Description=SuperCalcee Scientific Computational Core
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/opt/supercalcee
   Environment="PATH=/opt/supercalcee/venv/bin"
   Environment="HOST=0.0.0.0"
   Environment="PORT=8000"
   Environment="ALLOWED_ORIGINS=https://your-frontend-domain.com"
   ExecStart=/opt/supercalcee/venv/bin/python src_python/api.py --host 0.0.0.0 --port 8000
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now supercalcee
   ```

4. Configure Nginx reverse proxy with SSL (Certbot):
   ```nginx
   server {
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

---

## 4. Web Frontend Deployment (Vercel, Netlify, Cloudflare)

The React frontend can be built as static assets and deployed to any edge hosting provider:

### Step 1: Set Remote Backend URL
Configure the environment variable `VITE_API_BASE_URL` with your public backend URL:
```bash
# In src_electron/.env.production
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Step 2: Build Static Production Assets
```bash
cd src_electron
npm run build
```
This outputs compiled assets into `src_electron/dist/`.

### Step 3: Deploy
* **Vercel**: Run `vercel` inside `src_electron/` or connect your GitHub repository (set Root Directory to `src_electron` and Build Command to `npm run build`).
* **Netlify**: Set publish directory to `src_electron/dist`.
* **Cloudflare Pages**: Link repository, set build directory to `src_electron/dist`.

---

## 5. Security & Configuration Checklist

| Control | Recommended Setting | Purpose |
| :--- | :--- | :--- |
| **CORS Origins** | Set `ALLOWED_ORIGINS=https://app.yourdomain.com` in production backend | Restricts cross-origin API calls to authorized frontend domains |
| **Request Correlation** | Enabled via `X-Request-ID` middleware | End-to-end tracing for errors and calculations |
| **Content Security Policy** | Enforced in [`index.html`](file:///e:/Github/GitProjects/SuperCalcee/src_electron/index.html) | Protects renderer from unauthorized scripts and unauthorized network connections |
| **Watchdog Timeout** | `--parent-pid <PID>` | Automatically terminates Python when parent process dies |
