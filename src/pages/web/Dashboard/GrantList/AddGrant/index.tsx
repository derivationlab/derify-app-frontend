import React, { FC, useState } from 'react'
// import classNames from 'classnames'
// import numeral from 'numeral'
// import dayjs from 'dayjs'
//
// import { nonBigNumberInterception } from '@/utils/tools'
// import Image from '@/components/common/Image'

import AddGrantDialog from './AddGrantDialog'

const AddGrant: FC = () => {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <div className="web-dashboard-grant-list-add-button" onClick={() => setVisible(true)} />
      <AddGrantDialog visible={visible} onClose={() => setVisible(false)} />
    </>
  )
}

export default AddGrant
