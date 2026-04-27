# خطة نشر Mohamy Smart — Production Server

> **IP**: `91.108.121.110` | **User**: `root`
> **آخر تحديث**: 2026-04-27

> [!CAUTION]
> بيانات الدخول محفوظة في ملف `.server-credentials` **المحلي فقط** — لا يُرفع أبداً على GitHub (مُدرج في `.gitignore`).

---

## نظرة عامة على المراحل

```
Phase 1 → تجهيز السيرفر (مرة واحدة)
Phase 2 → رفع الكود + بناء Docker
Phase 3 → Nginx + SSL
Phase 4 → المراقبة الدائمة (Monitoring)
Phase 5 → GitHub Auto-Deploy (CI/CD)
Phase 6 → حفظ بيانات السيرفر بأمان
```

---

## Phase 1 — تجهيز السيرفر (مرة واحدة)

### 1.1 الاتصال بالسيرفر

```bash
ssh root@91.108.121.110
```

### 1.2 تحديث النظام وتثبيت الأدوات

```bash
apt update && apt upgrade -y
apt install -y curl git ufw htop unzip make
```

### 1.3 تثبيت Docker + Docker Compose

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
docker --version
docker compose version
```

### 1.4 تأمين Firewall (UFW)

```bash
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw --force enable
ufw status
```

> [!WARNING]
> لا تفتح المنافذ 8976 / 5078 / 5079 / 3000 مباشرة — Nginx سيوجّه إليها داخلياً.

### 1.5 تثبيت Nginx

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

---

## Phase 2 — رفع الكود وبناء Docker

### 2.1 استنساخ المستودع على السيرفر

```bash
cd /opt
git clone https://github.com/mazenelsbaghh/mohamy-smart.git mohamy-smart
cd mohamy-smart
```

### 2.2 إعداد ملف البيانات الحساسة `.env.docker.prod`

```bash
cp .env.docker.prod.example .env.docker.prod
nano .env.docker.prod
```

**القيم الأساسية التي يجب تعبئتها:**

| المتغير | القيمة المطلوبة |
|---|---|
| `ConnectionStrings__SqlServer` | Connection string لقاعدة البيانات |
| `JWT__Key` | مفتاح عشوائي 32+ حرف |
| `OpenAI__ApiKey` | مفتاح OpenAI |
| `Gemini__ApiKey` | مفتاح Gemini |
| `Paymob__*` | بيانات Paymob |
| `EmailSettings__*` | بيانات SMTP |
| `AppSetting__BaseUrl` | `https://api.mohamy-smart.com` |
| `VITE_LAWYER_API_URL` | `https://api.mohamy-smart.com/api/v1` |
| `VITE_ADMIN_API_URL` | `https://api.mohamy-smart.com/api/v1` |

> [!IMPORTANT]
> ملف `.env.docker.prod` لا يُرفع أبداً — مُدرج في `.gitignore` بالفعل.

### 2.3 بناء وتشغيل Docker

```bash
cd /opt/mohamy-smart
docker compose --env-file .env.docker.prod -f docker-compose.prod.yml up -d --build
```

### 2.4 التحقق من تشغيل الـ Containers

```bash
docker compose --env-file .env.docker.prod -f docker-compose.prod.yml ps
```

---

## Phase 3 — Nginx كـ Reverse Proxy + SSL

### 3.1 تثبيت Certbot للـ SSL المجاني

```bash
apt install -y certbot python3-certbot-nginx
```

### 3.2 إعداد Nginx لكل domain

```bash
# API Backend
cat > /etc/nginx/sites-available/api.mohamy-smart.com << 'EOF'
server {
    listen 80;
    server_name api.mohamy-smart.com;
    location / {
        proxy_pass http://127.0.0.1:8976;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }
}
EOF

# Lawyer Dashboard
cat > /etc/nginx/sites-available/lawyer.mohamy-smart.com << 'EOF'
server {
    listen 80;
    server_name lawyer.mohamy-smart.com;
    location / {
        proxy_pass http://127.0.0.1:5078;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Admin Dashboard
cat > /etc/nginx/sites-available/admin.mohamy-smart.com << 'EOF'
server {
    listen 80;
    server_name admin.mohamy-smart.com;
    location / {
        proxy_pass http://127.0.0.1:5079;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Landing Page
cat > /etc/nginx/sites-available/mohamy-smart.com << 'EOF'
server {
    listen 80;
    server_name mohamy-smart.com www.mohamy-smart.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

### 3.3 تفعيل الـ Sites

```bash
ln -s /etc/nginx/sites-available/api.mohamy-smart.com    /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/lawyer.mohamy-smart.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/admin.mohamy-smart.com  /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/mohamy-smart.com        /etc/nginx/sites-enabled/

nginx -t
systemctl reload nginx
```

### 3.4 تفعيل SSL (HTTPS)

```bash
certbot --nginx \
  -d api.mohamy-smart.com \
  -d lawyer.mohamy-smart.com \
  -d admin.mohamy-smart.com \
  -d mohamy-smart.com \
  -d www.mohamy-smart.com \
  --non-interactive \
  --agree-tos \
  -m admin@mohamy-smart.com
```

---

## Phase 4 — المراقبة الدائمة (Monitoring)

### 4.1 Health Check Script (Auto-Restart)

```bash
mkdir -p /opt/mohamy-smart/scripts

