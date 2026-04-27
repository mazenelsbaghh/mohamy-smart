# Tasks: Persistent AI Job State

**Input**: Design documents from `/specs/017-persist-ai-job-state/`  
**Branch**: `017-persist-ai-job-state`  
**Tests**: Not requested — no test tasks included.  
**Organization**: Tasks grouped by user story (US1, US2, US3). Each phase is independently testable.

---

## CRITICAL CONTEXT FOR IMPLEMENTER

Read this before touching any file:

**Project root**: `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/`

**Backend** (C# .NET 9):
- Entry project: `mohamy-smart-backend/Lawyer/` — controllers, Program.cs, hubs
- Business logic: `mohamy-smart-backend/Lawyer.Application/` — services, DTOs, interfaces (note: namespace is `Lawyer.Application`)
- Domain: `mohamy-smart-backend/Lawyer.Core/` — entities (in `Models/`), enums (in `Enum/`), interfaces (in `Interface/`)
- Database: `mohamy-smart-backend/Lawyer.Infrastracture/` — **note the typo: "Infrastracture" not "Infrastructure"**, namespace `Lawyer.Infrastracture`
- DbContext: `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`, class `AppDbContext`
- All controllers extend `AppControllerBase` from `Lawyer.Controllers.Base`
- Services registered via `AddApplication()` in `Lawyer.Application/DependencyInjection.cs`
- Infrastructure registered via `AddInfrastructure()` in `Lawyer.Infrastracture/DependencyInjection.cs` (find the existing file)
- DB connection string key: `"SqlServer"` (not `"DefaultConnection"`) — check `Program.cs`

**Frontend** (React 19 + TypeScript):
- Root: `mohamy-smart-lawyer-dashboard/src/`
- Redux slices: `src/redux/{feature}/` — each has a slice file + `thunk/` subfolder
- Store: `src/redux/store.ts`
- Existing analysis slice: `src/redux/analysis/smartAnalysis/SmartAnalysis.ts`
- Existing case slice: `src/redux/cases/casesSlice.ts`
- Loading type: imported from `../../types/types` as `TLoading` (values: `'idle' | 'pending' | 'succeeded' | 'failed'`)
- Error guard: `import { isString } from '../../utils/guards'`
- Axios instance: check existing thunks for the import pattern

**Do NOT**:
- Add `Lawyer.Core` references to `Lawyer.Infrastracture` (allowed: Infrastracture → Core)
- Add `Lawyer.Application` references to `Lawyer` entry project's controllers directly — use interfaces
- Add `Lawyer.Infrastracture` references to `Lawyer.Application`
- Use `"DefaultConnection"` as connection string name — it's `"SqlServer"`
- Use `lucide-react` package — it's not installed. Use `react-icons/lu` instead

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase
- **[Story]**: User story this task serves
- Exact file paths listed in every task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Hangfire and SignalR packages. No code changes yet — just package installation and npm install.

- [x] T001 Add Hangfire NuGet packages: in `mohamy-smart-backend/Lawyer/Lawyer.csproj`, run `dotnet add package Hangfire.AspNetCore --version 1.8.*` and `dotnet add package Hangfire.SqlServer --version 1.8.*` from the `mohamy-smart-backend/Lawyer/` directory. Verify the packages appear in the `.csproj` file under `<ItemGroup>`.

- [x] T002 Add Hangfire.Core to Application layer: in `mohamy-smart-backend/Lawyer.Application/`, run `dotnet add package Hangfire.Core --version 1.8.*`. This allows the Application layer to reference `IBackgroundJobClient` without depending on the entry project.

- [x] T003 [P] Install SignalR npm client: in `mohamy-smart-lawyer-dashboard/`, run `npm install @microsoft/signalr`. Verify `@microsoft/signalr` appears in `package.json` dependencies.

**Checkpoint**: `dotnet build mohamy-smart-backend/` compiles without errors. `npm install` completes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend entity, enums, DbContext, Hangfire registration, SignalR registration. Frontend slice skeleton. MUST complete before any user story.

**⚠️ CRITICAL**: No user story work begins until Phase 2 is complete.

### Backend — Enums

- [x] T004 [P] Create `AiJobStatus` enum in `mohamy-smart-backend/Lawyer.Core/Enum/AiJobStatus.cs`:
  ```csharp
  namespace Lawyer.Core.Enum
  {
      public enum AiJobStatus
      {
          Queued = 0,
          Processing = 1,
          Completed = 2,
          Failed = 3,
      }
  }
  ```

- [x] T005 [P] Create `AiStepType` enum in `mohamy-smart-backend/Lawyer.Core/Enum/AiStepType.cs`:
  ```csharp
  namespace Lawyer.Core.Enum
  {
      public enum AiStepType
      {
          // Smart Analysis workflow
          FactAnalysis = 1,
          GenerateDefenses = 2,
          AnalysisDefense = 3,
          FinalRequirements = 4,
          // Preparing Statement of Claims workflow
          LawsuitCaseType = 10,
          LawsuitParties = 11,
          LawsuitSubjects = 12,
          LawsuitFacts = 13,
          LawsuitLegalBasis = 14,
          LawsuitRequests = 15,
          // Document processing
          Ocr = 20,
      }
  }
  ```

### Backend — Entity

- [x] T006 Create `AiJob` entity in `mohamy-smart-backend/Lawyer.Core/Models/AiJob.cs`. Do NOT extend `BaseEntity<T>` — `AiJob` has its own primary key strategy and does not need `CreatedBy`/`UpdatedBy` tracking. Use this exact class:
  ```csharp
  using Lawyer.Core.Enum;
  
  namespace Lawyer.Core.Models
  {
      public class AiJob
      {
          public Guid Id { get; set; } = Guid.NewGuid();
          public Guid CaseId { get; set; }
          public Case Case { get; set; } = null!;
          public AiStepType StepType { get; set; }
          public AiJobStatus Status { get; set; } = AiJobStatus.Queued;
          public string? HangfireJobId { get; set; }
          public string? ResultJson { get; set; }
          public string? ErrorMessage { get; set; }
          public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
          public DateTime? StartedAt { get; set; }
          public DateTime? CompletedAt { get; set; }
      }
  }
  ```

### Backend — DbContext

- [x] T007 Add `AiJob` to `AppDbContext` in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`:
  1. Add this line after the last existing `DbSet<...>` property (before `SaveChangesAsync`):
     ```csharp
     public DbSet<AiJob> AiJobs { get; set; } = null!;
     ```
  2. In `OnModelCreating`, add the unique index **inside** the existing `builder` block:
     ```csharp
     builder.Entity<AiJob>(entity =>
     {
         entity.HasKey(e => e.Id);
         entity.HasIndex(e => new { e.CaseId, e.StepType })
               .HasFilter("[Status] IN (0, 1)")
               .IsUnique()
               .HasDatabaseName("UX_AiJobs_CaseId_StepType_Active");
         entity.HasOne(e => e.Case)
               .WithMany()
               .HasForeignKey(e => e.CaseId)
               .OnDelete(DeleteBehavior.Cascade);
     });
     ```

### Backend — EF Migration

- [x] T008 Create EF Core migration for `AiJobs` table. Run from the repo root (`mohamy-smart-backend/`):
  ```bash
  dotnet ef migrations add AddAiJobsTable \
    --project Lawyer.Infrastracture \
    --startup-project Lawyer \
    --output-dir Migrations
  ```
  Then apply: `dotnet ef database update --project Lawyer.Infrastracture --startup-project Lawyer`
  
  Verify the generated migration file creates an `AiJobs` table with columns: `Id`, `CaseId`, `StepType`, `Status`, `HangfireJobId`, `ResultJson`, `ErrorMessage`, `CreatedAt`, `StartedAt`, `CompletedAt`.

### Backend — DTOs

- [x] T009 [P] Create `AiJobStatusDto` in `mohamy-smart-backend/Lawyer.Application/Dtos/AiJobs/AiJobStatusDto.cs` (create the `AiJobs/` subfolder):
  ```csharp
  using Lawyer.Core.Enum;
  
  namespace Lawyer.Application.Dtos.AiJobs
  {
      public record AiJobStatusDto(
          Guid Id,
          Guid CaseId,
          AiStepType StepType,
          AiJobStatus Status,
          string? ResultJson,
          string? ErrorMessage,
          DateTime CreatedAt,
          DateTime? CompletedAt
      );
  }
  ```

- [x] T010 [P] Create `SubmitAiJobDto` in `mohamy-smart-backend/Lawyer.Application/Dtos/AiJobs/SubmitAiJobDto.cs`:
  ```csharp
  using Lawyer.Core.Enum;
  
  namespace Lawyer.Application.Dtos.AiJobs
  {
      public record SubmitAiJobDto(
          AiStepType StepType,
          string? InputJson
      );
  }
  ```

### Backend — Service Interface

- [x] T011 Create `IAiJobService` interface in `mohamy-smart-backend/Lawyer.Application/IServices/IAiJobService.cs`:
  ```csharp
  using Lawyer.Application.Dtos.AiJobs;
  using Lawyer.Core.Enum;
  using Lawyer.Core.Exceptions;
  
  namespace Lawyer.Application.IServices
  {
      public interface IAiJobService
      {
          /// <summary>Returns all AiJob records for a case, ordered by StepType.</summary>
          Task<Result<List<AiJobStatusDto>>> GetAllByCaseAsync(Guid caseId, CancellationToken ct);
  
          /// <summary>Returns the AiJob for a specific case+step, or null if none exists.</summary>
          Task<Result<AiJobStatusDto>> GetByCaseAndStepAsync(Guid caseId, AiStepType step, CancellationToken ct);
  
          /// <summary>
          /// Creates a new AiJob and enqueues it via Hangfire.
          /// If an active (Queued or Processing) job already exists for this case+step,
          /// returns the existing job without creating a duplicate.
          /// </summary>
          Task<Result<AiJobStatusDto>> SubmitAsync(Guid caseId, SubmitAiJobDto dto, CancellationToken ct);
  
          /// <summary>
          /// Creates a new retry job for a Failed step.
          /// Returns Conflict if the current job is not in Failed state.
          /// </summary>
          Task<Result<AiJobStatusDto>> RetryAsync(Guid caseId, AiStepType step, SubmitAiJobDto dto, CancellationToken ct);
      }
  }
  ```

### Backend — SignalR Hub

- [x] T012 Create the `AiJobHub` SignalR hub in `mohamy-smart-backend/Lawyer/Hubs/AiJobHub.cs` (create the `Hubs/` directory):
  ```csharp
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.SignalR;
  
  namespace Lawyer.Hubs
  {
      [Authorize]
      public class AiJobHub : Hub
      {
          /// <summary>Client calls this after connecting to subscribe to a case's job updates.</summary>
          public async Task JoinCase(int caseId)
          {
              await Groups.AddToGroupAsync(Context.ConnectionId, $"case-{caseId}");
          }
  
          /// <summary>Client calls this on component unmount to unsubscribe.</summary>
          public async Task LeaveCase(int caseId)
          {
              await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"case-{caseId}");
          }
      }
  }
  ```
  Note: `caseId` is `int` here because `Case.Id` is `Guid` in the model but the frontend uses an int — check the existing Case entity. If `Case.Id` is `Guid`, change `int caseId` to `Guid caseId` in both methods and update the group key format accordingly.

### Backend — Hangfire + SignalR Registration in Program.cs

- [x] T013 Register Hangfire and SignalR in `mohamy-smart-backend/Lawyer/Program.cs`:

  **Step A** — Add `using` statements at the top of the file:
  ```csharp
  using Hangfire;
  using Hangfire.SqlServer;
  using Lawyer.Hubs;
  ```

  **Step B** — After `builder.Services.AddApplication().AddInfrastructure(builder.Configuration);`, add:
  ```csharp
  // ── Hangfire (background job queue) ──────────────────────────────────
  builder.Services.AddHangfire(config => config
      .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
      .UseSimpleAssemblyNameTypeSerializer()
      .UseRecommendedSerializerSettings()
      .UseSqlServerStorage(builder.Configuration.GetConnectionString("SqlServer"),
          new SqlServerStorageOptions
          {
              CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
              SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
              QueuePollInterval = TimeSpan.Zero,
              UseRecommendedIsolationLevel = true,
              DisableGlobalLocks = true,
          }));
  builder.Services.AddHangfireServer();
  
  // ── SignalR ───────────────────────────────────────────────────────────
  builder.Services.AddSignalR();
  ```

  **Step C** — After `app.MapControllers();`, add:
  ```csharp
  // ── SignalR hub ───────────────────────────────────────────────────────
  app.MapHub<AiJobHub>("/hubs/ai-jobs");
  
  // ── Hangfire dashboard (Admin only) ──────────────────────────────────
  app.UseHangfireDashboard("/hangfire", new DashboardOptions
  {
      Authorization = new[] { new Hangfire.Dashboard.LocalRequestsOnlyAuthorizationFilter() }
  });
  ```
  Note: `LocalRequestsOnlyAuthorizationFilter` restricts the dashboard to localhost. For production, swap this with a custom filter that checks `[Authorize(Roles="Admin")]`.

  **Step D** — Configure JWT to accept token from SignalR query string. Find the `AddJwtBearer` configuration in `Program.cs` or in `Lawyer.API.Extensions/WebApplicationServicesExtensions.cs`. Inside the `JwtBearerEvents`, add an `OnMessageReceived` handler:
  ```csharp
  OnMessageReceived = context =>
  {
      var accessToken = context.Request.Query["access_token"];
      var path = context.HttpContext.Request.Path;
      if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
      {
          context.Token = accessToken;
      }
      return Task.CompletedTask;
  }
  ```

### Backend — Service Registration

- [x] T014 Register `IAiJobService` in the Application DI. Open `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`. Add the registration after the existing service registrations:
  ```csharp
  services.AddScoped<IAiJobService, AiJobService>();
  ```
  Note: `AiJobService` will be created in Phase 3. Add a `// TODO: T014 — AiJobService implementation in Phase 3` comment for now, OR do this step after T019 (AiJobService implementation). Preferably complete T019 first so the DI registration compiles.

