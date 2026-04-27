# Contract: Service Topology

## Purpose

Define the required service set, public addresses, and dependency expectations for the Docker setup.

## Local Development Topology

| Service | Required | Public Address | Depends On | Persistence |
|--------|--------|--------|--------|--------|
| SQL Server | Yes | `localhost:1433` | None | Database data persists across restarts |
| Backend API | Yes | `localhost:8976` | SQL Server readiness | Runtime logs persist for troubleshooting |
| Lawyer Dashboard | Yes | `localhost:5078` | Backend availability | None required beyond source workspace |
| Admin Dashboard | Yes | `localhost:5079` | Backend availability | None required beyond source workspace |
| Landing App | Yes | `localhost:3000` | None for startup, backend target for integrated flows | None required beyond source workspace |

## Production-Oriented Topology

| Service | Required | Public Address | Depends On | Persistence |
|--------|--------|--------|--------|--------|
| Database target | Yes | Environment-defined | None | Managed by selected database runtime |
| Backend API | Yes | Environment-defined | Database readiness | Logs persist according to runtime profile |
| Lawyer Dashboard | Yes | Environment-defined | Backend URL contract | Static runtime package |
| Admin Dashboard | Yes | Environment-defined | Backend URL contract | Static runtime package |
| Landing App | Yes | Environment-defined | Backend URL contract for integrated flows | Static runtime package |

## Dependency Rules

- Backend startup must wait for a valid database readiness signal in local Docker mode.
- Frontend services may start before the backend becomes ready, but the environment is not considered healthy until the backend is reachable.
- Production-oriented runtime must support either a bundled database service or an external database target without source-code edits.
- Direct browser refresh on any SPA route must resolve successfully in production-oriented mode.
- Direct browser navigation to exported landing routes must resolve successfully in production-oriented mode.
