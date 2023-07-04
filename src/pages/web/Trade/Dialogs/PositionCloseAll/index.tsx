import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'

interface Props {
  data?: Record<string, any>
  disabled?: boolean
  visible: boolean
  onClose: () => void
  onClick: () => void
}

const PositionCloseAll: FC<Props> = ({ disabled, visible, onClose, onClick }) => {
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
        <Button disabled={disabled} onClick={onClick}>
          {t('Trade.ClosePosition.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

PositionCloseAll.defaultProps = {}

export default PositionCloseAll
