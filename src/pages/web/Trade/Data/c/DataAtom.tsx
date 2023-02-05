import React, { FC } from 'react'

import QuestionPopover from '@/components/common/QuestionPopover'

interface Props {
  label: string
  tip?: string
  hover?: boolean
  footer?: string
}

const DataAtom: FC<Props> = ({ label, tip, hover = false, children, footer }) => {
  return (
    <div className="web-trade-data-atom">
      <label>
        {label}
        {tip && <QuestionPopover hover={hover} size="mini" text={tip} />}
      </label>
      <section>{children}</section>
      {footer && <footer>{footer}</footer>}
    </div>
  )
}

export default DataAtom
