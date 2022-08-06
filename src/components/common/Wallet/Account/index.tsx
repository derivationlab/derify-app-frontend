import React, { FC } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'

import DepositButton from '../DepositButton'
import WithdrawButton from '../WithdrawButton'
import AccountInfo from './Info'
import { useAppDispatch } from '@/store'
import { clearTraderInfo } from '@/store/trader'

interface Props {
  visible: boolean
  onClose: () => void
}

const AccountDialog: FC<Props> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: ACCOUNT } = useAccount()
  const { disconnect } = useDisconnect()

  const disconnectEv = () => {
    onClose()
    disconnect()
    dispatch(clearTraderInfo())
  }

  return (
    <Dialog width="540px" visible={visible} title={t('Nav.Account.Account', 'Account')} onClose={onClose}>
      <div className="web-account-dialog">
        <div className="web-account-dialog-info">
          <AccountInfo />
          <div className="web-account-dialog-btns">
            <DepositButton />
            <WithdrawButton />
          </div>
          <address>{ACCOUNT?.address}</address>
          <p>MetaMask @ BNB Chain</p>
        </div>
        <Button outline onClick={disconnectEv}>
          {t('Nav.Account.Disconnect', 'Disconnect')}
        </Button>
      </div>
    </Dialog>
  )
}

AccountDialog.defaultProps = {}

export default AccountDialog
