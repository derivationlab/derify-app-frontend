import React, { FC } from 'react'
import Image from '@/components/common/Image'

interface TableMarginProps {
  icon: string
  name: string
}

export const TableMargin: FC<TableMarginProps> = ({ icon, name }) => {
  return (
    <div className="web-dashboard-table-margin">
      <Image src={icon} />
      <span>{name}</span>
    </div>
  )
}
