# Tasks: إنشاء العقود القانونية بالذكاء الاصطناعي

**Input**: Design documents from `/specs/055-ai-contract-generation/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/legal-contracts.openapi.yaml`

**Tests**: لم يُطلب اتباع TDD أو إضافة test tasks صراحة في الـ feature spec، لذلك هذه القائمة تركز على التنفيذ القابل للتشغيل مباشرة.  
**Organization**: المهام مجمعة حسب user story بحيث يمكن تنفيذ كل قصة والتحقق منها بشكل مستقل بعد إنهاء الـ dependencies الخاصة بها.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Surface)

**Purpose**: تجهيز المسارات والأنواع المشتركة التي ستستخدمها كل قصص العقود.

- [ ] T001 Update legal contract API route helpers for `GET /api/LegalContracts/types` and `GET /api/LegalContracts/{id}` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/APIs/routes.ts
- [ ] T002 Extend legal contract frontend types for create/detail/type responses in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/types/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: إنشاء البنية الدومينية وقاعدة البيانات التي تعتمد عليها كل قصص العقود.

**⚠️ CRITICAL**: لا تبدأ أي user story قبل إنهاء هذه المرحلة.

- [ ] T003 Create the `LegalContract` domain entity with lawyer/client ownership fields and generated content storage in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/LegalContract.cs
- [ ] T004 [P] Create the `LegalContractStatus` enum for generated/failed lifecycle states in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Enum/LegalContractStatus.cs
- [ ] T005 Update `AppDbContext` to expose `DbSet<LegalContract>` and register the entity configuration in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs
- [ ] T006 [P] Add EF Core mapping for `LegalContract` table columns, lengths, indexes, and lawyer/client relationships in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/Configuration/LegalContractConfiguration.cs
- [ ] T007 Create the `AddLegalContracts` migration file for the new table in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Migrations/20260421233000_AddLegalContracts.cs (depends on T003, T004, T005, T006)
- [ ] T008 Create the `AddLegalContracts` migration designer file in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Migrations/20260421233000_AddLegalContracts.Designer.cs (depends on T007)
- [ ] T009 Update the EF Core model snapshot with the `LegalContracts` table schema in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Migrations/AppDbContextModelSnapshot.cs (depends on T007)

**Checkpoint**: قاعدة البيانات وبنية العقود أصبحت جاهزة ويمكن بدء قصص المستخدم.

---

## Phase 3: User Story 1 - إنشاء عقد جديد لموكل موجود (Priority: P1) 🎯 MVP

**Goal**: تمكين المحامي من اختيار موكل موجود، تحديد نوع العقد، إدخال التفاصيل والبنود، ثم إنشاء مسودة عقد عربية محفوظة.

**Independent Test**: افتح شاشة العقود، اختر موكلًا موجودًا، اختر نوع عقد، أدخل التفاصيل والبنود، ثم أنشئ العقد وتأكد أن صفحة التفاصيل تعرض المسودة مباشرة.

### Implementation for User Story 1

- [ ] T010 [P] [US1] Create `CreateLegalContractRequestDto`, `LegalContractDetailsDto`, and `ContractTypeOptionDto` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Contracts/CreateLegalContractRequestDto.cs, /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Contracts/LegalContractDetailsDto.cs, and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Contracts/ContractTypeOptionDto.cs
- [ ] T011 [US1] Extend the legal contract service interface with `CreateLegalContractAsync` and `GetAvailableContractTypesAsync` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/ILegalContractService.cs (depends on T010)
- [ ] T012 [US1] Add the Arabic legal contract drafting prompt template with party data fidelity rules in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/wwwroot/prompts/legal-contracts/legal-contract-draft.txt
- [ ] T013 [US1] Implement the fixed contract type catalog and request validation for `clientId`, `contractTypeCode`, `details`, and `customClauses` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalContractService.cs (depends on T011)
- [ ] T014 [US1] Implement synchronous AI drafting with lawyer-owned client lookup and contract persistence using the current default model fallback in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalContractService.cs (depends on T012, T013)
- [ ] T015 [US1] Add `POST /api/LegalContracts` and `GET /api/LegalContracts/types` actions with current-lawyer resolution in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/LegalContractsController.cs (depends on T014)
- [ ] T016 [P] [US1] Create the create-contract thunk for `POST /api/LegalContracts` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalContracts/thunk/thunkCreateLegalContract.ts
- [ ] T017 [P] [US1] Create the contract-types thunk for `GET /api/LegalContracts/types` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalContracts/thunk/thunkGetLegalContractTypes.ts
- [ ] T018 [US1] Create the `legalContracts` Redux slice and register its reducer in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalContracts/legalContractsSlice.ts and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/store.ts (depends on T016, T017)
- [ ] T019 [US1] Replace the contract form schema with `clientId`, `contractTypeCode`, `details`, and `customClauses` validation rules in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/validations/AddNewContractsSchema.ts
- [ ] T020 [US1] Rewrite the add-contract form to fetch contract types, select an existing client, submit the create thunk, and handle Arabic validation/errors in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/forms/AddNewContractsForm.tsx (depends on T018, T019)
- [ ] T021 [US1] Update the legal contracts page to preload existing clients, open the creation modal, and redirect to the new contract detail view after a successful create in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/legalContracts/LegalContracts.tsx (depends on T020)
- [ ] T022 [US1] Rewrite the contract details page to render the freshly created contract data passed from navigation state, including generated Arabic content and metadata, in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/legalContracts/ContractDetails.tsx (depends on T020)