### Frontend — aiJobsSlice skeleton

- [x] T015 Create `src/redux/aiJobs/aiJobsSlice.ts` in the lawyer dashboard. This is the state container for job metadata. Create the file with this content:
  ```typescript
  import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
  import type { TLoading } from "../../types/types";
  
  export type AiJobStatus = 'queued' | 'processing' | 'completed' | 'failed';
  
  export type AiStepType =
      | 'FactAnalysis' | 'GenerateDefenses' | 'AnalysisDefense' | 'FinalRequirements'
      | 'LawsuitCaseType' | 'LawsuitParties' | 'LawsuitSubjects'
      | 'LawsuitFacts' | 'LawsuitLegalBasis' | 'LawsuitRequests'
      | 'Ocr';
  
  export type AiJob = {
      id: string;
      caseId: string;
      stepType: AiStepType;
      status: AiJobStatus;
      resultJson: string | null;
      errorMessage: string | null;
      createdAt: string;
      completedAt: string | null;
  };
  
  type TAiJobsState = {
      jobs: Partial<Record<AiStepType, AiJob>>;
      loading: TLoading;
      error: string | null;
  };
  
  const initialState: TAiJobsState = {
      jobs: {},
      loading: 'idle',
      error: null,
  };
  
  const aiJobsSlice = createSlice({
      name: 'aiJobs',
      initialState,
      reducers: {
          upsertJob(state, action: PayloadAction<AiJob>) {
              state.jobs[action.payload.stepType] = action.payload;
          },
          resetAiJobs(state) {
              state.jobs = {};
              state.loading = 'idle';
              state.error = null;
          },
      },
      extraReducers: () => {
          // thunks will be added in later phases
      },
  });
  
  export const { upsertJob, resetAiJobs } = aiJobsSlice.actions;
  export default aiJobsSlice.reducer;
  ```

