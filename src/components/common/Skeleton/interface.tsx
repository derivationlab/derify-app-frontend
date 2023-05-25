export interface SkeletonProps {
  loading?: boolean
  className?: string
  animation?: boolean
  rowsProps?: SkeletonRowsProps
}

export interface SkeletonRowsProps {
  rows?: number
  width?: number | string | (string | number)[]
  className?: string
}
