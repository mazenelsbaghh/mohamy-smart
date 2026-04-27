# إصلاح Parsing - snake_case Prompts vs PascalCase DTOs

## المشكلة
كل الـ AI prompts بتطلب JSON بـ **snake_case** keys (زي `case_type`, `legal_facts_summary`)، لكن الـ C# DTOs بـ **PascalCase** (`CaseType`, `LegalFactsSummary`). `System.Text.Json` مع `PropertyNameCaseInsensitive = true` بيعمل case-insensitive بس — مش بيحول snake_case لـ PascalCase بسبب الـ underscores. النتيجة: DTO فاضي = فرونت فاضي.

مشكلة تانية: `AiJobWorker` كان بيعمل `JsonSerializer.Serialize(result.Data)` بدون `_jsonOptions` فكان بيحط PascalCase في `resultJson`.

---

## الملفات اللي اتعدلت

### المرحلة الأولى - مذكرة الدفاع

#### `Lawyer.Application/Dtos/SmartAnalysis/AnalysisDto.cs`
أضفنا `[JsonPropertyName("snake_case")]` لكل property متعددة الكلمات:

| DTO | Property | JsonPropertyName |
|-----|----------|-----------------|
| `CaseAnalysisResultDto` | `CaseType` | `"case_type"` |
| `CaseAnalysisResultDto` | `CaseNumber` | `"case_number"` |
| `CaseAnalysisResultDto` | `CourtName` | `"court_name"` |
| `CaseAnalysisResultDto` | `LegalFactsSummary` | `"legal_facts_summary"` |
| `CaseAnalysisResultDto` | `DefendantsPositions` | `"defendants_positions"` |
| `CaseAnalysisResultDto` | `EvidenceMap` | `"evidence_map"` |
| `CaseAnalysisResultDto` | `LegalAndTechnicalReviewPoints` | `"legal_and_technical_review_points"` |
| `CaseAnalysisResultDto` | `PotentialLegalCharacterization` | `"potential_legal_characterization"` |
| `DefendantPositionDto` | `DefendantName` | `"defendant_name"` |
| `DefendantPositionDto` | `PositionSummary` | `"position_summary"` |
| `EvidenceMapItemDto` | `DoesNotProve` | `"does_not_prove"` |
| `PotentialLegalCharacterizationDto` | `ChargeDescription` | `"charge_description"` |
| `PotentialLegalCharacterizationDto` | `ElementsReliedUpon` | `"elements_relied_upon"` |
| `PotentialLegalCharacterizationDto` | `ElementsLackingProof` | `"elements_lacking_proof"` |
| `CaseDefensesResultDto` | `DefensesFormal` | `"defenses_formal"` |
| `CaseDefensesResultDto` | `DefensesSubstantive` | `"defenses_substantive"` |
| `CaseDefensesResultDto` | `DefensesEvidentiary` | `"defenses_evidentiary"` |
| `DefenseDetailDto` | `DefenseTitle` | `"defense_title"` |
| `DefenseDetailDto` | `BasisFromCase` | `"basis_from_case"` |
| `AnalyzeDefenseResponseDto` | `DefenseTitle` | `"defense_title"` |
| `AnalyzeDefenseResponseDto` | `CaseReference` | `"case_reference"` |
| `AnalyzeDefenseResponseDto` | `Memorandum` | `"memorandum"` |
| `CaseReferenceDto` | `CaseType` | `"case_type"` |
| `CaseReferenceDto` | `CaseNumber` | `"case_number"` |
| `CaseReferenceDto` | `CourtName` | `"court_name"` |
| `DefenseMemorandumDto` | `FactualBasis` | `"factual_basis"` |
| `DefenseMemorandumDto` | `LegalTextsFull` | `"legal_texts_full"` |
| `DefenseMemorandumDto` | `LegalTextsUnavailableReason` | `"legal_texts_unavailable_reason"` |
| `DefenseMemorandumDto` | `LinkingTextsToFacts` | `"linking_texts_to_facts"` |
| `DefenseMemorandumDto` | `CassationPrecedentsFull` | `"cassation_precedents_full"` |
| `DefenseMemorandumDto` | `CassationPrecedentsUnavailableReason` | `"cassation_precedents_unavailable_reason"` |
| `DefenseMemorandumDto` | `LegalApplication` | `"legal_application"` |
| `DefenseMemorandumDto` | `CounterArgumentsAndResponse` | `"counter_arguments_and_response"` |
| `DefenseMemorandumDto` | `LegalEffectOfAcceptance` | `"legal_effect_of_acceptance"` |
| `DefenseMemorandumDto` | `StrengthsAndRisks` | `"strengths_and_risks"` |
| `LegalTextDto` | `LawName` | `"law_name"` |
| `LegalTextDto` | `ArticleNumber` | `"article_number"` |
| `LegalTextDto` | `FullText` | `"full_text"` |
| `CassationPrecedentDto` | `AppealNumber` | `"appeal_number"` |
| `CassationPrecedentDto` | `JudicialYear` | `"judicial_year"` |
| `CassationPrecedentDto` | `SessionDate` | `"session_date"` |
| `CassationPrecedentDto` | `FullText` | `"full_text"` |
| `FinalPrayerItemDto` | `RequestLevel` | `"request_level"` |
| `FinalPrayerItemDto` | `RequestText` | `"request_text"` |
| `FinalRequirementsResponseDto` | `FinalPrayers` | `"final_prayers"` |

