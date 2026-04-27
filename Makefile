# ── Mohamy Smart — Project Operations Command Surface ──────────────
#
# Usage:  make <target>
# Help:   make help
#
# All commands are invoked from the repository root.
# ─────────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help

# ── Repository Paths ─────────────────────────────────────────────
BACKEND_DIR     := mohamy-smart-backend
LAWYER_DIR      := apps/lawyer-dashboard
ADMIN_DIR       := apps/admin-dashboard
LANDING_DIR     := apps/landing

# ── Docker Compose Files ─────────────────────────────────────────
COMPOSE_FILE        := docker-compose.yml
COMPOSE_PROD_FILE   := docker-compose.prod.yml

# ── Environment Files ────────────────────────────────────────────
ENV_FILE            := .env.docker
ENV_PROD_FILE       := .env.docker.prod
ENV_TEMPLATE        := .env.docker.example
ENV_PROD_TEMPLATE   := .env.docker.prod.example

# ── .NET SDK ─────────────────────────────────────────────────────
DOTNET              := dotnet
DOTNET_EF           := dotnet ef

# ── SQL Container ────────────────────────────────────────────────
SQL_CONTAINER       := sqlserver
SQL_PORT            := 1433

# ── Canonical Ports ──────────────────────────────────────────────
BACKEND_PORT        := 8976
LAWYER_PORT         := 5078
ADMIN_PORT          := 5079
LANDING_PORT        := 3000

# ── Phony Targets ────────────────────────────────────────────────
.PHONY: help \
        dev down logs ps build rebuild \
        prod prod-down prod-logs prod-build \
        backend backend-rebuild lawyer admin landing \
        db-shell migrate migrate-add \
        install bundle-report \
        test test-backend test-lawyer test-admin \
        clean nuke

# ══════════════════════════════════════════════════════════════════
#  Internal helpers
# ══════════════════════════════════════════════════════════════════

define REQUIRE_ENV
	@if [ ! -f $(ENV_FILE) ]; then \
		echo ""; \
		echo "ERROR: $(ENV_FILE) not found."; \
		echo "  cp $(ENV_TEMPLATE) $(ENV_FILE)"; \
		echo "  Then fill in real values before running this command."; \
		echo ""; \
		exit 1; \
	fi
endef

define REQUIRE_ENV_PROD
	@if [ ! -f $(ENV_PROD_FILE) ]; then \
		echo ""; \
		echo "ERROR: $(ENV_PROD_FILE) not found."; \
		echo "  cp $(ENV_PROD_TEMPLATE) $(ENV_PROD_FILE)"; \
		echo "  Then fill in real production values before running this command."; \
		echo ""; \
		exit 1; \
	fi
endef

define PREFLIGHT_PORT_CHECK
	@echo "Checking if port $(BACKEND_PORT) is already in use..."
	@if lsof -Pi :$(BACKEND_PORT) -sTCP:LISTEN -t >/dev/null ; then \
		echo ""; \
		echo "ERROR: Port $(BACKEND_PORT) is already in use by another process."; \
		echo "This often happens if you are running the backend locally via 'dotnet run' or another Docker instance."; \
		echo "Please stop the conflicting process before starting Docker."; \
		echo ""; \
		exit 1; \
	fi
endef

define PRINT_DEV_ENDPOINTS
	@echo ""; \
	echo "──────────────────────────────────────────────────────"; \
	echo "  Mohamy Smart — Development Stack"; \
	echo "──────────────────────────────────────────────────────"; \
	echo "  Backend API    : http://localhost:$(BACKEND_PORT)"; \
	echo "  Lawyer Dashboard: http://localhost:$(LAWYER_PORT)"; \
	echo "  Admin Dashboard : http://localhost:$(ADMIN_PORT)"; \
	echo "  Landing Page    : http://localhost:$(LANDING_PORT)"; \
	echo "  SQL Server      : localhost,$(SQL_PORT)"; \
	echo "──────────────────────────────────────────────────────"; \
	echo "  Logs : make logs"; \
	echo "  Stop : make down"; \
	echo "──────────────────────────────────────────────────────"; \
	echo ""
endef

# ══════════════════════════════════════════════════════════════════
#  Help
# ══════════════════════════════════════════════════════════════════