- [x] T016 Add `aiJobsReducer` to the Redux store in `src/redux/store.ts`. Open the file, import the reducer, and add it to the `reducer` map:
  ```typescript
  import aiJobsReducer from './aiJobs/aiJobsSlice';
  // Inside configureStore's reducer object, add:
  aiJobs: aiJobsReducer,
  ```

**Checkpoint**: `dotnet build mohamy-smart-backend/` passes. `npm run build` (or `npm run dev`) in the lawyer dashboard compiles without TypeScript errors.

---

## Phase 3: User Story 1 — AI Results Persist After Page Refresh (Priority: P1) 🎯 MVP

**Goal**: When a lawyer completes any AI step and refreshes the page, the result is immediately restored from the server — no re-trigger needed.

**Independent Test**: Complete the "تحليل الوقائع" (Fact Analysis) step. Refresh the browser. The analysis result must be displayed without clicking anything.

### Backend — AiJobService Implementation

- [x] T017 Create `AiJobService` in `mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs`. This service handles idempotent job creation and querying. Create the file:
  ```csharp
  using Hangfire;
  using Lawyer.Application.Dtos.AiJobs;
  using Lawyer.Application.IServices;
  using Lawyer.Application.Common.Interface;
  using Lawyer.Core.Enum;
  using Lawyer.Core.Exceptions;
  using Lawyer.Core.Models;
  using Microsoft.EntityFrameworkCore;
  using System.Net;
  
  namespace Lawyer.Application.Services
  {
      public class AiJobService : IAiJobService
      {
          private readonly IApplicationDbContext _db;
          private readonly IBackgroundJobClient _hangfire;
  
          public AiJobService(IApplicationDbContext db, IBackgroundJobClient hangfire)
          {
              _db = db;
              _hangfire = hangfire;
          }
  
          public async Task<Result<List<AiJobStatusDto>>> GetAllByCaseAsync(Guid caseId, CancellationToken ct)
          {
              var jobs = await _db.AiJobs
                  .Where(j => j.CaseId == caseId)
                  .OrderBy(j => j.StepType)
                  .Select(j => ToDto(j))
                  .ToListAsync(ct);
              return Result<List<AiJobStatusDto>>.Success(jobs);
          }
  
          public async Task<Result<AiJobStatusDto>> GetByCaseAndStepAsync(Guid caseId, AiStepType step, CancellationToken ct)
          {
              var job = await _db.AiJobs
                  .Where(j => j.CaseId == caseId && j.StepType == step)
                  .OrderByDescending(j => j.CreatedAt)
                  .FirstOrDefaultAsync(ct);
  
              if (job == null)
                  return Result<AiJobStatusDto>.Error(HttpStatusCode.NotFound, "No job found for this case and step.");
  
              return Result<AiJobStatusDto>.Success(ToDto(job));
          }
  
          public async Task<Result<AiJobStatusDto>> SubmitAsync(Guid caseId, SubmitAiJobDto dto, CancellationToken ct)
          {
              // Idempotency: return existing active job if one already exists
              var existing = await _db.AiJobs
                  .Where(j => j.CaseId == caseId && j.StepType == dto.StepType
                              && (j.Status == AiJobStatus.Queued || j.Status == AiJobStatus.Processing))
                  .FirstOrDefaultAsync(ct);
  
              if (existing != null)
                  return Result<AiJobStatusDto>.Success(ToDto(existing), HttpStatusCode.OK);
  
              // Create new job record
              var job = new AiJob
              {
                  CaseId = caseId,
                  StepType = dto.StepType,
                  Status = AiJobStatus.Queued,
              };
              _db.AiJobs.Add(job);
              await _db.SaveChangesAsync(ct);
  
              // Enqueue Hangfire background job
              var hangfireId = _hangfire.Enqueue<IAiJobWorker>(
                  worker => worker.ProcessAsync(job.Id, dto.InputJson, null));
  
              job.HangfireJobId = hangfireId;
              await _db.SaveChangesAsync(ct);
  
              return Result<AiJobStatusDto>.Success(ToDto(job), HttpStatusCode.Accepted);
          }
  
          public async Task<Result<AiJobStatusDto>> RetryAsync(Guid caseId, AiStepType step, SubmitAiJobDto dto, CancellationToken ct)
          {
              var existing = await _db.AiJobs
                  .Where(j => j.CaseId == caseId && j.StepType == step && j.Status == AiJobStatus.Failed)
                  .OrderByDescending(j => j.CreatedAt)
                  .FirstOrDefaultAsync(ct);
  
              if (existing == null)
                  return Result<AiJobStatusDto>.Error(HttpStatusCode.Conflict,
                      "Job is not in a failed state. Only failed jobs can be retried.");
  
              // Archive the failed job then submit fresh
              return await SubmitAsync(caseId, dto, ct);
          }
  
          private static AiJobStatusDto ToDto(AiJob j) => new(
              j.Id, j.CaseId, j.StepType, j.Status,
              j.ResultJson, j.ErrorMessage, j.CreatedAt, j.CompletedAt);
      }
  }
  ```
  Note: `IApplicationDbContext` is in `Lawyer.Application.Common.Interface` — find the exact namespace by checking `mohamy-smart-backend/Lawyer.Core/Interface/IApplicationDbContext.cs`. The interface must have `DbSet<AiJob> AiJobs`.

