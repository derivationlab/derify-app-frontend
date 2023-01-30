import React, { FC, useState, useRef, useMemo } from 'react'
import { useClickAway, useHover } from 'react-use'
import classNames from 'classnames'

import { getMaxZIndex } from '@/utils/tools'
import Image from '@/components/common/Image'

interface Props {
  text: string
  size?: string
  hover?: boolean
}

const element = () => <Image src="icon/question.svg" />

const QuestionPopover: FC<Props> = ({ text, size, hover = false, children }) => {
  const ref = useRef(null)
  const [show, setShow] = useState<boolean>(false)

  const zIndexStyle = useMemo(() => {
    if (show) return { zIndex: getMaxZIndex() + 1 }
    return {}
  }, [show])

  const [hoverable, hovered] = useHover(element)

  useClickAway(ref, () => setShow(false))

  return (
    <div className={classNames('web-question-popover', `web-question-popover-size-${size}`)} ref={ref}>
      {children ? (
        <div className="web-question-popover-inner" onClick={() => setShow(!show)}>
          {children}
        </div>
      ) : hover ? (
        hoverable
      ) : (
        <Image src="icon/question.svg" onClick={() => setShow(!show)} />
      )}
      {(show || hovered) && (
        <div className="web-question-popover-text" style={zIndexStyle}>
          {text}
        </div>
      )}
    </div>
  )
}

QuestionPopover.defaultProps = {
  text: '',
  size: 'default'
}

export default QuestionPopover