help: ## Show this help message
	@echo ""; \
	echo "Mohamy Smart — Project Operations"; \
	echo ""; \
	echo "Usage: make <target>"; \
	echo ""; \
	echo "Lifecycle:"; \
	echo "  dev          Start the full development stack"; \
	echo "  down         Stop the development stack (preserves DB state)"; \
	echo "  logs         Stream development stack logs"; \
	echo "  ps           List running development services"; \
	echo "  build        Rebuild development images"; \
	echo "  rebuild      Remove old images, rebuild, and restart (preserves DB state)"; \
	echo ""; \
	echo "Production:"; \
	echo "  prod         Start the production-oriented stack"; \
	echo "  prod-down    Stop the production-oriented stack"; \
	echo "  prod-logs    Stream production-oriented stack logs"; \
	echo "  prod-build   Rebuild production-oriented images"; \
	echo ""; \
	echo "Services:"; \
	echo "  backend      Start backend + SQL Server only"; \
	echo "  backend-rebuild Rebuild and restart backend + SQL Server only"; \
	echo "  lawyer       Start lawyer dashboard only"; \
	echo "  admin        Start admin dashboard only"; \
	echo "  landing      Start landing page only"; \
	echo ""; \
	echo "Database:"; \
	echo "  db-shell     Open interactive SQL shell"; \
	echo "  migrate      Apply pending EF Core migrations (required on first run)"; \
	echo "  migrate-add  Create a new migration (NAME=...)"; \
	echo ""; \
	echo "Testing:"; \
	echo "  test         Run all tests (backend + dashboards)"; \
	echo "  test-backend Run backend tests only"; \
	echo "  test-lawyer  Run lawyer dashboard tests only"; \
	echo "  test-admin   Run admin dashboard tests only"; \
	echo ""; \
	echo "Cleanup:"; \
	echo "  clean        Remove containers & images (preserves DB state)"; \
	echo "  nuke         Remove everything including DB data volumes"; \
	echo ""; \
	echo "GitHub:"; \
	echo "  push         Push all changes to GitHub (requires MSG=...)"; \
	echo ""; \
	echo "Frontend:"; \
	echo "  install      Install npm dependencies for all frontend apps"; \
	echo "  bundle-report Build dashboards and open bundle analysis reports"; \
	echo ""

# ══════════════════════════════════════════════════════════════════
#  Full-Stack Lifecycle
# ══════════════════════════════════════════════════════════════════

dev: ## Start the full development stack
	$(REQUIRE_ENV)
	$(PREFLIGHT_PORT_CHECK)
	docker compose up -d
	$(PRINT_DEV_ENDPOINTS)

down: ## Stop the development stack (preserves DB state)
	$(REQUIRE_ENV)
	docker compose down

logs: ## Stream development stack logs
	$(REQUIRE_ENV)
	docker compose logs -f

ps: ## List running development services
	$(REQUIRE_ENV)
	docker compose ps

build: ## Rebuild development images
	$(REQUIRE_ENV)
	docker compose build

rebuild: ## Remove old images, rebuild, and restart (preserves DB state)
	$(REQUIRE_ENV)
	docker compose down --remove-orphans
	docker image prune -a -f
	docker compose build
	docker compose up -d
	@echo ""; \
	echo "Removed old unused images, rebuilt, and restarted the development stack."; \
	echo "Database state is preserved in the mohamy-sqlserver-data volume."; \
	echo "  To delete DB data too, run: make nuke"; \
	echo ""

# ══════════════════════════════════════════════════════════════════
#  Production-Oriented Lifecycle
# ══════════════════════════════════════════════════════════════════

prod: ## Start the production-oriented stack
	$(REQUIRE_ENV_PROD)
	docker compose --env-file $(ENV_PROD_FILE) -f $(COMPOSE_PROD_FILE) up -d --build
	@echo ""; \
	echo "Production-oriented stack started."; \
	echo "  Stop   : make prod-down"; \
	echo "  Logs   : make prod-logs"; \
	echo ""

prod-down: ## Stop the production-oriented stack
	$(REQUIRE_ENV_PROD)
	docker compose --env-file $(ENV_PROD_FILE) -f $(COMPOSE_PROD_FILE) down

prod-logs: ## Stream production-oriented stack logs
	$(REQUIRE_ENV_PROD)
	docker compose --env-file $(ENV_PROD_FILE) -f $(COMPOSE_PROD_FILE) logs -f

prod-build: ## Rebuild production-oriented images
	$(REQUIRE_ENV_PROD)
	docker compose --env-file $(ENV_PROD_FILE) -f $(COMPOSE_PROD_FILE) build

# ══════════════════════════════════════════════════════════════════
#  Service-Scoped Startup
# ══════════════════════════════════════════════════════════════════

backend: ## Start backend + SQL Server only
	$(REQUIRE_ENV)
	$(PREFLIGHT_PORT_CHECK)
	docker compose up -d sqlserver backend
	@echo ""; \
	echo "Backend started: http://localhost:$(BACKEND_PORT)"; \
	echo ""

backend-rebuild: ## Rebuild and restart backend + SQL Server only
	$(REQUIRE_ENV)
	docker compose up -d --build sqlserver backend
	@echo ""; \
	echo "Backend rebuilt and started: http://localhost:$(BACKEND_PORT)"; \
	echo ""

lawyer: ## Start lawyer dashboard only
	$(REQUIRE_ENV)
	docker compose up -d lawyer-dashboard
	@echo ""; \
	echo "Lawyer dashboard started: http://localhost:$(LAWYER_PORT)"; \
	echo ""

admin: ## Start admin dashboard only
	$(REQUIRE_ENV)
	docker compose up -d admin-dashboard
	@echo ""; \
	echo "Admin dashboard started: http://localhost:$(ADMIN_PORT)"; \
	echo ""

