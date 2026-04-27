import React from "react";
import { Card, CardBody } from "@heroui/react";
import { MdFolderOpen } from "react-icons/md";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "لا توجد بيانات",
  description = "لم يتم العثور على أية سجلات لعرضها في الوقت الحالي.",
  icon = <MdFolderOpen size={48} className="text-gray-400 dark:text-gray-500 mb-4" />,
  action,
}) => {
  return (
    <Card className="w-full shadow-sm border border-gray-100 dark:border-gray-800/50 bg-white dark:bg-[#161616] my-4" radius="md">
      <CardBody className="flex flex-col items-center justify-center p-12 text-center">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-full mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          {description}
        </p>
        {action && <div>{action}</div>}
      </CardBody>
    </Card>
  );
};

export default EmptyState;
