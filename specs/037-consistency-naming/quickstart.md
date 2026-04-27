# Quickstart Developer Guide: Consistency & Naming Fixes

## Applying Consistent Patterns to New Workflows

When scaffolding a brand new analytical pipeline in the backend, conform to these guidelines derived from the Phase 7 refactoring standard:

### 1. Data Access & Dependency Injection
1. Inject the `IUnitOfWork` into your `WorkflowServiceBase` implementation.
2. Under no circumstance should a bare `DbContext` be injected directly into your controller or service logic. Rely entirely on `.Repository<T>()` and `.SaveChangesAsync()`.

### 2. Validating Authorization
To implement authorization restrictions manually inside an overridden generic controller or service:
```csharp
// Constructor Injection
private readonly ICaseAccessValidator _caseAccessValidator;

// During workflow start / execution
var accessResult = await _caseAccessValidator.ValidateAsync(caseId, lawyerId, ct);
if (!accessResult.Succeeded)
{
    return Result<TDto>.Error(accessResult.Message); 
    // Or return _result.Forbidden<TDto>(accessResult.Message) depending on the shell context
}
```

### 3. Implementing Workflow Abandonment
Since abandonment logic resides natively inside `WorkflowServiceBase` (`AbandonWorkflowAsync`), you just route it directly in the controller:

```csharp
[HttpPost("abandon/{id}")]
public async Task<IActionResult> AbandonWorkflow(int id, CancellationToken ct)
{
    var lawyerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    var response = await _rulingAnalysisService.AbandonWorkflowAsync(id, lawyerId, ct);
    return StatusCode(response.Succeeded ? 200 : 400, response);
}
```

### 4. Codebase Navigation (Frontend)
Use camelCased directory configurations consistently. 
If developing interconnected analytical modules (like reading from `smartAnalysis` context inside `defenseMemoPage`), utilize internal JS block comments atop the module to briefly declare the data relationship to developers tracking state.
