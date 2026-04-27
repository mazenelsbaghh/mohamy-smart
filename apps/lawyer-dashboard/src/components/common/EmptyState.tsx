import { CustomButton } from '@mohamy/shared-ui';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type EmptyStateProps = {
    icon?: ReactNode;
    title: string;
    description?: string;
    primaryAction?: { label: string; onClick: () => void; icon?: ReactNode };
    secondaryAction?: { label: string; to: string };
    className?: string;
};

const EmptyState = ({
    icon,
    title,
    description,
    primaryAction,
    secondaryAction,
    className = '',
}: EmptyStateProps) => {
    return (
        <div
            dir="rtl"
            className={`w-full flex flex-col items-center justify-center text-center py-12 px-6 gap-4 ${className}`}
        >
            {icon && (
                <div className="w-16 h-16 rounded-full app-accent-soft flex items-center justify-center text-[var(--main-color)] text-3xl">
                    {icon}
                </div>
            )}
            <h3 className="text-lg md:text-xl font-bold text-[var(--title-color)] m-0">{title}</h3>
            {description && (
                <p className="text-sm app-text-muted max-w-md leading-relaxed m-0">{description}</p>
            )}
            {(primaryAction || secondaryAction) && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                    {primaryAction && (
                        <CustomButton
                            type="button"
                            text={primaryAction.label}
                            color="primary"
                            radius="full"
                            size="md"
                            startContent={primaryAction.icon}
                            onClick={primaryAction.onClick}
                        />
                    )}
                    {secondaryAction && (
                        <Link
                            to={secondaryAction.to}
                            className="text-sm font-semibold text-[var(--main-color)] hover:underline"
                        >
                            {secondaryAction.label}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
