# Phase 0: Outline & Research

## Research Tasks Resolved

### Unknown: Excel Export Strategy
- **Decision**: Use frontend-side generation with the `xlsx` NPM package.
- **Rationale**: The Data Table already fetches the client's financial ledger via Redux Toolkit and Axios. Emitting an Excel sheet directly in the browser prevents an unnecessary roundtrip, preserves server resources, and ensures the export exactly matches the current filters and sorting applied by the user in the UI.
- **Alternatives considered**: Backend generation using `ClosedXML` in .NET. Rejected because it requires an additional API endpoint and downloading a file stream, which is over-engineered when the frontend has the full dataset.

### Unknown: Document Handling Upload Strategy
- **Decision**: Continue using the existing `.NET 9` backend file upload mechanisms (e.g., `IFormFile`) storing files locally on the server (e.g., inside `wwwroot/uploads/receipts` or similar mapped directory) and serving them statically or via an authorized endpoint.
- **Rationale**: Aligns with standard ASP.NET Core practices. The system already has a backend running on a dedicated Docker volume.
- **Alternatives considered**: External cloud storage like AWS S3 or Azure Blob Storage. Rejected as the infrastructure principles specify keeping dependencies to the SQL Server Docker and standard deployment. External storage can be configured generically later if needed.
