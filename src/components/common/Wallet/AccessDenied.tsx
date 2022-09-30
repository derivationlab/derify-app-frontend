import React, { FC } from 'react'

import Dialog from '@/components/common/Dialog'

interface Props {
  visible: boolean
}

const AccessDeniedDialog: FC<Props> = ({ visible }) => {
  return (
    <Dialog width="472px" visible={visible} title='Access Denied' closable={false}>
      <div className="web-access-denied-dialog">
        <p className="web-access-denied-dialog-tips">
          You are prohibited from using the Site in your current region due to violation of the <a href='https://derify.finance/terms' target='_blank'>Terms of Service</a>.
        </p>
      </div>
    </Dialog>
  )
}

export default AccessDeniedDialog