landing: ## Start landing page only
	$(REQUIRE_ENV)
	docker compose up -d landing
	@echo ""; \
	echo "Landing page started: http://localhost:$(LANDING_PORT)"; \
	echo ""

# ══════════════════════════════════════════════════════════════════
#  Database Workflows
# ══════════════════════════════════════════════════════════════════

db-shell: ## Open interactive SQL shell (connects as 'sa' using MSSQL_SA_PASSWORD)
	$(REQUIRE_ENV)
	@docker compose exec $(SQL_CONTAINER) /opt/mssql-tools18/bin/sqlcmd \
		-S localhost -U sa -P "$$(grep MSSQL_SA_PASSWORD $(ENV_FILE) | cut -d= -f2-)" \
		-C -Q "SELECT name FROM sys.databases;" > /dev/null 2>&1 && \
	docker compose exec $(SQL_CONTAINER) /opt/mssql-tools18/bin/sqlcmd \
		-S localhost -U sa -P "$$(grep MSSQL_SA_PASSWORD $(ENV_FILE) | cut -d= -f2-)" \
		-C || \
	(echo "ERROR: SQL Server container is not running. Run 'make backend' or 'make dev' first to start the instance."; exit 1)

DOTNET_ENV          := 

migrate: ## Apply pending EF Core migrations (required on first run)
	$(REQUIRE_ENV)
	cd $(BACKEND_DIR) && unset ConnectionStrings__SqlServer && $(DOTNET_ENV) $(DOTNET_EF) database update --project Lawyer.Infrastructure --startup-project Lawyer

migrate-add: ## Create a new migration (NAME=...)
	@if [ -z "$(NAME)" ]; then \
		echo ""; \
		echo "ERROR: Migration name is required."; \
		echo "  Usage: make migrate-add NAME=YourMigrationName"; \
		echo ""; \
		exit 1; \
	fi
	cd $(BACKEND_DIR) && $(DOTNET_ENV) $(DOTNET_EF) migrations add "$(NAME)" --project Lawyer.Infrastructure --startup-project Lawyer

# ══════════════════════════════════════════════════════════════════
#  Testing
# ══════════════════════════════════════════════════════════════════

test: test-backend test-lawyer test-admin ## Run all tests

test-backend: ## Run backend tests only
	cd $(BACKEND_DIR) && $(DOTNET) test

test-lawyer: ## Run lawyer dashboard tests only
	cd $(LAWYER_DIR) && npm run test -- --run

test-admin: ## Run admin dashboard tests only
	cd $(ADMIN_DIR) && npm run test -- --run

# ══════════════════════════════════════════════════════════════════
#  Frontend Utilities
# ══════════════════════════════════════════════════════════════════

install: ## Install npm dependencies for all frontend apps
	@echo "Installing dependencies for all frontend apps..."
	cd $(LAWYER_DIR) && npm install
	cd $(ADMIN_DIR) && npm install
	cd $(LANDING_DIR) && npm install
	@echo ""; \
	echo "All frontend dependencies installed."; \
	echo ""

bundle-report: ## Build dashboards and open bundle analysis reports
	@echo "Building lawyer dashboard..."
	cd $(LAWYER_DIR) && npm run build
	@echo "Building admin dashboard..."
	cd $(ADMIN_DIR) && npm run build
	@echo ""; \
	echo "Bundle reports generated:"; \
	echo "  Lawyer: $(LAWYER_DIR)/dist/bundle-report.html"; \
	echo "  Admin:  $(ADMIN_DIR)/dist/bundle-report.html"; \
	echo ""
	@open $(LAWYER_DIR)/dist/bundle-report.html 2>/dev/null || true
	@open $(ADMIN_DIR)/dist/bundle-report.html 2>/dev/null || true

# ══════════════════════════════════════════════════════════════════
#  Cleanup
# ══════════════════════════════════════════════════════════════════

clean: ## Remove containers & local images (preserves DB state)
	$(REQUIRE_ENV)
	docker compose down --rmi local --remove-orphans
	@echo ""; \
	echo "Cleaned up containers and local images. Database state is preserved."; \
	echo "  To delete DB data too, run: make nuke"; \
	echo ""

nuke: ## Remove everything including DB data volumes (requires confirmation)
	$(REQUIRE_ENV)
	@echo ""; \
	echo "WARNING: This will delete ALL local data volumes, including the SQL Server database."; \
	echo "This action cannot be undone."; \
	echo ""; \
	read -p "Type 'yes' to confirm destructive cleanup: " confirm; \
	if [ "$$confirm" != "yes" ]; then \
		echo "Aborted. No data was deleted."; \
		exit 0; \
	fi
	docker compose down -v --rmi local --remove-orphans
	@echo ""; \
	echo "Destructive cleanup complete. All containers, images, and volumes removed."; \
	echo ""

# ══════════════════════════════════════════════════════════════════
#  GitHub
# ══════════════════════════════════════════════════════════════════

MSG ?= Latest update

push: ## Push all changes to GitHub (uses MSG="Latest update" by default)
	git add .
	git commit -m "$(MSG)" || true
	git pull --rebase origin main
	git push origin main