cat > /opt/mohamy-smart/scripts/health-check.sh << 'SCRIPT'
#!/bin/bash
LOG=/var/log/mohamy-health.log
TS=$(date '+%Y-%m-%d %H:%M:%S')
DIR=/opt/mohamy-smart
CMD="docker compose --env-file $DIR/.env.docker.prod -f $DIR/docker-compose.prod.yml"

for svc in backend lawyer-dashboard admin-dashboard landing; do
    STATUS=$($CMD ps --format "{{.Service}}:{{.State}}" 2>/dev/null | grep "^$svc:" | cut -d: -f2)
    if [ "$STATUS" != "running" ]; then
        echo "[$TS] ⚠️  $svc DOWN (status: $STATUS) — Restarting..." >> $LOG
        $CMD restart $svc >> $LOG 2>&1
        echo "[$TS] ✅ $svc restarted." >> $LOG
    fi
done
SCRIPT

chmod +x /opt/mohamy-smart/scripts/health-check.sh
```

### 4.2 تشغيل Health Check كل دقيقة (Cron)

```bash
(crontab -l 2>/dev/null; echo "* * * * * /opt/mohamy-smart/scripts/health-check.sh") | crontab -
crontab -l   # تأكيد
```

### 4.3 Logrotate (لحماية القرص)

```bash
cat > /etc/logrotate.d/mohamy-smart << 'EOF'
/var/log/mohamy-health.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
EOF
```

### 4.4 أوامر المراقبة اليومية

```bash
# مشاهدة logs مباشرة
docker compose --env-file /opt/mohamy-smart/.env.docker.prod \
  -f /opt/mohamy-smart/docker-compose.prod.yml logs -f

# log الصحة
tail -f /var/log/mohamy-health.log

# إحصائيات الموارد
docker stats

# مساحة القرص
df -h
```

---

## Phase 5 — GitHub Auto-Deploy (CI/CD)

### 5.1 Deploy Script على السيرفر

```bash
cat > /opt/mohamy-smart/scripts/deploy.sh << 'SCRIPT'
#!/bin/bash
set -e
cd /opt/mohamy-smart

echo "🔄 Pulling latest code..."
git pull origin main

echo "🐳 Rebuilding Docker images..."
docker compose --env-file .env.docker.prod -f docker-compose.prod.yml up -d --build

echo "🧹 Cleaning unused images..."
docker image prune -f

echo "✅ Deploy complete at $(date)"
SCRIPT

chmod +x /opt/mohamy-smart/scripts/deploy.sh
```

### 5.2 GitHub Actions Workflow

أنشئ هذا الملف في المشروع المحلي (يُرفع على GitHub):

**`.github/workflows/deploy.yml`**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          password: ${{ secrets.SERVER_PASSWORD }}
          script: /opt/mohamy-smart/scripts/deploy.sh
```

### 5.3 إضافة Secrets في GitHub

1. افتح: `github.com/mazenelsbaghh/mohamy-smart`
2. `Settings → Secrets and variables → Actions → New repository secret`
3. أضف هذه الـ Secrets:

| اسم الـ Secret | القيمة |
|---|---|
| `SERVER_HOST` | `91.108.121.110` |
| `SERVER_USER` | `root` |
| `SERVER_PASSWORD` | (من ملف `.server-credentials`) |

> [!IMPORTANT]
> بعد إضافة الـ Secrets، أي `git push` على `main` سيُنشر تلقائياً على السيرفر!

---

## Phase 6 — حفظ بيانات السيرفر بأمان (محلياً)

### إنشاء ملف `.server-credentials`

```bash
cat > /Users/mazenelsbagh/"mazen mac"/apps/"mohamy smart"/.server-credentials << 'EOF'
# بيانات السيرفر — لا يُرفع على GitHub أبداً
SERVER_IP=91.108.121.110
SERVER_USER=root
SERVER_PASSWORD=P.jgT8eJXZ46Y3zx
SERVER_URL=http://91.108.121.110
SSH_CMD=ssh root@91.108.121.110
EOF
```

### إضافته لـ `.gitignore`

```bash
echo ".server-credentials" >> .gitignore
```

---

## Checklist الكامل — ترتيب التنفيذ

- [ ] **DNS**: وجّه الـ domains إلى IP `91.108.121.110`
- [ ] **Phase 1**: اتصال SSH → تحديث النظام → Docker → UFW → Nginx
- [ ] **Phase 2**: `git clone` → إعداد `.env.docker.prod` → `docker compose up -d --build`
- [ ] **Phase 3**: إعداد Nginx sites → تفعيل → `certbot` للـ SSL
- [ ] **Phase 4**: رفع `health-check.sh` → cron كل دقيقة → logrotate
- [ ] **Phase 5**: إنشاء `deploy.sh` → إضافة GitHub Secrets → workflow
- [ ] **Phase 6**: إنشاء `.server-credentials` محلياً → إضافة للـ `.gitignore`

---

> [!NOTE]
> **المنافذ الداخلية بعد النشر:**
> - Backend API: `:8976` (داخلي فقط)
> - Lawyer Dashboard: `:5078` (داخلي فقط)
> - Admin Dashboard: `:5079` (داخلي فقط)
> - Landing Page: `:3000` (داخلي فقط)
> - جميعها يصلها المستخدم عبر Nginx على 80/443 فقط.
