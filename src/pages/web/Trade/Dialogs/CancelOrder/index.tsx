import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'

interface Props {
  data?: Record<string, any>
  loading?: boolean
  visible: boolean
  onClose: () => void
  onClick: () => void
}

const CancelOrder: FC<Props> = ({ data, loading, visible, onClose, onClick }) => {
  const { t } = useTranslation()
  return (
    <Dialog width="470px" visible={visible} title={t('Trade.MyOrder.CancelOrder', 'Cancel Orders')} onClose={onClose}>
      <div className="web-trade-dialog">
        <div className="web-trade-dialog-alert">
          {t('Trade.MyOrder.CancelOrderTip', 'Do you want to cancel this order IMMEDIATELY ?')}
        </div>
        <Button loading={loading} onClick={onClick}>
          {t('Trade.MyOrder.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

CancelOrder.defaultProps = {}

export default CancelOrder