**Checkpoint**: User Story 1 should now allow a lawyer to create and immediately review a generated legal contract for an existing client.

---

## Phase 4: User Story 2 - الاعتماد على الموديل المحدد من الإعدادات (Priority: P1)

**Goal**: جعل إنشاء العقود يستخدم stage إعدادات AI الحالية بدل الاعتماد على fallback ثابت، مع حفظ الموديل المستخدم على كل عقد.

**Independent Test**: غيّر موديل مرحلة العقود من إعدادات الإدارة، ثم أنشئ عقدًا جديدًا وتأكد أن العقد الناتج يسجل ويعرض الموديل الجديد.

### Implementation for User Story 2

- [ ] T023 [P] [US2] Add `LegalContractDraft` to the AI step enum and register its display metadata in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Enum/AiStepType.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/PipelineRegistry.cs
- [ ] T024 [US2] Seed the default AI model configuration for `LegalContractDraft` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/Configuration/AiStageModelConfigConfiguration.cs (depends on T023)
- [ ] T025 [US2] Create the migration file that adds the seeded `LegalContractDraft` AI stage config in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Migrations/20260421234500_AddLegalContractDraftAiStage.cs (depends on T024)
- [ ] T026 [US2] Create the migration designer file for the `LegalContractDraft` AI stage seed change in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Migrations/20260421234500_AddLegalContractDraftAiStage.Designer.cs (depends on T025)
- [ ] T027 [US2] Update the EF Core model snapshot with the new `LegalContractDraft` seeded stage in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Migrations/AppDbContextModelSnapshot.cs (depends on T025)
- [ ] T028 [US2] Add `AiStepType` and `ModelIdentifier` persistence fields to the legal contract entity and mapping in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/LegalContract.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/Configuration/LegalContractConfiguration.cs (depends on T023)
- [ ] T029 [US2] Update the contract details DTO and frontend types to expose the persisted `modelIdentifier` on generated contracts in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Contracts/LegalContractDetailsDto.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/types/types.ts (depends on T028)
- [ ] T030 [US2] Refactor contract generation to call `IAIProviderFactory.GetModelForStepAsync(AiStepType.LegalContractDraft)` and persist the selected model identifier in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalContractService.cs (depends on T024, T028, T029)
- [ ] T031 [US2] Update the create form and details page to show that contract drafting uses system AI settings and render the returned model identifier when available in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/forms/AddNewContractsForm.tsx and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/legalContracts/ContractDetails.tsx (depends on T030)

**Checkpoint**: User Story 2 should now honor the admin-configured AI model stage for legal contracts and surface that model in the generated contract details.

---

## Phase 5: User Story 3 - مراجعة وحفظ العقود المُولدة (Priority: P2)

**Goal**: استبدال البيانات الثابتة في قائمة العقود وتفاصيل العقد بقراءة فعلية من API مع حفظ واسترجاع العقود الخاصة بالمحامي الحالي.

**Independent Test**: بعد إنشاء عقد محفوظ، افتح قائمة العقود ثم صفحة تفاصيله من رابط مباشر وتأكد أن البيانات تُقرأ من backend وليس من state مؤقتة أو mock data.

### Implementation for User Story 3

- [ ] T032 [US3] Extend the legal contract service interface and implementation with paginated list and single-contract detail queries for the current lawyer in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/ILegalContractService.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalContractService.cs (depends on T014, T028)
- [ ] T033 [US3] Add `GET /api/LegalContracts` and `GET /api/LegalContracts/{id}` actions with lawyer ownership checks in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/LegalContractsController.cs (depends on T032)
- [ ] T034 [P] [US3] Create the contracts-list thunk for `GET /api/LegalContracts` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalContracts/thunk/thunkGetLegalContracts.ts
- [ ] T035 [P] [US3] Create the contract-detail thunk for `GET /api/LegalContracts/{id}` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalContracts/thunk/thunkGetLegalContractDetails.ts
- [ ] T036 [US3] Extend the legal contracts Redux slice with list, selected detail, loading, error, and pagination state in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalContracts/legalContractsSlice.ts (depends on T034, T035)
- [ ] T037 [US3] Update the shared table component to support API-backed contract rows without hardcoded `/legal-contracts/${item.key}` assumptions outside legal contract usage in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/ui/table/CustomTable.tsx (depends on T036)
- [ ] T038 [US3] Replace the hardcoded contracts array with Redux-backed fetching, API row mapping, loading state, and reload-after-create behavior in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/legalContracts/LegalContracts.tsx (depends on T036, T037)
- [ ] T039 [US3] Rewrite the contract details page to fetch the contract by route `id` when navigation state is absent and render the persisted generated content from the API in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/legalContracts/ContractDetails.tsx (depends on T036)

