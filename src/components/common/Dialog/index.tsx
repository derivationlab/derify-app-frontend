import Dialog from 'rc-dialog'

import React, { FC } from 'react'
import { isMobile } from 'react-device-detect'

import { px2rem } from '@/utils/tools'

interface Props {
  title?: string
  width?: string
  visible: boolean
  closable?: boolean
  onClose?: () => void
}

const DialogWrap: FC<Props> = ({ title, width, visible, closable, onClose, children }) => {
  const closeIcon = <span />

  return (
    <Dialog
      closable={closable}
      destroyOnClose={true}
      width={isMobile ? px2rem(343) : width}
      closeIcon={closeIcon}
      animation="zoom"
      maskAnimation="fade"
      title={title}
      visible={visible}
      onClose={onClose}
    >
      {children}
    </Dialog>
  )
}

DialogWrap.defaultProps = {
  closable: true
}

export default DialogWrap
