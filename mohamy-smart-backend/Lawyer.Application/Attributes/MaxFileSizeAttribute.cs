using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Lawyer.Application.Attributes;

public class MaxFileSizeAttribute : ValidationAttribute
{
    private readonly int _maxFileSize;

    public MaxFileSizeAttribute(int maxFileSize)
    {
        _maxFileSize = maxFileSize;
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is IFormFile file)
        {
            if (file.Length > _maxFileSize)
            {
                // Message in Arabic per Principle VI
                return new ValidationResult($"حجم الملف يتجاوز الحد الأقصى المسموح به وهو {_maxFileSize / (1024 * 1024)} ميجابايت.");
            }
        }
        else if (value is IEnumerable<IFormFile> files)
        {
            foreach (var f in files)
            {
                if (f.Length > _maxFileSize)
                {
                    return new ValidationResult($"حجم الملف يتجاوز الحد الأقصى المسموح به وهو {_maxFileSize / (1024 * 1024)} ميجابايت.");
                }
            }
        }

        return ValidationResult.Success;
    }
}
