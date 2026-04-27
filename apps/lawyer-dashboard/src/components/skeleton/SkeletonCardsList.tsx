import { Card, Skeleton } from"@heroui/react";
const SkeletonCardsList = () => {
 return (
 <div className="w-full flex flex-wrap">
 <div className="w-full mb-4">
 <Card className="w-full space-y-5 p-4 min-h-[200px]" radius="lg">
 <Skeleton className="rounded-lg">
 <div className="h-25 rounded-lg bg-secondary" />
 </Skeleton>
 <div className="space-y-3">
 <Skeleton className="w-3/5 rounded-lg" >
 <div className="h-3 w-full rounded-lg bg-secondary" />
 </Skeleton>
 <Skeleton className="w-4/5 rounded-lg" >
 <div className="h-3 w-full rounded-lg bg-secondary-300" />
 </Skeleton>
 <Skeleton className="w-2/5 rounded-lg" >
 <div className="h-3 w-full rounded-lg bg-secondary-200" />
 </Skeleton>
 </div>
 </Card>
 </div>
 <div className="w-full mb-4">
 <Card className="w-full space-y-5 p-4 min-h-[200px]" radius="lg">
 <Skeleton className="rounded-lg">
 <div className="h-25 rounded-lg bg-secondary" />
 </Skeleton>
 <div className="space-y-3">
 <Skeleton className="w-3/5 rounded-lg" >
 <div className="h-3 w-full rounded-lg bg-secondary" />
 </Skeleton>
 <Skeleton className="w-4/5 rounded-lg" >
 <div className="h-3 w-full rounded-lg bg-secondary-300" />
 </Skeleton>
 <Skeleton className="w-2/5 rounded-lg" >
 <div className="h-3 w-full rounded-lg bg-secondary-200" />
 </Skeleton>
 </div>
 </Card>
 </div>
 <div className="w-full mb-4">
 <Card className="w-full space-y-5 p-4 min-h-[200px]" radius="lg">
 <Skeleton className="rounded-lg">
 <div className="h-25 rounded-lg bg-secondary" />
 </Skeleton>
 <div className="space-y-3">
 <Skeleton className="w-3/5 rounded-lg" >
 <div className="h-3 w-full rounded-lg bg-secondary" />
 </Skeleton>
 <Skeleton className="w-4/5 rounded-lg" >
 <div className="h-3 w-full rounded-lg bg-secondary-300" />
 </Skeleton>
 <Skeleton className="w-2/5 rounded-lg" >
 <div className="h-3 w-full rounded-lg bg-secondary-200" />
 </Skeleton>
 </div>
 </Card>
 </div>
 </div>
 );
};

export default SkeletonCardsList;