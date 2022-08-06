import React, { FC } from 'react'

import MultipleStatus, { MultipleStatusProps } from '@/components/web/MultipleStatus'

export interface ItemHeaderProps extends MultipleStatusProps {
  symbol: string
  buttonText?: string
  onButtonClick?: () => void
}

const ItemHeader: FC<ItemHeaderProps> = ({ symbol, multiple, direction, buttonText, onButtonClick }) => {
  return (
    <header className="web-trade-data-item-header">
      <h4>
        <strong>{symbol}</strong>
        <MultipleStatus multiple={multiple} direction={direction} />
      </h4>
      {buttonText && onButtonClick && <button onClick={onButtonClick}>{buttonText}</button>}
    </header>
  )
}

export default ItemHeader
