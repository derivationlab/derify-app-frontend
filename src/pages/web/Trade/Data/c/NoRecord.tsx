import React, { FC } from 'react'

interface Props {
  show: boolean
}

const NoRecord: FC<Props> = ({ show }) => {
  if (!show) return null
  return <div className="web-trade-data-no-record">No record</div>
}

export default NoRecord
