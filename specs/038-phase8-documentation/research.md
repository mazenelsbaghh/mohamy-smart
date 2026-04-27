# Research & Technical Decisions: Phase 8 Documentation & Developer Experience

## 1. Registry Architecture in Clean Architecture
- **Decision:** Place `PipelineDefinition` record/class in `Lawyer.Core/Models/Workflows/` and the `PipelineRegistry` static class in `Lawyer.Application/Services/Workflows/`.
- **Rationale:** `PipelineDefinition` defines the domain model of a pipeline workflow, so it belongs in Core. The `PipelineRegistry` acts as a static configuration service tying domain models together, fitting well in Application.
- **Alternatives considered:** Putting the registry in Infrastructure. Rejected because it defines core business workflows rather than DB connections or external APIs.

## 2. Documentation Format
- **Decision:** Create a centralized `mapping.txt` or `mapping.md` located within the `wwwroot/prompts/` directory to document mapping between pipeline steps and system prompt files for phases 1, 2, and 7.
- **Rationale:** Keeping documentation adjacent to the prompt files ensures developers see it immediately when modifying workflows.
- **Alternatives considered:** Adding it to the git root. Rejected because it specifically pertains to Backend workflow prompts.

## 3. AiModelConfigService Refactoring
- **Decision:** Modify `AiModelConfigService.cs` to iterate over `PipelineRegistry.GetAll()` or query by type, mapping them to the expected frontend contract `StageDefinitions` response.
- **Rationale:** Ensures zero duplication. When a developer registers a new pipeline in `PipelineRegistry`, it instantly becomes available to the frontend config endpoint without further modification.
- **Alternatives considered:** Keeping hardcoded lists in the service. Rejected as it violates the acceptance criteria for SC-002.
