import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface DeviceCardSkeletonProps {
  count?: number;
}

export const DeviceCardSkeleton = ({ count = 12 }: DeviceCardSkeletonProps) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
          }
        }
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                duration: 0.5,
                ease: "easeOut"
              }
            }
          }}
        >
          <Card className="relative overflow-hidden shadow-lg">
            {/* Add a subtle shimmer effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer translate-x-[-100%] animation-delay-300ms"></div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 bg-gradient-to-r from-muted to-muted/50" />
                  <Skeleton className="h-4 w-24 bg-gradient-to-r from-muted to-muted/50" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full bg-gradient-to-r from-muted to-muted/50" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Skeleton className="h-3 w-12 mb-1 bg-gradient-to-r from-muted to-muted/50" />
                  <Skeleton className="h-4 w-16 bg-gradient-to-r from-muted to-muted/50" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-1 bg-gradient-to-r from-muted to-muted/50" />
                  <Skeleton className="h-4 w-20 bg-gradient-to-r from-muted to-muted/50" />
                </div>
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-1 bg-gradient-to-r from-muted to-muted/50" />
                <Skeleton className="h-4 w-full bg-gradient-to-r from-muted to-muted/50" />
              </div>
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-6 w-16 rounded bg-gradient-to-r from-muted to-muted/50" />
                <Skeleton className="h-6 w-12 rounded bg-gradient-to-r from-muted to-muted/50" />
                <Skeleton className="h-6 w-14 rounded bg-gradient-to-r from-muted to-muted/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};