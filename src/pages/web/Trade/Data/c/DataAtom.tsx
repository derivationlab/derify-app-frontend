import React, { FC } from 'react'

import QuestionPopover from '@/components/common/QuestionPopover'

interface Props {
  label: string
  tip?: string
  footer?: string
}

const DataAtom: FC<Props> = ({ label, tip, children, footer }) => {
  return (
    <div className="web-trade-data-atom">
      <label>
        {label}
        {tip && <QuestionPopover size="mini" text={tip} />}
      </label>
      <section>{children}</section>
      {footer && <footer>{footer}</footer>}
    </div>
  )
}

export default DataAtom
