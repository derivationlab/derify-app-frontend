import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  onClick: () => void
}

const EditButton: FC<Props> = ({ onClick }) => {
  const { t } = useTranslation()
  return (
    <div className="web-trade-edit-button" onClick={onClick}>
      {t('Trade.MyPosition.Edit', 'Edit')}
    </div>
  )
}

export default EditButton
