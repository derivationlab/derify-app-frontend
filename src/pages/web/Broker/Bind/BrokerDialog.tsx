import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import Image from '@/components/common/Image'
import QuestionPopover from '@/components/common/QuestionPopover'

interface Props {
  data: Record<string, any>
  loading?: boolean
  visible: boolean
  onClose: () => void
  onClick: () => void
}

const BrokerDialog: FC<Props> = ({ data, loading, visible, onClose, onClick }) => {
  const { t } = useTranslation()

  return (
    <Dialog
      width="540px"
      visible={visible}
      title={t('Nav.BindBroker.BrokerConfirm', 'Confirm your broker')}
      onClose={onClose}
    >
      <div className="web-broker-dialog">
        <section className="web-broker-dialog-card-layout">
          <div className="web-broker-dialog-card-ico">
            <Image src={data?.logo || 'icon/normal-ico.svg'} cover />
          </div>
          <div className="web-broker-dialog-card">
            <h3>{data?.name}</h3>
            <small>@{data?.id}</small>
            <div className="web-broker-dialog-card-sns">
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
            <div className="web-broker-dialog-card-lang">
              <span>{data?.language}</span>
            </div>
          </div>
        </section>

        <Button onClick={onClick} loading={loading}>
          {t('Nav.BindBroker.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

BrokerDialog.defaultProps = {}

export default BrokerDialog