#### `Lawyer.Application/Services/AiJobWorker.cs`
كل `JsonSerializer.Serialize(result.Data)` → `JsonSerializer.Serialize(result.Data, _jsonOptions)` في كل الـ steps (FactAnalysis, GenerateDefenses, AnalysisDefense, FinalRequirements, Lawsuit*, SerializeWorkflowResult)

#### `Lawyer.Application/Services/Workflows/StepOutputDtos.cs`
غيرنا الـ `FactAnalysisStepOutput` و `GenerateDefensesStepOutput` و `AnalysisDefenseStepOutput` و `FinalRequirementsStepOutput` من camelCase JsonPropertyName لـ snake_case عشان يطابقوا الـ prompts.

---

### المرحلة الثانية - صحيفة الدعوى

#### `Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitCaseTypeDto.cs`
| Property | JsonPropertyName |
|----------|-----------------|
| `CaseMainType` | `"case_main_type"` |
| `CaseSubType` | `"case_sub_type"` |
| `CourtType` | `"court_type"` |
| `ProceduralNature` | `"procedural_nature"` |
| `IsUrgentOrSummary` | `"is_urgent_or_summary"` |
| `JustificationSummary` | `"justification_summary"` |

#### `Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitPartiesDto.cs`
| Property | JsonPropertyName |
|----------|-----------------|
| `PartyDto.LegalCapacity` | `"legal_capacity"` |
| `PartyDto.NationalId` | `"national_id"` |

#### `Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitFactsDto.cs`
| Property | JsonPropertyName |
|----------|-----------------|
| `FactsNarrative` | `"facts_narrative"` |

#### `Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitSubjectsDto.cs`
| Property | JsonPropertyName |
|----------|-----------------|
| `SubjectTitle` | `"subject_title"` |
| `SubjectFullText` | `"subject_full_text"` |

#### `Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitLegalBasisDto.cs`
| Property | JsonPropertyName |
|----------|-----------------|
| `LegalTexts` | `"legal_texts"` |
| `CassationRulings` | `"cassation_rulings"` |
| `LegalTextDto.LawName` | `"law_name"` |
| `LegalTextDto.ArticleNumber` | `"article_number"` |
| `LegalTextDto.ArticleText` | `"article_text"` |
| `LegalTextDto.ApplicationNotes` | `"application_notes"` |
| `CassationRulingDto.AppealNumber` | `"appeal_number"` |
| `CassationRulingDto.JudicialYear` | `"judicial_year"` |
| `CassationRulingDto.SessionDate` | `"session_date"` |
| `CassationRulingDto.RulingText` | `"ruling_text"` |
| `CassationRulingDto.ApplicationNotes` | `"application_notes"` |

#### `Lawyer.Application/Dtos/PreparingStatementOfClaims/LawSuitRequestsDto.cs`
| Property | JsonPropertyName |
|----------|-----------------|
| `PrincipalRequests` | `"principal_requests"` |
| `SubsidiaryRequests` | `"subsidiary_requests"` |
| `ProceduralRequests` | `"procedural_requests"` |
| `LawSuitRequestItemDto.RequestNumber` | `"request_number"` |
| `LawSuitRequestItemDto.RequestText` | `"request_text"` |
| `LawSuitRequestItemDto.LegalReference` | `"legal_reference"` |

---

### ملاحظات عن باقي المراحل
- **تحليل الأحكام (Ruling)**: الـ prompts بتستخدم camelCase — لا مشكلة
- **الشكاوى الإدارية (Admin Complaint)**: الـ prompts بتستخدم camelCase — لا مشكلة
- **الإنذار الرسمي (Legal Warning)**: الـ prompts بتستخدم camelCase — لا مشكلة
- **الطلبات التنفيذية (Exec Request)**: الـ prompts بتستخدم camelCase — لا مشكلة
- **صحيفة الطعن (Appeal Brief)**: الـ prompts فيها snake_case كتير (31 key)، بس الـ `StepOutputDtos.cs` بيستخدم `JsonExtensionData` اللي بيمسك أي حاجة زيادة، والفرونت بيستخدم `[key: string]: any` — محتاج متابعة منفصلة لو البيانات مش بتظهر صح
