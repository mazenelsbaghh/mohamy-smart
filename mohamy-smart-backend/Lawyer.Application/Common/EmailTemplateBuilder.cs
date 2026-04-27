using System;

namespace Lawyer.Application.Common
{
    public static class EmailTemplateBuilder
    {
        public static string BuildEmailTemplate(string title, string content)
        {
            return $@"
<!DOCTYPE html>
<html lang=""ar"" dir=""rtl"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #F0EEE7;
            margin: 0;
            padding: 0;
            color: #1B1B1B;
            direction: rtl;
            text-align: right;
            -webkit-font-smoothing: antialiased;
        }}
        .email-wrapper {{
            background-color: #F0EEE7;
            padding: 40px 20px;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.04);
        }}
        .header {{
            background-color: #EF950A;
            padding: 40px 32px;
            text-align: center;
        }}
        .header h1 {{
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }}
        .content {{
            padding: 48px 40px;
            line-height: 1.8;
            font-size: 16px;
            color: #1B1B1BA6;
        }}
        .content h2 {{
            color: #1B1B1B;
            font-size: 22px;
            margin-top: 0;
            margin-bottom: 24px;
            font-weight: 700;
        }}
        .content p {{
            margin-bottom: 16px;
            margin-top: 0;
        }}
        .footer {{
            background-color: #FBFAE8;
            padding: 32px;
            text-align: center;
            font-size: 14px;
            color: #1B1B1BA6;
            border-top: 1px solid rgba(239, 149, 10, 0.1);
        }}
        .footer p {{
            margin: 4px 0;
        }}
    </style>
</head>
<body>
    <div class=""email-wrapper"">
        <div class=""container"">
            <div class=""header"">
                <h1>محامي سمارت</h1>
            </div>
            <div class=""content"">
                {content}
            </div>
            <div class=""footer"">
                <p>هذه رسالة تلقائية من نظام محامي سمارت، يرجى عدم الرد عليها.</p>
                <p>© {DateTime.UtcNow.Year} محامي سمارت. جميع الحقوق محفوظة.</p>
            </div>
        </div>
    </div>
</body>
</html>";
        }
    }
}