- [x] T018 Add `DbSet<AiJob> AiJobs` to `IApplicationDbContext` interface in `mohamy-smart-backend/Lawyer.Core/Interface/IApplicationDbContext.cs`. Open the file and add:
  ```csharp
  DbSet<AiJob> AiJobs { get; set; }
  ```
  alongside the other `DbSet<>` declarations.

- [x] T019 Create `IAiJobWorker` interface in `mohamy-smart-backend/Lawyer.Application/IServices/IAiJobWorker.cs`. This is the interface Hangfire invokes:
  ```csharp
  namespace Lawyer.Application.IServices
  {
      public interface IAiJobWorker
      {
          /// <summary>
          /// Called by Hangfire to execute the AI operation for the given job ID.
          /// jobId: the AiJob.Id in the database.
          /// inputJson: the serialized input payload for the AI call.
          /// cancellationToken: provided by Hangfire.
          /// </summary>
          Task ProcessAsync(Guid jobId, string? inputJson, CancellationToken? cancellationToken);
      }
  }
  ```

- [x] T020 [US1] Create `AiJobWorker` implementation in `mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs`. This is the Hangfire job handler that calls the actual AI service and saves results:
  ```csharp
  using Hangfire;
  using Lawyer.Application.Common.Interface;
  using Lawyer.Application.IServices;
  using Lawyer.Core.Enum;
  using Lawyer.Core.Models;
  using Microsoft.EntityFrameworkCore;
  using Microsoft.Extensions.Logging;
  using System.Text.Json;
  
  namespace Lawyer.Application.Services
  {
      public class AiJobWorker : IAiJobWorker
      {
          private readonly IApplicationDbContext _db;
          private readonly ISmartAnalysisService _smartAnalysis;
          private readonly ILogger<AiJobWorker> _logger;
  
          public AiJobWorker(
              IApplicationDbContext db,
              ISmartAnalysisService smartAnalysis,
              ILogger<AiJobWorker> logger)
          {
              _db = db;
              _smartAnalysis = smartAnalysis;
              _logger = logger;
          }
  
          [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 3600 })]
          public async Task ProcessAsync(Guid jobId, string? inputJson, CancellationToken? cancellationToken)
          {
              var ct = cancellationToken ?? CancellationToken.None;
  
              var job = await _db.AiJobs.FindAsync(new object[] { jobId }, ct);
              if (job == null)
              {
                  _logger.LogWarning("AiJobWorker: Job {JobId} not found in DB. Skipping.", jobId);
                  return;
              }
  
              // Mark as Processing
              job.Status = AiJobStatus.Processing;
              job.StartedAt = DateTime.UtcNow;
              await _db.SaveChangesAsync(ct);
  
              try
              {
                  var resultJson = await ExecuteStepAsync(job.StepType, job.CaseId, inputJson, ct);
  
                  job.Status = AiJobStatus.Completed;
                  job.ResultJson = resultJson;
                  job.CompletedAt = DateTime.UtcNow;
                  await _db.SaveChangesAsync(ct);
  
                  _logger.LogInformation("AiJobWorker: Job {JobId} ({StepType}) completed.", jobId, job.StepType);
              }
              catch (Exception ex)
              {
                  job.Status = AiJobStatus.Failed;
                  job.ErrorMessage = ex.Message;
                  job.CompletedAt = DateTime.UtcNow;
                  await _db.SaveChangesAsync(ct);
  
                  _logger.LogError(ex, "AiJobWorker: Job {JobId} ({StepType}) failed.", jobId, job.StepType);
                  throw; // re-throw so Hangfire triggers AutomaticRetry
              }
          }
  
          private async Task<string> ExecuteStepAsync(AiStepType step, Guid caseId, string? inputJson, CancellationToken ct)
          {
              // For each step type, deserialize the input, call the existing service, and serialize the result.
              // The existing SmartAnalysis services already persist results to their own tables.
              // We serialize the result here as well for the AiJob.ResultJson cache.
  
              switch (step)
              {
                  case AiStepType.FactAnalysis:
                  {
                      var input = JsonSerializer.Deserialize<Lawyer.Application.Dtos.SmartAnalysis.CaseAnalysisRequestDto>(inputJson!)!;
                      var result = await _smartAnalysis.AnalyzeCaseFactsAsync(input, ct);
                      if (!result.Succeeded) throw new Exception(result.Message ?? "FactAnalysis failed");
                      return JsonSerializer.Serialize(result.Data);
                  }
                  case AiStepType.GenerateDefenses:
                  {
                      var input = JsonSerializer.Deserialize<Lawyer.Application.Dtos.SmartAnalysis.CaseDefensesRequestDto>(inputJson!)!;
                      var result = await _smartAnalysis.GenerateCaseDefensesAsync(input, ct);
                      if (!result.Succeeded) throw new Exception(result.Message ?? "GenerateDefenses failed");
                      return JsonSerializer.Serialize(result.Data);
                  }
                  case AiStepType.AnalysisDefense:
                  {
                      var input = JsonSerializer.Deserialize<Lawyer.Application.Dtos.SmartAnalysis.AnalyzeDefenseRequestDto>(inputJson!)!;
                      var result = await _smartAnalysis.AnalyzeDefenseAsync(input, ct);
                      if (!result.Succeeded) throw new Exception(result.Message ?? "AnalysisDefense failed");
                      return JsonSerializer.Serialize(result.Data);
                  }
                  case AiStepType.FinalRequirements:
                  {
                      var input = JsonSerializer.Deserialize<Lawyer.Application.Dtos.SmartAnalysis.FinalRequirementsRequestDto>(inputJson!)!;
                      var result = await _smartAnalysis.GenerateFinalRequirementsAsync(input, ct);
                      if (!result.Succeeded) throw new Exception(result.Message ?? "FinalRequirements failed");
                      return JsonSerializer.Serialize(result.Data);
                  }
                  // PrepareStatementOfClaims steps: inject IPreparingStatementService in constructor (Phase 4)
                  default:
                      throw new NotImplementedException($"Step type {step} not yet implemented in AiJobWorker.");
              }
          }
      }
  }
  ```
  Note: Check the exact DTO namespaces for `CaseAnalysisRequestDto` etc. by looking at `mohamy-smart-backend/Lawyer.Application/Dtos/SmartAnalysis/`.

