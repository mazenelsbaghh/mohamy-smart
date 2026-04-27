import React, { type ReactNode } from'react';
import { Spinner } from'@heroui/react';

interface AsyncStateProps {
 isLoading: boolean;
 isError?: boolean;
 isEmpty?: boolean;
 isUnsupported?: boolean;
 errorMessage?: string;
 emptyMessage?: string;
 unsupportedMessage?: string;
 children?: ReactNode;
}

export const AsyncState: React.FC<AsyncStateProps> = ({
 isLoading,
 isError,
 isEmpty,
 isUnsupported,
 errorMessage = 'تعذّر تحميل البيانات. تحقق من اتصالك بالإنترنت وأعد المحاولة.',
 emptyMessage = 'لا توجد بيانات هنا بعد.',
 unsupportedMessage = 'هذه الميزة غير متاحة في خطتك الحالية.',
 children,
}) => {
 if (isLoading) {
 return (
 <div className="flex justify-center items-center p-8 w-full min-h-[200px]">
 <Spinner size="lg" color="primary" />
 </div>
 );
 }

 if (isError) {
 return (
 <div className="flex justify-center items-center p-8 w-full text-danger text-center min-h-[200px]">
 <p className="text-lg font-medium">{errorMessage}</p>
 </div>
 );
 }

 if (isUnsupported) {
 return (
 <div className="flex justify-center items-center p-8 w-full text-warning text-center bg-warning-50 rounded-lg min-h-[200px]">
 <p className="text-lg font-medium">{unsupportedMessage}</p>
 </div>
 );
 }

 if (isEmpty) {
 return (
 <div className="flex justify-center items-center p-8 w-full text-default-500 text-center min-h-[200px]">
 <p className="text-lg">{emptyMessage}</p>
 </div>
 );
 }

 return <>{children}</>;
};
