using Lawyer.Application.Common;
using Lawyer.Application.Dtos.SmartAnalysis;
using Lawyer.Application.IServices;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Net;
using System.Text;
using System.Text.Json;

namespace Lawyer.Application.Services.SmartAnalysis
{
    public class CaseSummaryService : ICaseSummaryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CaseSummaryService> _logger;
        private readonly ICaseAccessValidator _caseAccessValidator;
        private readonly string _contentRootPath;

        private static readonly JsonSerializerOptions CamelCaseOptions = Common.JsonOptions.Serialize;

        public CaseSummaryService(
            IUnitOfWork unitOfWork,
            ILogger<CaseSummaryService> logger,
            ICaseAccessValidator caseAccessValidator,
            IHostEnvironment env)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _caseAccessValidator = caseAccessValidator;
            _contentRootPath = env.ContentRootPath;
        }

        private async Task<string> ResolveCaseTypeNameAsync(int caseTypeId, CancellationToken cancellationToken)
        {
            var caseType = await _unitOfWork.Repository<Core.Models.CaseType>()
                .FirstOrDefaultAsync(x => x.Id == caseTypeId, cancellationToken);
            return caseType?.Title ?? string.Empty;
        }

        private static DefenseDetailDto MapToDefenseDetailDto(Core.Models.Defense defense)
        {
            return new DefenseDetailDto
            {
                Id = defense.Id,
                DefenseTitle = defense.DefenseTitle,
                BasisFromCase = defense.BasisFromCase,
                Scope = defense.Scope,
                Strength = defense.Strength.ToString()
            };
        }

        private static FinalPrayerItemDto MapToFinalPrayerDto(Core.Models.FinalPrayer prayer)
        {
            return new FinalPrayerItemDto
            {
                Id = prayer.Id,
                RequestLevel = prayer.Level switch
                {
                    Core.Enum.RequestLevel.Primary => "أصلي",
                    Core.Enum.RequestLevel.Subsidiary => "احتياطي",
                    Core.Enum.RequestLevel.TotalSubsidiary => "احتياطي كلي",
                    _ => "أصلي"
                },
                RequestText = prayer.RequestText
            };
        }

        public async Task<Result<CaseSmartAnalysisSummaryDto>> GetCaseSmartAnalysisSummaryAsync(
            Guid caseId,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (caseId == Guid.Empty)
                    return Result<CaseSmartAnalysisSummaryDto>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork
                    .Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == caseId, cancellationToken);

                if (caseEntity == null)
                    return Result<CaseSmartAnalysisSummaryDto>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<CaseSmartAnalysisSummaryDto>.Error(accessResult.StatusCode, accessResult.Message);

                var caseTypeName = await ResolveCaseTypeNameAsync(caseEntity.CaseTypeId, cancellationToken);

                var summary = new CaseSmartAnalysisSummaryDto
                {
                    CaseId = caseEntity.Id,
                    CaseNumber = caseEntity.Number,
                    CaseType = caseTypeName,
                    CourtName = caseEntity.Court,
                    ClientName = caseEntity.ClientName,
                    ApponentName = caseEntity.ApponentName
                };

                var factAnalysis = await _unitOfWork
                    .Repository<Core.Models.FactAnalysis>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId, cancellationToken);

                if (factAnalysis != null)
                {
                    summary.FactAnalysis = new CaseAnalysisResultDto
                    {
                        CaseType = caseTypeName,
                        CaseNumber = caseEntity.Number,
                        CourtName = caseEntity.Court,
                        LegalFactsSummary = string.IsNullOrEmpty(factAnalysis.LegalFactsSummaryJson) ? new() : JsonSerializer.Deserialize<List<string>>(factAnalysis.LegalFactsSummaryJson, CamelCaseOptions) ?? new(),
                        DefendantsPositions = string.IsNullOrEmpty(factAnalysis.DefendantsPositionsJson) ? new() : JsonSerializer.Deserialize<List<DefendantPositionDto>>(factAnalysis.DefendantsPositionsJson, CamelCaseOptions) ?? new(),
                        EvidenceMap = string.IsNullOrEmpty(factAnalysis.EvidenceMapJson) ? new() : JsonSerializer.Deserialize<List<EvidenceMapItemDto>>(factAnalysis.EvidenceMapJson, CamelCaseOptions) ?? new(),
                        LegalAndTechnicalReviewPoints = string.IsNullOrEmpty(factAnalysis.LegalAndTechnicalReviewPointsJson) ? new() : JsonSerializer.Deserialize<List<string>>(factAnalysis.LegalAndTechnicalReviewPointsJson, CamelCaseOptions) ?? new(),
                        PotentialLegalCharacterization = string.IsNullOrEmpty(factAnalysis.PotentialLegalCharacterizationJson) ? new() : JsonSerializer.Deserialize<PotentialLegalCharacterizationDto>(factAnalysis.PotentialLegalCharacterizationJson, CamelCaseOptions) ?? new()
                    };
                }

                var defenses = await _unitOfWork
                    .Repository<Core.Models.Defense>()
                    .WhereAsync(x => x.CaseId == caseId, cancellationToken);

                if (defenses.Any())
                {
                    summary.Defenses = new CaseDefensesResultDto
                    {
                        DefensesFormal = defenses
                            .Where(d => d.Type == Core.Enum.DefenseType.Formal)
                            .OrderByDescending(d => d.Strength)
                            .Select(MapToDefenseDetailDto)
                            .ToList(),
                        DefensesSubstantive = defenses
                            .Where(d => d.Type == Core.Enum.DefenseType.Substantive)
                            .OrderByDescending(d => d.Strength)
                            .Select(MapToDefenseDetailDto)
                            .ToList(),
                        DefensesEvidentiary = defenses
                            .Where(d => d.Type == Core.Enum.DefenseType.Evidentiary)
                            .OrderByDescending(d => d.Strength)
                            .Select(MapToDefenseDetailDto)
                            .ToList()
                    };
                }

                var finalPrayers = await _unitOfWork
                    .Repository<Core.Models.FinalPrayer>()
                    .WhereAsync(x => x.CaseId == caseId, cancellationToken);

                if (finalPrayers.Any())
                {
                    summary.FinalRequirements = new FinalRequirementsResponseDto
                    {
                        FinalPrayers = finalPrayers
                            .OrderBy(p => p.DisplayOrder)
                            .Select(MapToFinalPrayerDto)
                            .ToList()
                    };
                }

                var analyzedDefenses = defenses.Where(d => !string.IsNullOrWhiteSpace(d.AnalysisJson)).ToList();
                if (analyzedDefenses.Any())
                {
                    summary.DefenseAnalyses = analyzedDefenses.Select(d => new DefenseAnalysisSummaryItemDto
                    {
                        DefenseId = d.Id,
                        ExplanationJson = d.AnalysisJson
                    }).ToList();
                }

                var draftJob = await _unitOfWork.Repository<Core.Models.AiJob>()
                    .FirstOrDefaultAsync(x => x.CaseId == caseId && x.StepType == Core.Enum.AiStepType.DefenseMemoDraft, cancellationToken);
                
                if (draftJob != null)
                {
                    summary.DefenseMemoDraft = draftJob.ResultJson;
                    summary.LastSavedAt = draftJob.CompletedAt ?? draftJob.CreatedAt;

                    if (!string.IsNullOrEmpty(draftJob.ResultJson))
                    {
                        try
                        {
                            using var doc = System.Text.Json.JsonDocument.Parse(draftJob.ResultJson);
                            summary.IsMemoApproved = doc.RootElement.TryGetProperty("isApproved", out var approvedEl) && approvedEl.GetBoolean();
                        }
                        catch { }
                    }
                }

                _logger.LogInformation("Retrieved smart analysis summary for Case ID: {CaseId}", caseId);

                return Result<CaseSmartAnalysisSummaryDto>.Success(summary, "تم جلب ملخص التحليل الذكي بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting smart analysis summary for Case {CaseId}", caseId);
                return Result<CaseSmartAnalysisSummaryDto>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء جلب ملخص التحليل");
            }
        }

        public async Task<Result<byte[]>> GenerateCasePdfAsync(
            GenerateCasePdfRequestDto request,
            string userId,
            CancellationToken cancellationToken)
        {
            try
            {
                if (request.CaseId == Guid.Empty)
                    return Result<byte[]>.Error(System.Net.HttpStatusCode.BadRequest, "معرف القضية غير صالح");

                var caseEntity = await _unitOfWork
                    .Repository<Core.Models.Case>()
                    .FirstOrDefaultAsync(x => x.Id == request.CaseId, cancellationToken);

                if (caseEntity == null)
                    return Result<byte[]>.Error(HttpStatusCode.NotFound, "القضية غير موجودة");

                var accessResult = await _caseAccessValidator.ValidateAsync(caseEntity.Id, userId, false, cancellationToken);
                if (!accessResult.Succeeded)
                    return Result<byte[]>.Error(accessResult.StatusCode, accessResult.Message);

                var factAnalysis = await _unitOfWork
                    .Repository<Core.Models.FactAnalysis>()
                    .FirstOrDefaultAsync(x => x.CaseId == request.CaseId, cancellationToken);

                if (factAnalysis == null)
                    return Result<byte[]>.Error(HttpStatusCode.BadRequest, "لم يتم تحليل وقائع القضية بعد");

                var defenses = await _unitOfWork
                    .Repository<Core.Models.Defense>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                if (!defenses.Any())
                    return Result<byte[]>.Error(HttpStatusCode.BadRequest, "لم يتم توليد الدفوع بعد");

                var finalPrayers = await _unitOfWork
                    .Repository<Core.Models.FinalPrayer>()
                    .WhereAsync(x => x.CaseId == request.CaseId, cancellationToken);

                if (!finalPrayers.Any())
                    return Result<byte[]>.Error(HttpStatusCode.BadRequest, "لم يتم توليد الطلبات النهائية بعد");

                _logger.LogInformation("Generating PDF for Case ID: {CaseId}", request.CaseId);

                var pdfBytes = GeneratePdfFromData(caseEntity, factAnalysis, defenses, finalPrayers);

                _logger.LogInformation("PDF generated successfully for Case ID: {CaseId}", request.CaseId);

                return Result<byte[]>.Success(pdfBytes, "تم توليد ملف PDF بنجاح");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF for Case {CaseId}", request.CaseId);
                return Result<byte[]>.Error(HttpStatusCode.InternalServerError, "حدث خطأ أثناء توليد ملف PDF");
            }
        }

        private byte[] GeneratePdfFromData(
            Core.Models.Case caseEntity,
            Core.Models.FactAnalysis factAnalysis,
            IEnumerable<Core.Models.Defense> defenses,
            IEnumerable<Core.Models.FinalPrayer> finalPrayers)
        {
            var logoPath = Path.Combine(_contentRootPath, "wwwroot", "logo.png");
            byte[]? logoBytes = null;
            if (File.Exists(logoPath))
            {
                logoBytes = File.ReadAllBytes(logoPath);
            }

            var legalFactsSummary = JsonSerializer.Deserialize<List<string>>(factAnalysis.LegalFactsSummaryJson, CamelCaseOptions) ?? new();
            var evidenceMap = JsonSerializer.Deserialize<List<EvidenceMapItemDto>>(factAnalysis.EvidenceMapJson, CamelCaseOptions) ?? new();
            var legalCharacterization = JsonSerializer.Deserialize<PotentialLegalCharacterizationDto>(factAnalysis.PotentialLegalCharacterizationJson, CamelCaseOptions) ?? new();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(QuestPDF.Helpers.PageSizes.A4);
                    page.Margin(50);
                    page.DefaultTextStyle(x => x.FontSize(12).FontFamily("Tajawal"));
                    page.ContentFromRightToLeft();

                    page.Header().ShowOnce().Element(c => ComposeHeader(c, caseEntity, logoBytes));
                    page.Content().Element(c => ComposeStructuredContent(
                        c, caseEntity, legalFactsSummary, evidenceMap, legalCharacterization, defenses, finalPrayers));
                    page.Footer().Element(ComposeFooter);
                });
            });

            using var stream = new MemoryStream();
            document.GeneratePdf(stream);
            return stream.ToArray();
        }

        private void ComposeStructuredContent(
            QuestPDF.Infrastructure.IContainer container,
            Core.Models.Case caseEntity,
            List<string> legalFactsSummary,
            List<EvidenceMapItemDto> evidenceMap,
            PotentialLegalCharacterizationDto legalCharacterization,
            IEnumerable<Core.Models.Defense> defenses,
            IEnumerable<Core.Models.FinalPrayer> finalPrayers)
        {
            container.Column(column =>
            {
                column.Item().Text("أولاً: الوقائع").Bold().FontSize(14);
                column.Item().Height(8);

                if (!string.IsNullOrWhiteSpace(caseEntity.Facts))
                {
                    column.Item().Text(SanitizeForPdf(caseEntity.Facts)).FontSize(12).LineHeight(1.5f);
                    column.Item().Height(10);
                }

                if (legalFactsSummary.Any())
                {
                    column.Item().Text("ملخص الوقائع القانونية:").Bold().FontSize(13);
                    column.Item().Height(5);
                    foreach (var fact in legalFactsSummary)
                    {
                        column.Item().Text($"• {SanitizeForPdf(fact)}").FontSize(12).LineHeight(1.4f);
                    }
                    column.Item().Height(10);
                }

                column.Item().Height(10);
                column.Item().Text("ثانياً: التكييف القانوني").Bold().FontSize(14);
                column.Item().Height(8);

                if (!string.IsNullOrWhiteSpace(legalCharacterization.ChargeDescription))
                {
                    column.Item().Text($"وصف الاتهام: {SanitizeForPdf(legalCharacterization.ChargeDescription)}")
                        .FontSize(12).LineHeight(1.5f);
                    column.Item().Height(5);
                }

                if (legalCharacterization.ElementsReliedUpon?.Any() == true)
                {
                    column.Item().Text("العناصر المستند إليها:").Bold().FontSize(12);
                    foreach (var element in legalCharacterization.ElementsReliedUpon)
                    {
                        column.Item().Text($"• {SanitizeForPdf(element)}").FontSize(12).LineHeight(1.4f);
                    }
                    column.Item().Height(5);
                }

                if (legalCharacterization.ElementsLackingProof?.Any() == true)
                {
                    column.Item().Text("العناصر التي تفتقر للإثبات:").Bold().FontSize(12);
                    foreach (var element in legalCharacterization.ElementsLackingProof)
                    {
                        column.Item().Text($"• {SanitizeForPdf(element)}").FontSize(12).LineHeight(1.4f);
                    }
                    column.Item().Height(10);
                }

                if (evidenceMap.Any())
                {
                    column.Item().Height(10);
                    column.Item().Text("ثالثاً: خريطة الأدلة").Bold().FontSize(14);
                    column.Item().Height(8);

                    foreach (var evidence in evidenceMap)
                    {
                        column.Item().Text($"المصدر: {SanitizeForPdf(evidence.Source)}").Bold().FontSize(12);
                        if (!string.IsNullOrWhiteSpace(evidence.Proves))
                            column.Item().Text($"  يثبت: {SanitizeForPdf(evidence.Proves)}").FontSize(11);
                        if (!string.IsNullOrWhiteSpace(evidence.DoesNotProve))
                            column.Item().Text($"  لا يثبت: {SanitizeForPdf(evidence.DoesNotProve)}").FontSize(11);
                        if (!string.IsNullOrWhiteSpace(evidence.Limitations))
                            column.Item().Text($"  القيود: {SanitizeForPdf(evidence.Limitations)}").FontSize(11);
                        column.Item().Height(8);
                    }
                }

                column.Item().Height(10);
                column.Item().Text("رابعاً: الدفوع").Bold().FontSize(14);
                column.Item().Height(8);

                var defensesList = defenses.ToList();

                var formalDefenses = defensesList.Where(d => d.Type == Core.Enum.DefenseType.Formal).ToList();
                if (formalDefenses.Any())
                {
                    column.Item().Text("الدفوع الشكلية:").Bold().FontSize(13);
                    column.Item().Height(5);
                    for (int i = 0; i < formalDefenses.Count; i++)
                    {
                        column.Item().Text($"{i + 1}. {SanitizeForPdf(formalDefenses[i].DefenseTitle)}")
                            .FontSize(12).LineHeight(1.4f);
                    }
                    column.Item().Height(8);
                }

                var substantiveDefenses = defensesList.Where(d => d.Type == Core.Enum.DefenseType.Substantive).ToList();
                if (substantiveDefenses.Any())
                {
                    column.Item().Text("الدفوع الموضوعية:").Bold().FontSize(13);
                    column.Item().Height(5);
                    for (int i = 0; i < substantiveDefenses.Count; i++)
                    {
                        column.Item().Text($"{i + 1}. {SanitizeForPdf(substantiveDefenses[i].DefenseTitle)}")
                            .FontSize(12).LineHeight(1.4f);
                    }
                    column.Item().Height(8);
                }

                var evidentiaryDefenses = defensesList.Where(d => d.Type == Core.Enum.DefenseType.Evidentiary).ToList();
                if (evidentiaryDefenses.Any())
                {
                    column.Item().Text("الدفوع الإثباتية:").Bold().FontSize(13);
                    column.Item().Height(5);
                    for (int i = 0; i < evidentiaryDefenses.Count; i++)
                    {
                        column.Item().Text($"{i + 1}. {SanitizeForPdf(evidentiaryDefenses[i].DefenseTitle)}")
                            .FontSize(12).LineHeight(1.4f);
                    }
                    column.Item().Height(8);
                }

                column.Item().Height(10);
                column.Item().Text("بناءً عليه").Bold().FontSize(14);
                column.Item().Height(5);
                column.Item().Text("نلتمس من عدالة المحكمة الموقرة الحكم بالآتي:").FontSize(12);
                column.Item().Height(8);

                var prayersList = finalPrayers.OrderBy(p => p.DisplayOrder).ToList();

                var primaryPrayers = prayersList.Where(p => p.Level == Core.Enum.RequestLevel.Primary).ToList();
                if (primaryPrayers.Any())
                {
                    column.Item().Text("أصلياً:").Bold().FontSize(13);
                    foreach (var prayer in primaryPrayers)
                    {
                        column.Item().Text($"• {SanitizeForPdf(prayer.RequestText)}").FontSize(12).LineHeight(1.4f);
                    }
                    column.Item().Height(8);
                }

                var subsidiaryPrayers = prayersList.Where(p => p.Level == Core.Enum.RequestLevel.Subsidiary).ToList();
                if (subsidiaryPrayers.Any())
                {
                    column.Item().Text("احتياطياً:").Bold().FontSize(13);
                    foreach (var prayer in subsidiaryPrayers)
                    {
                        column.Item().Text($"• {SanitizeForPdf(prayer.RequestText)}").FontSize(12).LineHeight(1.4f);
                    }
                    column.Item().Height(8);
                }

                var totalSubsidiaryPrayers = prayersList.Where(p => p.Level == Core.Enum.RequestLevel.TotalSubsidiary).ToList();
                if (totalSubsidiaryPrayers.Any())
                {
                    column.Item().Text("احتياطياً كلياً:").Bold().FontSize(13);
                    foreach (var prayer in totalSubsidiaryPrayers)
                    {
                        column.Item().Text($"• {SanitizeForPdf(prayer.RequestText)}").FontSize(12).LineHeight(1.4f);
                    }
                    column.Item().Height(8);
                }

                column.Item().Height(30);
                column.Item().Text("مع حفظ كافة حقوق المتهم الأخرى").FontSize(12);
                column.Item().Height(20);
                column.Item().Text($"وكيل المتهم / {caseEntity.ClientName}").FontSize(12);
            });
        }

        private void ComposeHeader(QuestPDF.Infrastructure.IContainer container, Core.Models.Case caseEntity, byte[]? logoBytes)
        {
            container.Column(column =>
            {
                if (logoBytes != null)
                {
                    column.Item().AlignCenter().Width(80).Image(logoBytes);
                    column.Item().Height(10);
                }

                column.Item().AlignCenter().Text("بسم الله الرحمن الرحيم")
                    .Bold().FontSize(16);

                column.Item().Height(10);

                column.Item().AlignCenter().Text("مذكرة دفاع")
                    .Bold().FontSize(18);

                column.Item().Height(5);

                column.Item().AlignCenter().Text($"مقدمة إلى: {caseEntity.Court}")
                    .FontSize(14);

                column.Item().Height(5);

                column.Item().AlignCenter().Text($"في القضية رقم: {caseEntity.Number}")
                    .FontSize(14);

                column.Item().Height(10);

                column.Item().Row(row =>
                {
                    row.RelativeItem().AlignRight().Text($"المدعي: {caseEntity.ApponentName}");
                    row.RelativeItem().AlignLeft().Text($"المدعى عليه: {caseEntity.ClientName}");
                });

                column.Item().Height(10);
                column.Item().LineHorizontal(1);
                column.Item().Height(10);
            });
        }

        private void ComposeFooter(QuestPDF.Infrastructure.IContainer container)
        {
            container.Column(column =>
            {
                column.Item().LineHorizontal(1);
                column.Item().Height(5);
                column.Item().Row(row =>
                {
                    row.RelativeItem().AlignRight().Text(text =>
                    {
                        text.Span("وكيل المدعى عليه");
                    });
                    row.RelativeItem().AlignLeft().Text(text =>
                    {
                        text.Span("الصفحة ");
                        text.CurrentPageNumber();
                        text.Span(" من ");
                        text.TotalPages();
                    });
                });
            });
        }

        private static string SanitizeForPdf(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            return text
                .Normalize(NormalizationForm.FormC)
                .Replace("\u0640", "")
                .Replace("\u200F", "")
                .Replace("\u200E", "")
                .Replace("\u202A", "")
                .Replace("\u202B", "")
                .Replace("\u202C", "")
                .Replace("\uFEFF", "");
        }
    }
}