### Backend — AiJobs Controller

- [x] T021 [US1] Create `AiJobsController` in `mohamy-smart-backend/Lawyer/Controllers/AiJobsController.cs`:
  ```csharp
  using Lawyer.Application.Dtos.AiJobs;
  using Lawyer.Application.IServices;
  using Lawyer.Controllers.Base;
  using Lawyer.Core.Enum;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;
  
  namespace Lawyer.Controllers
  {
      [Route("api/cases/{caseId}/ai-jobs")]
      [ApiController]
      [Authorize]
      public class AiJobsController : AppControllerBase
      {
          private readonly ILogger<AiJobsController> _logger;
          private readonly IAiJobService _service;
  
          public AiJobsController(ILogger<AiJobsController> logger, IAiJobService service)
          {
              _logger = logger;
              _service = service;
          }
  
          /// <summary>Get all AI job statuses for a case. Used on page load to restore state.</summary>
          [HttpGet]
          public async Task<IActionResult> GetAll(Guid caseId, CancellationToken ct)
          {
              _logger.LogInformation("GetAllAiJobs called for Case {CaseId}", caseId);
              var result = await _service.GetAllByCaseAsync(caseId, ct);
              return CreateResponse(result);
          }
  
          /// <summary>Get status and result for a specific step. Used for polling fallback.</summary>
          [HttpGet("{stepType}")]
          public async Task<IActionResult> GetByStep(Guid caseId, AiStepType stepType, CancellationToken ct)
          {
              _logger.LogInformation("GetAiJobByStep called for Case {CaseId}, Step {Step}", caseId, stepType);
              var result = await _service.GetByCaseAndStepAsync(caseId, stepType, ct);
              return CreateResponse(result);
          }
  
          /// <summary>Submit a new AI job. Idempotent — returns existing job if already active.</summary>
          [HttpPost]
          public async Task<IActionResult> Submit(Guid caseId, [FromBody] SubmitAiJobDto dto, CancellationToken ct)
          {
              _logger.LogInformation("SubmitAiJob called for Case {CaseId}, Step {Step}", caseId, dto.StepType);
              var result = await _service.SubmitAsync(caseId, dto, ct);
              return CreateResponse(result);
          }
  
          /// <summary>Retry a failed AI job.</summary>
          [HttpPost("{stepType}/retry")]
          public async Task<IActionResult> Retry(Guid caseId, AiStepType stepType, [FromBody] SubmitAiJobDto dto, CancellationToken ct)
          {
              _logger.LogInformation("RetryAiJob called for Case {CaseId}, Step {Step}", caseId, stepType);
              var result = await _service.RetryAsync(caseId, stepType, dto, ct);
              return CreateResponse(result);
          }
      }
  }
  ```

- [x] T022 [US1] Register `IAiJobService` and `IAiJobWorker` in `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`. Open the file and add:
  ```csharp
  services.AddScoped<IAiJobService, AiJobService>();
  services.AddScoped<IAiJobWorker, AiJobWorker>();
  ```

### Frontend — thunkGetAllAiJobs

- [x] T023 [US1] Create `src/redux/aiJobs/thunk/thunkGetAllAiJobs.ts` in the lawyer dashboard. Look at how existing thunks are structured (e.g., `src/redux/cases/thunk/thunkGetAllCases.ts`) for the Axios import pattern. The thunk calls `GET /api/cases/{caseId}/ai-jobs`:
  ```typescript
  import { createAsyncThunk } from "@reduxjs/toolkit";
  import axios from "axios"; // or the project's configured axios instance — match existing thunks
  
  const thunkGetAllAiJobs = createAsyncThunk(
      'aiJobs/getAll',
      async ({ caseId }: { caseId: string }, { rejectWithValue }) => {
          try {
              const response = await axios.get(`/api/cases/${caseId}/ai-jobs`);
              return response.data.data as import('../aiJobsSlice').AiJob[];
          } catch (error: unknown) {
              if (axios.isAxiosError(error)) {
                  return rejectWithValue(error.response?.data?.message ?? 'Failed to fetch AI jobs');
              }
              return rejectWithValue('Unexpected error fetching AI jobs');
          }
      }
  );
  
  export default thunkGetAllAiJobs;
  ```
  **IMPORTANT**: Check how other thunks import axios (they likely use a configured instance from `src/utils/axiosInstance.ts` or similar). Match that pattern exactly — do NOT create a new axios instance.

