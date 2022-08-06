import React, { FC, useContext } from 'react'
import Dialog from 'rc-dialog'

import { px2rem } from '@/utils/tools'
import { MobileContext } from '@/context/Mobile'

import Image from '@/components/common/Image'

interface Props {
  title?: string
  width?: string
  visible: boolean
  onClose: () => void
}

const DialogWrap: FC<Props> = ({ title, width, visible, onClose, children }) => {
  const closeIcon = <span />
  const { mobile } = useContext(MobileContext)

  return (
    <Dialog
      destroyOnClose={true}
      width={mobile ? px2rem(343) : width}
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

DialogWrap.defaultProps = {}

export default DialogWrap
