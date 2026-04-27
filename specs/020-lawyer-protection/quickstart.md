# Quickstart: Lawyer Agenda Roll and Protection Features

## Getting Started

1. **Database Migration**
   - Since we are modifying the `PowerOfAttorney` entity to have an `IsCanceled` field (and creating new entities `DocumentHandoff` and `ClientTransaction`), you will need to add an EF Core migration.
   - Run `make dev` to bring up the Docker environment (SQL Server running).
   - In another terminal, run: `make db-migrate-add "LawyerProtectionFeatures"` (or use the equivalent CLI command in the backend folder).
   - Update the database: `make db-migrate`

2. **Backend Services Updates**
   - Implement the `Canceled` toggle in `PowerOfAttorneyService`.
   - Ensure the `CaseService` explicitly rejects creating links with canceled POAs.
   - Create Controllers and Services for `DocumentHandoff` and `ClientTransaction`.
   - Update the `SessionService` to return data matching the DTO needed for the Agenda Roll.

3. **Frontend Dashboard Updates**
   - **Agenda Roll**: Create a Data Table variant in the Lawyer Dashboard's Agenda section. Wire it up via Axios and Redux to fetch `/api/Sessions/agenda-roll`.
   - **Canceled POA UI**: Implement the capability to mark a POA as canceled on the client details page. Apply warning styling (red badges) and block it from appearing in Case creation select menus.
   - **Document Handoff**: Add a "Documents Handed Over" tab on the Client details page with a form allowing `multipart/form-data` uploads using Axios.
   - **Financials / Excel**: Add a "Financials" tab on the Client details page. Use the `xlsx` library to take the fetched transaction data array and export it as an Excel spreadsheet locally.

4. **Testing**
   - Verify that uploading a receipt file works correctly and the path is retrieved securely.
   - Confirm that a Canceled POA triggers the necessary validation failures.
   - Export an Excel sheet matching the exact visible rows on the UI.