- [x] T024 [US1] Add `thunkGetAllAiJobs` extraReducers to `aiJobsSlice.ts`. Open `src/redux/aiJobs/aiJobsSlice.ts`, import the thunk, and replace the empty `extraReducers: () => {}` with:
  ```typescript
  import { isString } from "../../utils/guards";
  import thunkGetAllAiJobs from "./thunk/thunkGetAllAiJobs";
  
  // In extraReducers(builder):
  builder
      .addCase(thunkGetAllAiJobs.pending, (state) => {
          state.loading = 'pending';
          state.error = null;
      })
      .addCase(thunkGetAllAiJobs.fulfilled, (state, action) => {
          state.loading = 'succeeded';
          // Index jobs by stepType for O(1) lookup
          state.jobs = {};
          for (const job of action.payload) {
              state.jobs[job.stepType] = job;
          }
      })
      .addCase(thunkGetAllAiJobs.rejected, (state, action) => {
          state.loading = 'failed';
          if (isString(action.payload)) state.error = action.payload;
      });
  ```

### Frontend — Restore State from Jobs on Page Load

- [x] T025 [US1] Modify `src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` to dispatch `thunkGetAllAiJobs` on mount and use the returned job `resultJson` to populate the SmartAnalysis slice.

  Add imports at the top:
  ```typescript
  import thunkGetAllAiJobs from "../../../../../redux/aiJobs/thunk/thunkGetAllAiJobs";
  import { upsertJob } from "../../../../../redux/aiJobs/aiJobsSlice";
  import { setDefenseExplanation } from "../../../../../redux/analysis/smartAnalysis/SmartAnalysis";
  ```

  Replace the existing `useEffect` that calls `thunkGetSummary` with one that:
  1. Still calls `thunkGetSummary` (keep existing behavior)
  2. Also calls `thunkGetAllAiJobs` to populate `aiJobsSlice`
  
  Add a new `useEffect` after the existing one:
  ```typescript
  useEffect(() => {
      if (caseId) {
          dispatch(thunkGetAllAiJobs({ caseId }));
      }
  }, [caseId, dispatch]);
  ```
  
  This populates `aiJobsSlice.jobs` so later phases can read job status per step.

**Checkpoint (US1)**: 
1. Complete a FactAnalysis AI step in the dashboard.
2. Hard refresh the browser (`Cmd+Shift+R`).
3. The existing `thunkGetSummary` call restores the result from the backend.
4. `GET /api/cases/{caseId}/ai-jobs` now also returns the job record with `status: "completed"` and `resultJson` populated.
5. Verify Hangfire dashboard at `http://localhost:8976/hangfire` shows the job in "Succeeded" state.

---

## Phase 4: User Story 2 — Multi-Step Workflow State Restoration (Priority: P2)

**Goal**: All completed steps across BOTH workflows (SmartAnalysis + PrepareStatementOfClaims) are restored when the user returns to a case, and the stepper advances to the correct position automatically.

**Independent Test**: Complete steps 1–2 of SmartAnalysis. Navigate to `/cases` list. Return to the same case. Steps 1–2 must be shown with their results, and step 3 must be highlighted as "ready to start".

### Backend — AiJobWorker PrepareStatementOfClaims Steps

- [x] T026 [US2] Inject `IPreparingStatementOfClaimsService` (find the existing interface name — check `mohamy-smart-backend/Lawyer.Application/IServices/`) into `AiJobWorker` and implement the `switch` cases for `LawsuitCaseType`, `LawsuitParties`, `LawsuitSubjects`, `LawsuitFacts`, `LawsuitLegalBasis`, `LawsuitRequests`.

  In `AiJobWorker.cs`:
  1. Add a new constructor parameter: `IPreparingStatementOfClaimsService prepStatements` (or whatever the real interface name is)
  2. Store it as `_prepStatements`
  3. In `ExecuteStepAsync`'s switch, add cases for each step (follow the same pattern as the SmartAnalysis cases — deserialize input, call service, serialize result):
  ```csharp
  case AiStepType.LawsuitCaseType:
  {
      var input = JsonSerializer.Deserialize<...RequestDto>(inputJson!)!;
      var result = await _prepStatements.AddLawsuitCaseTypeAsync(input, ct);
      if (!result.Succeeded) throw new Exception(result.Message ?? "LawsuitCaseType failed");
      return JsonSerializer.Serialize(result.Data);
  }
  // ... repeat for all 6 PrepareStatementOfClaims steps
  ```
  Find the exact DTO names and method names by reading `mohamy-smart-backend/Lawyer.Application/IServices/IPreparingStatementOfClaimsService.cs` (or similar filename).

### Frontend — PrepareStatementOfClaims Page Load Restoration

- [x] T027 [US2] Find the `PreparingStatementOfClaims` page component (likely `src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` — verify path with `ls`). Add a `useEffect` on mount that:
  1. Dispatches `thunkGetAllAiJobs({ caseId })`
  2. Checks the `aiJobs.jobs` state for each PrepareStatementOfClaims step
  3. For any step with `status === 'completed'` and non-null `resultJson`, dispatches the existing GET thunks (e.g., `thunkGetLawsuitCaseType({ caseId })`) to populate the existing Redux slice with data from the backend

  The GET thunks already exist — they call `GET /api/PreparingStatementOfClaims/...`. The point is to call them on mount so state is restored from the database.

  Pattern to follow:
  ```typescript
  const aiJobsState = useAppSelector(state => state.aiJobs);
  
  useEffect(() => {
      if (!caseId) return;
      dispatch(thunkGetAllAiJobs({ caseId }));
      // Dispatch GET thunks to restore each step's data from backend
      dispatch(thunkGetLawsuitCaseType({ caseId }));
      dispatch(thunkGetLawsuitParties({ caseId }));
      dispatch(thunkGetLawsuitSubjects({ caseId }));
      dispatch(thunkGetLawsuitFacts({ caseId }));
      dispatch(thunkGetLawsuitLegalBasis({ caseId }));
      dispatch(thunkGetLawsuitRequests({ caseId }));
  }, [caseId, dispatch]);
  ```

### Frontend — Stepper Position Calculation from aiJobsSlice

- [x] T028 [US2] In `DefenseMemoPage.tsx`, update the `active` step calculation to use the `aiJobsSlice` state in addition to the `smartAnalysisState`. When `thunkGetSummary` restores data, `setActive` is called. Supplement this with job status from `aiJobsSlice`:

  Add a `useEffect` that runs after `thunkGetAllAiJobs` resolves. Read `aiJobs.jobs` and calculate `maxStepAllowed` based on which steps are completed:
  ```typescript
  const aiJobs = useAppSelector(state => state.aiJobs);
  
  useEffect(() => {
      const jobs = aiJobs.jobs;
      if (jobs.FinalRequirements?.status === 'completed') setActive(4);
      else if (jobs.AnalysisDefense?.status === 'completed') setActive(3);
      else if (jobs.GenerateDefenses?.status === 'completed') setActive(2);
      else if (jobs.FactAnalysis?.status === 'completed') setActive(1);
  }, [aiJobs.jobs]);
  ```
  Make sure this `useEffect` does NOT overwrite a higher step value if the user has already advanced further.

