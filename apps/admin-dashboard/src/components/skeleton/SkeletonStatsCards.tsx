import { Skeleton } from'@heroui/react';

const SkeletonStatsCards = () => {
	return (
		<div className="flex flex-wrap items-center justify-between">
			<div className="w-full md:w-6/12 lg:w-4/12 px-1 mb-4">
				<div className="stats-card">
					<div className="flex items-center gap-4 mb-4">
						<Skeleton className="rounded-full w-[55px] h-[55px] flex-shrink-0" />
						<Skeleton className="rounded-md w-24 h-5" />
					</div>
					<Skeleton className="rounded-md w-20 h-8" />
				</div>
			</div>
			<div className="w-full md:w-6/12 lg:w-4/12 px-1 mb-4">
				<div className="stats-card">
					<div className="flex items-center gap-4 mb-4">
						<Skeleton className="rounded-full w-[55px] h-[55px] flex-shrink-0" />
						<Skeleton className="rounded-md w-24 h-5" />
					</div>
					<Skeleton className="rounded-md w-20 h-8" />
				</div>
			</div>
			<div className="w-full md:w-6/12 lg:w-4/12 px-1 mb-4">
				<div className="stats-card">
					<div className="flex items-center gap-4 mb-4">
						<Skeleton className="rounded-full w-[55px] h-[55px] flex-shrink-0" />
						<Skeleton className="rounded-md w-24 h-5" />
					</div>
					<Skeleton className="rounded-md w-20 h-8" />
				</div>
			</div>
		</div>
	);
};

export default SkeletonStatsCards;
