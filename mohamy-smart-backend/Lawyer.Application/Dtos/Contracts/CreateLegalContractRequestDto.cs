using System;
using System.ComponentModel.DataAnnotations;

namespace Lawyer.Application.Dtos.Contracts
{
    /// <summary>
    /// Request payload for POST /api/LegalContracts.
    /// 
    /// Example usage:
    /// {
    ///   "clientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ///   "contractTypeCode": "lease",
    ///   "details": "عقد إيجار شقة سكنية في مدينة نصر، القاهرة. إيجار شهري 5000 جنيه لمدة سنة قابلة للتجديد.",
    ///   "customClauses": "شرط جزائي 10000 جنيه في حالة الإخلال بالعقد. عدم جواز التنازل عن العقد للغير."
    /// }
    /// </summary>
    public class CreateLegalContractRequestDto
    {
        /// <summary>
        /// معرف الموكل المسجل لدى المحامي. يجب أن يكون موكلًا موجودًا بالفعل في النظام.
        /// </summary>
        [Required(ErrorMessage = "معرف الموكل مطلوب — اختر موكلًا من قائمة الموكلين المسجلين لديك.")]
        public Guid ClientId { get; set; }

        /// <summary>
        /// رمز نوع العقد. القيم المتاحة:
        /// lease (إيجار), sale (بيع), employment (عمل), partnership (شراكة),
        /// services (خدمات), loan (قرض), power_attorney (توكيل), contractor (مقاولة),
        /// agency (وكالة), other (آخر)
        /// </summary>
        [Required(ErrorMessage = "نوع العقد مطلوب — اختر نوع العقد مثل: إيجار، بيع، عمل، شراكة.")]
        [MaxLength(100, ErrorMessage = "نوع العقد لا يتجاوز 100 حرف")]
        public string ContractTypeCode { get; set; } = string.Empty;

        /// <summary>
        /// وصف تفصيلي للعلاقة التعاقدية يتضمن:
        /// - موضوع العقد (إيجار شقة، بيع سيارة، توظيف موظف، إلخ)
        /// - القيمة المالية إن وجدت (مبلغ الإيجار، ثمن البيع، الراتب)
        /// - المدة الزمنية إن وجدت (سنة، 6 أشهر، غير محددة)
        /// - أي ظروف أو شروط خاصة بالاتفاق
        /// 
        /// مثال: "عقد إيجار شقة سكنية في مدينة نصر، إيجار شهري 5000 جنيه، لمدة سنة، مع حق التجديد التلقائي"
        /// </summary>
        [Required(ErrorMessage = "تفاصيل العقد مطلوبة — اكتب وصفًا يتضمن: موضوع العقد، القيمة المالية إن وجدت، والمدة.")]
        [MinLength(20, ErrorMessage = "التفاصيل قصيرة جدًا — اكتب على الأقل جملتين توضح موضوع العقد وظروفه. مثال: عقد إيجار شقة بمبلغ 5000 جنيه شهريًا لمدة سنة.")]
        [MaxLength(5000, ErrorMessage = "تفاصيل العقد لا تتجاوز 5000 حرف — حاول اختصار التفاصيل أو توزيعها على البنود الخاصة.")]
        public string Details { get; set; } = string.Empty;

        /// <summary>
        /// بنود إضافية يريد المحامي إدراجها حرفيًا في العقد (اختياري).
        /// مثال: "شرط جزائي 10000 جنيه في حالة الإخلال" أو "عدم جواز التنازل عن العقد للغير"
        /// </summary>
        [MaxLength(3000, ErrorMessage = "البنود الخاصة لا تتجاوز 3000 حرف — يمكنك تضمين أهم البنود وإضافة الباقي يدويًا بعد المراجعة.")]
        public string? CustomClauses { get; set; }
    }
}