**Checkpoint (US2)**:
1. Complete 3 of 5 SmartAnalysis steps.
2. Log out and log back in.
3. Navigate back to the case → SmartAnalysis tab.
4. Step indicator must show steps 1–3 as complete, step 4 as active.
5. All step results must be visible without re-triggering AI.

---

## Phase 5: User Story 3 — In-Progress AI Job Visibility (Priority: P3)

**Goal**: When an AI job is running and the user refreshes, they see "جاري المعالجة..." (Processing). The result appears automatically when the job finishes — without a manual page reload.

**Independent Test**: Trigger FactAnalysis. Before it completes, refresh the page. A "processing" spinner must appear. Wait — the result must appear automatically (via SignalR push) without the user clicking anything.

### Backend — SignalR Push from AiJobWorker

- [x] T029 [US3] Inject `IHubContext<AiJobHub>` into `AiJobWorker` to send job status push events. In `AiJobWorker.cs`:

  1. Add `using Lawyer.Hubs;` and `using Microsoft.AspNetCore.SignalR;`
  2. Add constructor parameter: `IHubContext<AiJobHub> hubContext`
  3. Store as `_hubContext`
  4. In `ProcessAsync`, after marking `Processing`, add:
     ```csharp
     await _hubContext.Clients.Group($"case-{job.CaseId}")
         .SendAsync("JobStatusChanged", ToSignalRPayload(job));
     ```
  5. After marking `Completed`, add:
     ```csharp
     await _hubContext.Clients.Group($"case-{job.CaseId}")
         .SendAsync("JobCompleted", ToSignalRPayload(job));
     ```
  6. In the catch block after marking `Failed`, add:
     ```csharp
     await _hubContext.Clients.Group($"case-{job.CaseId}")
         .SendAsync("JobFailed", ToSignalRPayload(job));
     ```
  7. Add this private helper at the bottom of `AiJobWorker`:
     ```csharp
     private static object ToSignalRPayload(AiJob job) => new
     {
         id = job.Id,
         caseId = job.CaseId,
         stepType = job.StepType.ToString(),
         status = job.Status.ToString().ToLower(),
         resultJson = job.ResultJson,
         errorMessage = job.ErrorMessage,
         createdAt = job.CreatedAt,
         completedAt = job.CompletedAt,
     };
     ```

### Frontend — useAiJobSignalR Hook

- [x] T030 [US3] Create `src/hooks/useAiJobSignalR.ts` in the lawyer dashboard. This hook connects to the SignalR hub and dispatches Redux actions when job events arrive:
  ```typescript
  import { useEffect, useRef } from 'react';
  import * as signalR from '@microsoft/signalr';
  import { useAppDispatch } from './reduxHooks';
  import { upsertJob, type AiJob } from '../redux/aiJobs/aiJobsSlice';
  
  const HUB_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '') + '/hubs/ai-jobs';
  
  export function useAiJobSignalR(caseId: string | null) {
      const dispatch = useAppDispatch();
      const connectionRef = useRef<signalR.HubConnection | null>(null);
  
      useEffect(() => {
          if (!caseId) return;
  
          const getToken = () => localStorage.getItem('accessToken') ?? '';
          // Adjust `localStorage.getItem('accessToken')` to match where the app actually stores the JWT.
          // Check existing thunks or axios interceptors for the token storage key.
  
          const connection = new signalR.HubConnectionBuilder()
              .withUrl(HUB_URL, { accessTokenFactory: getToken })
              .withAutomaticReconnect()
              .build();
  
          connectionRef.current = connection;
  
          const handleStatusChanged = (job: AiJob) => {
              dispatch(upsertJob(job));
          };
  
          connection.on('JobStatusChanged', handleStatusChanged);
          connection.on('JobCompleted', handleStatusChanged);
          connection.on('JobFailed', handleStatusChanged);
  
          connection.start()
              .then(() => connection.invoke('JoinCase', { caseId }))
              .catch(err => console.error('SignalR connection failed:', err));
  
          return () => {
              connection.invoke('LeaveCase', { caseId }).catch(() => {});
              connection.stop();
              connectionRef.current = null;
          };
      }, [caseId, dispatch]);
  }
  ```

- [x] T031 [US3] Use `useAiJobSignalR` in `DefenseMemoPage.tsx`. Add the hook call:
  ```typescript
  import { useAiJobSignalR } from '../../../../../hooks/useAiJobSignalR';
  
  // Inside the DefenseMemoPage component, after existing hooks:
  useAiJobSignalR(caseId);
  ```
  This is all that's needed — the hook handles connection, subscription, and cleanup automatically.

### Frontend — Processing Indicator UI

- [x] T032 [US3] In each step component of `DefenseMemoPage` (FactsReview, LegalAnalysis, DefensesList, FinalRequirements), read the matching job's status from `aiJobsSlice` and show Arabic status feedback.

  In each step component, add:
  ```typescript
  import { useAppSelector } from '../../../../../hooks/reduxHooks';
  
  // Inside the component:
  const aiJobs = useAppSelector(state => state.aiJobs);
  const currentJob = aiJobs.jobs['FactAnalysis']; // change to the correct AiStepType per component
  
  // Render the status indicator based on currentJob?.status:
  // 'queued'     → show spinner + "في قائمة الانتظار..."
  // 'processing' → show spinner + "جاري المعالجة..."
  // 'failed'     → show error icon + currentJob.errorMessage + retry button
  // 'completed'  → show result (already handled by existing slice)
  ```

- [x] T033 [US3] Create `thunkSubmitAiJob` in `src/redux/aiJobs/thunk/thunkSubmitAiJob.ts`. This replaces the direct AI call pattern — it submits a job and returns the job record:
  ```typescript
  import { createAsyncThunk } from "@reduxjs/toolkit";
  import axios from "axios"; // match existing thunk pattern
  import type { AiJob, AiStepType } from '../aiJobsSlice';
  
  const thunkSubmitAiJob = createAsyncThunk(
      'aiJobs/submit',
      async (
          { caseId, stepType, inputJson }: { caseId: string; stepType: AiStepType; inputJson: string },
          { rejectWithValue }
      ) => {
          try {
              const response = await axios.post(`/api/cases/${caseId}/ai-jobs`, {
                  stepType,
                  inputJson,
              });
              return response.data.data as AiJob;
          } catch (error: unknown) {
              if (axios.isAxiosError(error)) {
                  return rejectWithValue(error.response?.data?.message ?? 'Failed to submit AI job');
              }
              return rejectWithValue('Unexpected error');
          }
      }
  );
  
  export default thunkSubmitAiJob;
  ```

