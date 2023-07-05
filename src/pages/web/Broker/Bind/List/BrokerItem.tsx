import React, { FC, useState, useRef, useMemo, useEffect, BaseSyntheticEvent } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import QuestionPopover from '@/components/common/QuestionPopover'

interface Props {
  data: Record<string, any>
  operating: string
  onClick: () => void
}

const BrokerItem: FC<Props> = ({ data, operating, onClick }) => {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement | null>(null)

  const defaultHeight = isMobile ? 96 : 108
  const [articleHeight, setArticleHeight] = useState<number>(defaultHeight)
  const [realHeight, setRealHeight] = useState<number>(0)

  useEffect(() => {
    const h = ref.current?.offsetHeight
    console.log(h)
    if (h) setRealHeight(h)
  }, [ref.current?.offsetHeight])

  const isShowMore = useMemo(() => {
    if (!realHeight) return false
    return realHeight > defaultHeight
  }, [realHeight])

  const changeArticleHeight = (e: BaseSyntheticEvent) => {
    e.stopPropagation()
    setArticleHeight(articleHeight === defaultHeight ? realHeight + 18 : defaultHeight)
  }

  return (
    <div className="web-broker-list-item" onClick={isMobile ? () => onClick() : () => null}>
      <div className="web-broker-list-item-ico">
        <Image src={data?.logo || 'icon/normal-ico.svg'} cover />
      </div>
      <div className="web-broker-list-item-info">
        <h3>{data?.name}</h3>
        <em>@{data?.id}</em>
        <div className="web-broker-list-item-info-sns">
          {data?.telegram && <a href={data?.telegram} target="_blank" className="telegram" />}
          {data?.discord && <a href={data?.discord} target="_blank" className="discord" />}
          {data?.twitter && <a href={data?.twitter} target="_blank" className="twitter" />}
          {data?.reddit && <a href={data?.reddit} target="_blank" className="reddit" />}
          {data?.wechat && (
            <QuestionPopover text={`WeChat: ${data?.wechat}`} size="inline">
              <a className="wechat" />
            </QuestionPopover>
          )}
        </div>
        <div className="web-broker-list-item-info-lang">
          <span>{data?.language}</span>
        </div>
      </div>
      <div className="web-broker-list-item-about" style={{ maxHeight: `${articleHeight}px` }}>
        <article ref={ref}>{data?.introduction}</article>
        {isShowMore &&
          (articleHeight === defaultHeight ? (
            <aside className="more" onClick={changeArticleHeight}>
              More
            </aside>
          ) : (
            <aside className="hide" onClick={changeArticleHeight}>
              Close
            </aside>
          ))}
      </div>
      {isMobile ? (
        <div className="web-broker-list-item-operate" />
      ) : (
        <div className="web-broker-list-item-operate">
          <Button outline loading={operating === data?.id} onClick={onClick}>
            {t('Nav.BindBroker.SetBroker', 'Set as my broker')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default BrokerItem
