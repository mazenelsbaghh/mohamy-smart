import { Breadcrumbs as HeroBreadcrumbs, BreadcrumbItem } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

export type Crumb = { label: string; to?: string };

type BreadcrumbsProps = {
    items: Crumb[];
    className?: string;
};

const Breadcrumbs = ({ items, className = '' }: BreadcrumbsProps) => {
    const navigate = useNavigate();

    if (!items || items.length === 0) return null;
    
    return (
        <HeroBreadcrumbs
            className={className}
            variant="solid"
            itemClasses={{
                item: "app-text-muted data-[current=true]:text-[var(--title-color)] font-medium data-[current=true]:font-semibold hover:text-[var(--main-color)] transition-colors",
                separator: "app-text-subtle px-1",
            }}
        >
            {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                return (
                    <BreadcrumbItem
                        key={`${item.label}-${idx}`}
                        isCurrent={isLast}
                        onPress={() => {
                            if (item.to && !isLast) {
                                navigate(item.to);
                            }
                        }}
                    >
                        {item.label}
                    </BreadcrumbItem>
                );
            })}
        </HeroBreadcrumbs>
    );
};

export default Breadcrumbs;
