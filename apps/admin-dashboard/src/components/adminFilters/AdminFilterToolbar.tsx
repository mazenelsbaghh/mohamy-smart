import { Button, Input, Select, SelectItem } from "@heroui/react";
import { FaSearch, FaTimes } from "react-icons/fa";

export type AdminFilterOption = {
  value: string;
  label: string;
};

export type AdminFilterSelect = {
  key: string;
  label: string;
  value: string;
  options: AdminFilterOption[];
  onChange: (value: string) => void;
};

type AdminFilterToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters?: AdminFilterSelect[];
  totalCount: number;
  filteredCount?: number;
  isFiltering: boolean;
  onReset: () => void;
};

const AdminFilterToolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  totalCount,
  filteredCount,
  isFiltering,
  onReset,
}: AdminFilterToolbarProps) => {
  const visibleCount = filteredCount ?? totalCount;

  return (
    <div className="admin-filter-toolbar" role="search" aria-label="بحث وفلاتر الإدارة">
      <div className="admin-filter-toolbar__search">
        <Input
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          value={searchValue}
          onValueChange={onSearchChange}
          variant="bordered"
          radius="lg"
          startContent={<FaSearch className="text-[var(--muted-color)]" />}
          isClearable
          onClear={() => onSearchChange("")}
          classNames={{
            inputWrapper: "bg-[var(--surface-color)] border-[var(--border-color)] shadow-none",
            input: "text-[var(--title-color)] placeholder:text-[var(--text-color)]",
          }}
        />
      </div>

      {filters.length > 0 && (
        <div className="admin-filter-toolbar__filters">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              aria-label={filter.label}
              label={filter.label}
              labelPlacement="outside"
              selectedKeys={new Set([filter.value])}
              onSelectionChange={(keys) => {
                const nextValue = Array.from(keys)[0];
                filter.onChange(typeof nextValue === "string" ? nextValue : "");
              }}
              size="sm"
              radius="lg"
              className="admin-filter-toolbar__select"
              classNames={{
                trigger: "bg-[var(--surface-color)] border-[var(--border-color)]",
                label: "text-[var(--text-color)]",
                value: "text-[var(--title-color)]",
              }}
            >
              {filter.options.map((option) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>
          ))}
        </div>
      )}

      <div className="admin-filter-toolbar__meta">
        <span>
          {isFiltering
            ? `${visibleCount} نتيجة من ${totalCount}`
            : `${totalCount} سجل`}
        </span>
        <Button
          type="button"
          size="sm"
          variant="flat"
          color="default"
          radius="lg"
          startContent={<FaTimes />}
          isDisabled={!isFiltering}
          onPress={onReset}
        >
          مسح
        </Button>
      </div>
    </div>
  );
};

export default AdminFilterToolbar;
