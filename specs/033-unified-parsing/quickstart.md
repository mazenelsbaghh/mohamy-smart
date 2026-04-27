# Quickstart

Due to the purely backend-organizational nature of this architecture consolidation, no new external dependencies or operational processes have been introduced.

### Local Development Test

There are no new `.env` tokens or configuration files needed for this feature phase. To verify the new unified parsing boundaries setup:

1. Bring the environment up via the root makefile:
   ```bash
   make dev
   ```
2. Navigate to any backend codebase tests or test locally to verify that a standard workflow step succeeds.
3. Observe backend logs ensuring that no `Newtonsoft.Json` exception dependencies continue being called.

### Validating AI Payloads
Ensure that frontend calls directly conform to passing `caseId` and `stepNumber` dynamically with the `RunWorkflowStepRequest`.
