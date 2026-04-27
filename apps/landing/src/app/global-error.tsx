'use client';

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    fontFamily: 'Tajawal, sans-serif',
                    padding: '2rem',
                    textAlign: 'center',
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>حدث خطأ غير متوقع</h1>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.</p>
                    <button
                        onClick={reset}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: '#D4A017',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '1rem',
                        }}
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </body>
        </html>
    );
}
