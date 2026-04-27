import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { MdErrorOutline, MdRefresh } from "react-icons/md";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "حدث خطأ",
  message = "عذراً، حدث خطأ غير متوقع أثناء محاولة جلب البيانات.",
  onRetry,
  icon = <MdErrorOutline size={48} className="text-danger mb-4" />,
}) => {
  return (
    <Card className="w-full shadow-sm border border-danger-100 dark:border-danger-900/30 bg-danger-50/50 dark:bg-danger-900/10 my-4" radius="md">
      <CardBody className="flex flex-col items-center justify-center p-12 text-center">
        <div className="bg-danger-100 dark:bg-danger-900/30 p-6 rounded-full mb-4 text-danger">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-danger-700 dark:text-danger-400 mb-2">{title}</h3>
        <p className="text-sm text-danger-600/80 dark:text-danger-300/80 max-w-md mx-auto mb-6">
          {message}
        </p>
        {onRetry && (
          <Button 
            color="danger" 
            variant="flat" 
            onPress={onRetry}
            startContent={<MdRefresh size={16} />}
            className="font-medium"
          >
            إعادة المحاولة
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default ErrorState;
