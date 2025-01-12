import { cn } from '@/lib/utils'
import { HTMLMotionProps, motion } from 'framer-motion'

function Skeleton({
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn('rounded-md bg-muted/30', className)}
      initial={{ opacity: 0.6 }}
      animate={{ 
        opacity: [0.6, 0.8, 0.6],
        scale: [1, 1.01, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    />
  )
}

export { Skeleton }
