# Quickstart Guide: Admin Dashboard API Hookups

## Active Integration Testing

Ensure both systems are functional:

1. Execute the mock backend or sandbox database:
   ```bash
   cd mohamy-smart-backend/Lawyer
   dotnet run
   ```

2. Boot the Next/Vite frontend interface:
   ```bash
   cd mohamy-smart-admin-dashboard
   npm run dev
   ```

3. Launch browser tooling observing the **Network Tab**.

### Validation Scenarios

- **Component Mount Hydration**: Navigate to the "Lawyers" tab. The table should initially glow with Skeleton loading states. A `GET` call targets the `/lawyers` backend path. The table seamlessly paints the resulting values once the Redux Promise resolves.
- **Parametric Paging**: Use the visual pagination controls. Observe the corresponding dispatch triggers altering `?page=` params via the network watcher, resulting in immediate UI list swaps.
- **Mutative Optimism**: Suspend an active item utilizing an action button. Observe an immediate `PUT / POST` request. Ensure the entire page *does not* hard-refresh, but the localized UI component automatically mirrors the updated suspended state.
