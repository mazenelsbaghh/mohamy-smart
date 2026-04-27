import { Skeleton } from'@heroui/react'

const SkeletonForm = () => {
 return (
 <div className='flex flex-wrap'>
 <div className="w-full flex gap-3 p-4">
 <Skeleton className="h-[30px] w-[30%] rounded-md" />
 <Skeleton className="h-[30px] w-10 rounded-md" />
 </div>
 <div className="w-full sm:w-6/12 p-4">
 <Skeleton className="h-[20px] w-[30%] rounded-sm mb-5" />
 <Skeleton className="h-[55px] w-full rounded-md" />
 </div>
 <div className="w-full sm:w-6/12 p-4">
 <Skeleton className="h-[20px] w-[30%] rounded-sm mb-5" />
 <Skeleton className="h-[55px] w-full rounded-md" />
 </div>
 <div className="w-full sm:w-6/12 p-4">
 <Skeleton className="h-[20px] w-[30%] rounded-sm mb-5" />
 <Skeleton className="h-[55px] w-full rounded-md" />
 </div>
 <div className="w-full sm:w-6/12 p-4">
 <Skeleton className="h-[20px] w-[30%] rounded-sm mb-5" />
 <Skeleton className="h-[55px] w-full rounded-md" />
 </div>
 <div className="w-full sm:w-6/12 p-4">
 <Skeleton className="h-[20px] w-[30%] rounded-sm mb-5" />
 <Skeleton className="h-[55px] w-full rounded-md" />
 </div>
 <div className="w-full sm:w-6/12 p-4">
 <Skeleton className="h-[20px] w-[30%] rounded-sm mb-5" />
 <Skeleton className="h-[55px] w-full rounded-md" />
 </div>
 <div className="w-full sm:w-6/12 p-4">
 <Skeleton className="h-[20px] w-[30%] rounded-sm mb-5" />
 <Skeleton className="h-[55px] w-full rounded-md" />
 </div>
 <div className="w-full sm:w-6/12 p-4">
 <Skeleton className="h-[20px] w-[30%] rounded-sm mb-5" />
 <Skeleton className="h-[55px] w-full rounded-md" />
 </div>
 </div>
 )
}

export default SkeletonForm