# Quickstart: Testing Phase 3 Consistency

This quickstart guides you on testing the unified constraints introduced in Phase 3.

### 1. External Prompt Configuration Test
If you want to rapidly test instructions to the Defense Memo feature (Stage 1), you no longer need to edit `SmartAnalysisService.cs`. 
1. Open `mohamy-smart-backend/Lawyer/wwwroot/prompts/المرحلة الأولى إعداد مذكرة الدفاع/system-defenses-prompt.txt`.
2. Alter the text (e.g. add a line `!! TEST SYSTEM !!`).
3. Save the file and trigger a frontend analysis run. The generated response will instantly adapt to your instruction.

### 2. Validating Standard Error Output
To verify schema bounds validation works:
1. Boot the application backend (`make dev` or `make run-backend`).
2. Run a standard `POST` request to create the final stage of *Ruling Analysis*.
3. Purposefully omit a required identifier in the Request Body that maps to the new `StepOutputSchemas.cs`.
4. Observe that you receive a unified `400 BadRequest` containing a JSON error structure with `isSuccess: false` and a localized message.

### 3. Execution Abandonment
To verify workflow cancellations:
1. Begin a *Statement of Claims* pipeline in the browser.
2. Before the async job concludes, invoke `POST /api/Claims/.../abandon`.
3. The SQL record will immediately flag as Abandoned, clearing the SignalR polling dependency safely.
