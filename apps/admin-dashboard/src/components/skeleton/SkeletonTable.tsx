import { Skeleton } from'@heroui/react';

type TSkeletonTable = {
	rows?: number;
	cols?: number;
};

const SkeletonTable = ({ rows = 5, cols = 6 }: TSkeletonTable) => {
	return (
		<div className="w-full rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--surface-color)]">
			<div className="flex gap-4 px-6 py-4 border-b border-[var(--border-color)]">
				{Array.from({ length: cols }).map((_, i) => (
					<Skeleton key={i} className="rounded-md h-4 flex-1" />
				))}
			</div>
			{Array.from({ length: rows }).map((_, rowIdx) => (
				<div key={rowIdx} className="flex gap-4 px-6 py-4 border-b border-[var(--border-color)] last:border-b-0">
					{Array.from({ length: cols }).map((_, colIdx) => (
						<Skeleton key={colIdx} className="rounded-md h-4 flex-1" />
					))}
				</div>
			))}
		</div>
	);
};

export default SkeletonTable;
