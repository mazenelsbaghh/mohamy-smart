using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lawyer.Infrastructure.Persistence.Configuration
{
	internal class CaseTypeConfiguration : IEntityTypeConfiguration<CaseType>
	{
		public void Configure(EntityTypeBuilder<CaseType> builder)
		{
			builder.ToTable("CaseTypes");

			builder.HasKey(x => x.Id);

			builder.Property(x => x.Id)
				.ValueGeneratedOnAdd();

			builder.Property(x => x.Title)
				.IsRequired()
				.HasMaxLength(1000);

			builder.HasIndex(x => x.Title)
				.IsUnique();

			builder.HasData(
				new CaseType { Id = 1, Title = "قانون الإجراءات الجنائية" },
				new CaseType { Id = 2, Title = "قانون الأحوال الشخصية" },
				new CaseType { Id = 3, Title = "الجمعيات والمؤسسات الاهلية" },
				new CaseType { Id = 4, Title = "الخدمة المدنية والعاملين المدنيين بالدولة" },
				new CaseType { Id = 5, Title = "الدستور ومباشرة الحقوق السياسية" },
				new CaseType { Id = 6, Title = "العسكري" },
				new CaseType { Id = 7, Title = "العمل" },
				new CaseType { Id = 8, Title = "المدني" },
				new CaseType { Id = 9, Title = "الاثبات" },
				new CaseType { Id = 10, Title = "البنك المركزي" },
				new CaseType { Id = 11, Title = "الجمارك" },
				new CaseType { Id = 12, Title = "قانون الطوارئ وانشاء الدستورية العليا و انشاء محاكم أمن الدولة" },
				new CaseType { Id = 13, Title = "المرافعات" },
				new CaseType { Id = 14, Title = "التجارة والشركات والأوراق التجارية" },
				new CaseType { Id = 15, Title = "العقوبات" },
				new CaseType { Id = 16, Title = "تنظيم التعاقدات التي تبرمها الجهات العامة (المناقصات والمزايدات الجديد)" },
				new CaseType { Id = 17, Title = "حماية الملكية الفكرية والعلامة التجارية" },
				new CaseType { Id = 18, Title = "الاقتصاد والأسواق المالية والرقابة المالية" },
				new CaseType { Id = 19, Title = "التأمينات الاجتماعية والمعاشات" },
				new CaseType { Id = 20, Title = "الضريبة على الدخل وكسب العمل وضريبة القيمة المضافة والعقارية والدمغة والضريبة على العاملين المصريين بالخارج والفاتورة الالكترونية" },
				new CaseType { Id = 21, Title = "مجلس الدولة والقانون الإداري وهيئة قضايا الدولة ولجان توفيق المنازعات" },
				new CaseType { Id = 22, Title = "الدولي" },
				new CaseType { Id = 23, Title = "قانون الجنسية وقانون دخول وإقامة الأجانب" },
				new CaseType { Id = 24, Title = "حماية المال العام" },
				new CaseType { Id = 25, Title = "الأسماء التجارية" },
				new CaseType { Id = 26, Title = "الموانئ التخصصية" },
				new CaseType { Id = 27, Title = "منح التزام المرفق العام" },
				new CaseType { Id = 28, Title = "حماية المنافسة ومنع الممارسات الاحتكارية" },
				new CaseType { Id = 29, Title = "خطوط انابيب البترول" },
				new CaseType { Id = 30, Title = "المناجم والمحاجر" },
				new CaseType { Id = 31, Title = "حماية المستهلك" },
				new CaseType { Id = 32, Title = "المناطق الاقتصادية ذات الطبيعة الخاصة" },
				new CaseType { Id = 33, Title = "الاتحاد المصري لمقاولي التشييد والبناء" },
				new CaseType { Id = 34, Title = "حماية الاقتصاد القومي" },
				new CaseType { Id = 35, Title = "الغاز الطبيعي" },
				new CaseType { Id = 36, Title = "المحاكم الاقتصادية" },
				new CaseType { Id = 37, Title = "الضمان الاجتماعي" },
				new CaseType { Id = 38, Title = "الرقابة على الشرائط السينمائية" },
				new CaseType { Id = 39, Title = "السلك الدبلوماسي والقنصلي" },
				new CaseType { Id = 40, Title = "التأمين الصحي" },
				new CaseType { Id = 41, Title = "هيئة الشرطة" },
				new CaseType { Id = 42, Title = "هيئة تنمية الصعيد" },
				new CaseType { Id = 43, Title = "محال بيع العاديات والسلع السياحية" },
				new CaseType { Id = 44, Title = "صندوق مواجهة الطوارئ الطبية" },
				new CaseType { Id = 45, Title = "سجل المستوردين" },
				new CaseType { Id = 46, Title = "الوقف الخيري" },
				new CaseType { Id = 47, Title = "زرع الأعضاء البشرية" },
				new CaseType { Id = 48, Title = "دمغة صحفية لصالح معاشات الصحفيين" },
				new CaseType { Id = 49, Title = "حماية نهر النيل والمجاري المائية من التلوث" },
				new CaseType { Id = 50, Title = "تنظيم إدارة المخلفات والقمامة" },
				new CaseType { Id = 51, Title = "خدمات النقل البري للركاب باستخدام تكنولوجيا المعلومات برامج اوبر وكريم وغيرها)" },
				new CaseType { Id = 52, Title = "استثناء قيد بعض الشركات غير المملوكة للمصريين أو المملوكة لهم بنسبة 51% من بعض أحكام سجل المستوردين العام للدولة المالية العامة الموحد قانون المنشآت الفندقية والسياحية 2022 الوكالة المصرية لضمان الصادرات والاستثمار دعم السياحة والآثار الثروة المائية تنظيم اعمال القياس والمعايرة المترو لوجيا مجلس الشيوخ الوطني للعمل الأهلي التنموي قانون تنظيم انتظار المركبات في الشارع البارك إنشاء البوابة المصرية للعمرة وتنفيذ الشركات السياحية رحلات العمرة إنشاء الجهاز المصري للملكية الفكرية إنشاء المجلس الأعلى لصناعة السيارات وصندوق تمويل صناعة السيارات صديقة البيئة إصدار التحالف صندوق تعاونيات التخطيط" },
				new CaseType { Id = 53, Title = "إنشاء المجلس الأعلى لمواجهة الإرهاب والتطرف" },
				new CaseType { Id = 54, Title = "إنشاء المركز القومي لإدارة المجال الجوي" },
				new CaseType { Id = 55, Title = "إنشاء صندوق تحسين خدمات الرعاية الاجتماعية والصحية لأعضاء هيئة الشرطة وأسرهم" },
				new CaseType { Id = 56, Title = "إنشاء وتنظيم المجلس الصحي المصري" },
				new CaseType { Id = 57, Title = "تعديل بعض أحكام إعادة تنظيم الأزهر وقانون التعليم المد للمعلمين بعد سن المعاش" },
				new CaseType { Id = 58, Title = "تعديل بعض أحكام قانون الأراضي الصحراوية" },
				new CaseType { Id = 59, Title = "تعديل بعض أحكام قانون جوازات السفر" },
				new CaseType { Id = 60, Title = "تنظيم البحوث الطبية الإكلينيكية" },
				new CaseType { Id = 61, Title = "قانون رعاية حقوق المسنين" },
				new CaseType { Id = 62, Title = "قانون تنمية المشروعات المتوسطة والصغيرة ومتناهية الصغر" },
				new CaseType { Id = 63, Title = "قانون تنظيم مشاركة القطاع الخاص في مشروعات البنية الاساسية والخدمات والمرافق العامة" },
				new CaseType { Id = 64, Title = "تنظيم البعثات والمنح والإجازات الدراسية" },
				new CaseType { Id = 65, Title = "تنظيم مراقبة الأغذية وتداولها" },
				new CaseType { Id = 66, Title = "تنظيم وتشجيع عمل وحدات الطعام المتنقلة" },
				new CaseType { Id = 67, Title = "جائزة الدولة للمبدع الصغير" },
				new CaseType { Id = 68, Title = "حماية البيانات الشخصية" },
				new CaseType { Id = 69, Title = "في شأن شروط شغل الوظائف أو الاستمرار فيها عزل الموظف متعاطي المخدرات»" },
				new CaseType { Id = 70, Title = "قانون اجراءات مواجهة الاوبئة والجوائح الصحية" },
				new CaseType { Id = 71, Title = "قانون إعادة تنظيم هيئة الأوقاف المصرية" },
				new CaseType { Id = 72, Title = "قانون الأحكام المتعلقة بأملاك الدولة الخاصة" },
				new CaseType { Id = 73, Title = "قانون الاحوال المدنية" },
				new CaseType { Id = 74, Title = "قانون الاستيراد والتصدير" },
				new CaseType { Id = 75, Title = "قانون الإسكان الاجتماعي ودعم التمويل العقاري" },
				new CaseType { Id = 76, Title = "قوانين التعليم والجامعات الخاصة والأهلية" },
				new CaseType { Id = 77, Title = "قانون الثروة المعدنية" },
				new CaseType { Id = 78, Title = "قانون السجل التجاري وقانون الحراس الخصوصيين" },
				new CaseType { Id = 79, Title = "قانون الموازنة العامة للدولة" },
				new CaseType { Id = 80, Title = "قانون إنشاء هيئة تمويل العلوم والتكنولوجيا والابتكار" },
				new CaseType { Id = 81, Title = "قانون بإشراف وزارة السياحة على المناطق السياحية واستغلالها" },
				new CaseType { Id = 82, Title = "قانون بإنشاء هيئة تنمية واستخدام الطاقة الجديدة والمتجددة" },
				new CaseType { Id = 83, Title = "قانون بشأن تحفيز إنتاج الكهرباء من مصادر الطاقة المتجددة" },
				new CaseType { Id = 84, Title = "قانون تنظيم الحق في الاجتماعات العامة والمواكب والتظاهرات السلمية" },
				new CaseType { Id = 85, Title = "قوانين مهن العلاج الطبيعي والبيطري والتوليد والنقابات" },
				new CaseType { Id = 86, Title = "قانون إنشاء اتحاد الكتاب رقم 65 لسنة 1975" },
				new CaseType { Id = 87, Title = "قانون تنظيم التعاقدات التي تبرمها الجهات العامة 2018 المناقصات والمزايدات" },
				new CaseType { Id = 88, Title = "قانون رقم 8 لسنة 2015 بتنظيم قوائم الكيانات الإرهابية والإرهابيين" },
				new CaseType { Id = 89, Title = "قانون انشاء صندوق اعانات طواريء للعمال" }
			);
		}
	}
}
