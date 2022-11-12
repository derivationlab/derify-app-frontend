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

const PositionCloseAll: FC<Props> = ({ loading, visible, onClose, onClick }) => {
  const { t } = useTranslation()
  return (
    <Dialog
      width="470px"
      visible={visible}
      title={t('Trade.ClosePosition.CloseAllPositions', 'Close All Position')}
      onClose={onClose}
    >
      <div className="web-trade-dialog">
        <div className="web-trade-dialog-alert">
          {t('Trade.ClosePosition.CloseAllPositionsTip', 'Do you want to close all positions at Market Price?')}
        </div>
        <Button loading={loading} onClick={onClick}>
          {t('Trade.ClosePosition.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

PositionCloseAll.defaultProps = {}

export default PositionCloseAll
