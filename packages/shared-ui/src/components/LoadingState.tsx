import React from "react";
import { Spinner, Card, CardBody } from "@heroui/react";

interface LoadingStateProps {
  message?: string;
  isCard?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "جاري التحميل...",
  isCard = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[200px]">
      <Spinner size="lg" color="warning" className="mb-4" />
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{message}</h3>
    </div>
  );

  if (!isCard) {
    return content;
  }

  return (
    <Card className="w-full shadow-sm border border-gray-100 dark:border-gray-800/50 bg-white dark:bg-[#161616] my-4" radius="md">
      <CardBody>
        {content}
      </CardBody>
    </Card>
  );
};

export default LoadingState;
