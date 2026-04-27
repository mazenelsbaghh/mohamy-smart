import { Skeleton } from"@heroui/react";

const SkeletonList = () => {
 return (
 <div className="w-full">
 <div className="w-full flex flex-col gap-3">
 <Skeleton className="h-12 w-full rounded-lg" />
 <Skeleton className="h-12 w-full rounded-lg" />
 <Skeleton className="h-12 w-full rounded-lg" />
 <Skeleton className="h-12 w-full rounded-lg" />
 <Skeleton className="h-12 w-full rounded-lg" />
 </div>
 </div>
 );
};

export default SkeletonList;