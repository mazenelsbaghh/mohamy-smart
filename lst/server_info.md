# LST Project Server Documentation

## Server details
- **IP Address**: `91.108.121.110`
- **Username**: `root`
- **Password**: `Nk.0/8H2hOkdd-qnN9wZ`

## Architecture & Stack
This server hosts both the backend and frontend components of the application (Mohamy Smart / Lawyer App), utilizing NGINX as the reverse proxy web server.

### 1. Backend API
- **Technology**: .NET Web API
- **Directory**: `/var/www/Lawyer_App/Lawyer`
- **Domain**: `api.mohamy-smart.com`
- **Process Manager**: Managed via `systemd` under the service name `lawyer-api.service`.

### 2. Frontend
- **Technology**: Based on observation, there are static web applications/sites hosted here.
- **Directories**: 
  - `/var/www/mohamy-smart-site`
  - `/var/www/mohamy-smart-landing-page`
- **Domain**: `mohamy-smart.com` and `www.mohamy-smart.com`

### 3. Database
- **Technology**: Microsoft SQL Server (2022)
- **Deployment**: Running inside a Docker container.
- **Container Name**: `sqlserver`
- **Port mapping**: `1433 -> 1433`

---

## What Was Done (Actions Taken)
To apply the backend changes, the following steps were successfully executed:
1. Logged into the server via SSH.
2. Located the backend project directory (`/var/www/Lawyer_App/Lawyer`).
3. Ran `git pull` on the `main` branch to fetch the newly merged updates.
4. Restarted the background service `systemctl restart lawyer-api.service`.
5. Checked the service status ensuring it ran successfully without crashes.

## How to Deploy Future Updates

### Backend Updates
1. **Connect**: `ssh root@91.108.121.110`
2. **Navigate**: `cd /var/www/Lawyer_App/Lawyer`
3. **Pull Code**: `git pull`
4. **Restart App**: `systemctl restart lawyer-api.service`
5. **Verify**: `systemctl status lawyer-api.service --no-pager`

### Frontend Updates (General Guideline)
*If the frontend requires updates:*
1. **Navigate** to the respective frontend folder, e.g., `cd /var/www/mohamy-smart-site`
2. **Pull Code**: `git pull`
3. **Build (if applicable)**: e.g., `npm run build`
4. **Restart**: Depending on the setup, you may need to restart Nginx (`systemctl restart nginx`) or a PM2/Node service if it's SSR.
