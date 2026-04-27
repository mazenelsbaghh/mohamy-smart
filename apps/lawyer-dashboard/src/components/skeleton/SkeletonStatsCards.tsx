import { Skeleton } from"@heroui/react"

const SkeletonStatsCards = () => {
 return (
 <div className="w-full flex flex-wrap">
 <div className="w-full sm:w-3/12 lg:w-4/12 p-2">
 <Skeleton className="rounded-lg">
 <div className="h-40 rounded-lg bg-secondary" />
 </Skeleton>
 </div>
 <div className="w-full sm:w-3/12 lg:w-4/12 p-2">
 <Skeleton className="rounded-lg">
 <div className="h-40 rounded-lg bg-secondary" />
 </Skeleton>
 </div>
 <div className="w-full sm:w-3/12 lg:w-4/12 p-2">
 <Skeleton className="rounded-lg">
 <div className="h-40 rounded-lg bg-secondary" />
 </Skeleton>
 </div>
 </div>
 )
}

export default SkeletonStatsCards