- [x] T034 [US3] Add `thunkSubmitAiJob` extraReducers to `aiJobsSlice.ts`. Import the thunk and add:
  ```typescript
  import thunkSubmitAiJob from "./thunk/thunkSubmitAiJob";
  
  // In extraReducers builder chain:
  .addCase(thunkSubmitAiJob.fulfilled, (state, action) => {
      state.jobs[action.payload.stepType] = action.payload;
  })
  .addCase(thunkSubmitAiJob.rejected, (state, action) => {
      if (isString(action.payload)) state.error = action.payload;
  });
  ```

**Checkpoint (US3)**:
1. Trigger FactAnalysis. Immediately refresh (before it completes).
2. The page loads and shows "جاري المعالجة..." for that step.
3. Without touching the page, the result appears automatically (SignalR push).
4. Open browser DevTools → Network → WS tab — verify a WebSocket connection to `/hubs/ai-jobs` is open.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T035 [P] Update `CaseDetails.tsx` cleanup to also dispatch `resetAiJobs`. Open `src/pages/cases/CaseDetails.tsx`. In the existing cleanup `useEffect` return function (which already dispatches `clearSingleCase`, `resetAnalysis`, `resetPreparingStatementOfClaims`), add:
  ```typescript
  import { resetAiJobs } from "../../redux/aiJobs/aiJobsSlice";
  // In the return cleanup:
  dispatch(resetAiJobs());
  ```

- [x] T036 [P] Polling fallback for environments where WebSocket is blocked. In `useAiJobSignalR.ts`, add a polling interval that activates if SignalR fails to connect. In the `.catch(err => ...)` block of `connection.start()`, start a polling interval:
  ```typescript
  .catch(() => {
      // Fallback: poll every 3 seconds for any non-terminal job
      const interval = setInterval(async () => {
          // dispatch thunkGetAllAiJobs({ caseId }) — import from thunks
      }, 3000);
      return () => clearInterval(interval);
  });
  ```
  For simplicity, the fallback can just dispatch `thunkGetAllAiJobs` from the same hook.

- [x] T037 Verify Arabic localization of all job status strings. Search the codebase (`grep -r "جاري\|قائمة الانتظار\|فشل\|مكتمل"`) and ensure all job-status UI text is in Arabic matching the Tajawal font used project-wide. Add any missing Arabic strings. Do NOT use English status words in the UI.

- [x] T038 [P] Run `npm run build` in `mohamy-smart-lawyer-dashboard/` and fix any TypeScript errors introduced by this feature. Then run `dotnet build mohamy-smart-backend/` and fix any C# compilation errors. Both must compile clean before considering this feature done.

- [x] T039 End-to-end validation per `specs/017-persist-ai-job-state/quickstart.md`. Follow the "Testing the Feature End-to-End" section step-by-step. Verify all 7 steps pass. Check the Hangfire dashboard at `http://localhost:8976/hangfire` to confirm jobs appear in Succeeded/Failed states.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 — can start after Foundation
- **Phase 4 (US2)**: Depends on Phase 2 — can start after Foundation (can run in parallel with US1)
- **Phase 5 (US3)**: Depends on Phase 2 — can start after Foundation (best after US1 for continuity)
- **Phase 6 (Polish)**: Depends on all desired user stories

### User Story Dependencies

- **US1 (P1)**: No dependency on US2/US3 — fully standalone. Delivers core persistence.
- **US2 (P2)**: Depends on US1 (Hangfire worker must exist). Extends coverage to PrepareStatementOfClaims and stepper restoration.
- **US3 (P3)**: Depends on Phase 2 (AiJobHub, aiJobsSlice). Independent of US2. SignalR push + processing indicator.

### Within Each Phase

- Tasks marked `[P]` can run in parallel
- `T006` (AiJob entity) → `T007` (DbContext) → `T008` (migration) — must be sequential
- `T017` (AiJobService) → `T022` (register in DI) → `T021` (controller) — must be sequential
- `T015` (aiJobsSlice) → `T016` (store) → `T023` (thunk) → `T024` (extraReducers) — must be sequential

### Parallel Opportunities

Within Phase 2:
- `T004` and `T005` (two enum files) — parallel
- `T009` and `T010` (two DTO files) — parallel
- `T003` (npm install) — parallel with all backend Phase 2 tasks

Within Phase 3:
- `T017` (AiJobService) and `T023` (frontend thunkGetAllAiJobs) — parallel (different codebases)
- `T021` (controller) and `T025` (frontend DefenseMemoPage) — parallel

---

## Parallel Example: Phase 2

```bash
# These can all start at once:
Task T004: Create AiJobStatus.cs enum
Task T005: Create AiStepType.cs enum
Task T009: Create AiJobStatusDto.cs
Task T010: Create SubmitAiJobDto.cs
Task T003: npm install @microsoft/signalr

# Then sequentially:
Task T006: Create AiJob.cs entity (after T004, T005)
Task T007: Update AppDbContext (after T006)
Task T008: Create EF migration (after T007)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Install packages
2. Phase 2: Foundation (complete all 16 tasks)
3. Phase 3: US1 (T017–T025)
4. **STOP and VALIDATE**: Refresh after FactAnalysis — result must be restored
5. Ship US1 — users no longer lose AI results on refresh

### Incremental Delivery

1. Foundation → US1 → validate → ship (refresh-safe AI results)
2. Add US2 → validate → ship (stepper restoration + PrepareStatementOfClaims)
3. Add US3 → validate → ship (real-time "processing" indicator)

---

## Notes

- `[P]` = different files or different codebases (frontend vs backend) — safe to parallelize
- Story labels map to spec.md user stories: [US1]–[US3]
- The backend already persists some AI results to DB (SmartAnalysis flow). Hangfire makes this durable and async.
- Do NOT modify existing AI service logic — `AiJobWorker` wraps the existing services.
- `Lawyer.Infrastracture` — note the spelling with "a" (existing project convention).
- JWT for SignalR uses query string `?access_token=` — the `OnMessageReceived` handler in T013 is critical for auth.
- Commit after each checkpoint (end of US1, US2, US3 phases) to maintain a clean git history.
