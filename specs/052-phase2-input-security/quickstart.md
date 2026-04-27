# Quickstart: Security Features

## 1. Local ClamAV Setup
The `docker-compose.yml` has been updated to include a `clamav` container for local virus scanning.
Run the following to start the new service:
```bash
make dev
```
*Note: The ClamAV container may take a few minutes to download virus definitions on the first startup. During this time, file uploads might be delayed or temporarily rejected until the scanner is healthy.*

## 2. Using File Validation Attributes
When adding new file upload endpoints, use the provided validation attributes in your DTOs (`Lawyer.Application`):

```csharp
public class DocumentUploadDto
{
    [MaxFileSize(10 * 1024 * 1024)] // 10 MB
    [AllowedExtensions(new[] { ".pdf", ".docx", ".jpg", ".png" })]
    [Required]
    public IFormFile File { get; set; }
}
```

## 3. Frontend XSS Sanitization
When rendering AI outputs or any user-generated HTML in the React dashboards, you **must** sanitize the content:

```tsx
import DOMPurify from 'dompurify';

export const SafeHtmlRenderer = ({ htmlContent }) => {
  const cleanHtml = DOMPurify.sanitize(htmlContent);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};
```

## 4. Accessing Hangfire Dashboard
The Hangfire dashboard is secured. To access it:
1. Log in to the application as a user with the `Admin` role.
2. The dashboard will look for your authentication cookie/token.
3. Navigate to `/hangfire`. If you are not an Admin, you will receive a 401/403 Unauthorized error.