**Checkpoint**: User Story 3 should now provide a real contracts list and direct-linkable details page for saved contracts.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: تحسينات تمس أكثر من قصة وتغلق الفجوات النهائية في التجربة.

- [ ] T040 Harden Arabic validation and ownership error messages for all legal contract endpoints in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalContractService.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/LegalContractsController.cs
- [ ] T041 [P] Refine the legal contracts page and long-document detail layout for RTL overflow, readable spacing, and mobile display in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/legalContracts/LegalContracts.css and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/legalContracts/ContractDetails.tsx
- [ ] T042 [P] Update the implementation quickstart with the final admin-to-lawyer validation steps for the legal contracts flow in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/055-ai-contract-generation/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: تبدأ فورًا.
- **Phase 2 (Foundational)**: تعتمد على Phase 1 وتمنع بدء أي user story قبل اكتمالها.
- **Phase 3 (US1)**: تعتمد على اكتمال Phase 2 فقط، وهي نطاق الـ MVP.
- **Phase 4 (US2)**: تعتمد على اكتمال US1 لأن ربط الموديل يتم فوق تدفق الإنشاء نفسه.
- **Phase 5 (US3)**: تعتمد على اكتمال US1، ويمكن تنفيذها بعده مباشرة أو بالتوازي مع جزء من US2 إذا اكتملت الاعتمادات المذكورة داخل المهام.
- **Phase 6 (Polish)**: تعتمد على اكتمال القصص المراد شحنها.

### User Story Dependencies

- **US1**: لا تعتمد على قصص أخرى بعد Phase 2.
- **US2**: تعتمد على US1 لأن إنشاء العقد يجب أن يعمل أولًا قبل جعله يقرأ من إعدادات الموديل.
- **US3**: تعتمد على US1 لأن القائمة والتفاصيل الحقيقية تحتاج عقودًا محفوظة فعليًا.

### Within Each User Story

- في **US1**: DTOs/interface → prompt/validation → service create flow → controller → Redux thunks/slice → schema/form/page/detail.
- في **US2**: AI stage enum/registry → seed + migration → entity/model fields → service refactor → UI exposure.
- في **US3**: service queries → controller reads → list/detail thunks → slice state → list page/detail page.

---

## Parallel Opportunities

- **Phase 2**
  - T004 و T006 يمكن تنفيذهما بالتوازي بعد T003.
- **US1**
  - T016 و T017 يمكن تنفيذهما بالتوازي.
  - T019 يمكن تنفيذه بالتوازي مع جزء backend من T013/T014 بمجرد ثبات shape الـ request.
- **US2**
  - T028 و T029 يمكن تقسيمهما بالتوازي بعد T023/T024.
- **US3**
  - T034 و T035 يمكن تنفيذهما بالتوازي.

## Parallel Example: User Story 1

```bash
Task: "Create the create-contract thunk in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalContracts/thunk/thunkCreateLegalContract.ts"
Task: "Create the contract-types thunk in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalContracts/thunk/thunkGetLegalContractTypes.ts"
Task: "Replace the contract form schema in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/validations/AddNewContractsSchema.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add LegalContractDraft to /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Enum/AiStepType.cs and register it in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/PipelineRegistry.cs"
Task: "Add AiStepType and ModelIdentifier persistence fields in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/LegalContract.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/Configuration/LegalContractConfiguration.cs"
```

## Parallel Example: User Story 3

```bash
Task: "Create the contracts-list thunk in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalContracts/thunk/thunkGetLegalContracts.ts"
Task: "Create the contract-detail thunk in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/legalContracts/thunk/thunkGetLegalContractDetails.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. أكمل Phase 1 وPhase 2.
2. نفّذ Phase 3 بالكامل.
3. تحقق أن المحامي يستطيع إنشاء عقد جديد لموكل موجود ومراجعته فورًا.
4. أوقف التنفيذ هنا إن أردت شحن MVP مبكرًا.

### Incremental Delivery

1. **MVP**: US1 يحقق إنشاء العقد وحفظه.
2. **Iteration 2**: US2 يربط إنشاء العقد بإعدادات الموديل الحالية من الإدارة.
3. **Iteration 3**: US3 يحول القائمة والتفاصيل إلى تجربة API كاملة وقابلة للرجوع المباشر.
4. **Final pass**: Phase 6 لتحسين الرسائل والتخطيط والوثائق.

### Suggested MVP Scope

- **الموصى به الآن**: Phase 1 + Phase 2 + Phase 3 فقط.
- هذا يعطي قيمة مباشرة: إنشاء عقد بالـ AI لموكل موجود مع حفظه وعرضه فورًا.

---

## Notes

- كل مهمة تتبع صيغة checklist المطلوبة: `- [ ] T### ...`.
- كل مهام user stories تحمل labels من نوع `[US1]`, `[US2]`, `[US3]`.
- كل مهمة تحتوي على مسار ملف صريح أو مجموعة ملفات صريحة لا تتجاوز 3 مسارات.
- لا توجد مهام عامة من نوع "implement backend changes" أو "connect everything".
