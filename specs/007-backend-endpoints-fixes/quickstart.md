# Quickstart: Backend Endpoints Fixes (Phase 6)

## Setup Requirements
1. Ensure the PostgreSQL/SQL Server database container is running and accessible (IP: 91.108.121.110 according to Config or local proxy).
2. Configure `.env` or `appsettings.Development.json` avoiding any commits of secrets to Git.
3. Validate Entity Framework Core CLI is installed (`dotnet tool install --global dotnet-ef`).

## Testing Flow (Local)

1. Boot up the backend API under `http://localhost:8976`.
   ```bash
   cd src/Lawyer
   dotnet run
   ```
2. In Postman, simulate login via standard mechanism to acquire a JWT token holding `{ "role": "Admin" }`. 
3. Perform the integration tests outlined in the Phase spec:
   - `GET http://localhost:8976/api/reports/lawyers`
   - `GET http://localhost:8976/api/reports/subscriptions`
   - `PATCH http://localhost:8976/api/lawyers/{id}/status`
   - `PUT http://localhost:8976/api/plans/{id}`

4. Verify correct integration with Phase 5 frontend dashboard connections.
