import classNames from 'classnames'
import { motion } from 'framer-motion'

import React, { FC, PropsWithChildren, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import Input from '@/components/common/Form/Input'

interface DropDownListProps {
  entry: React.ReactNode
  height?: number
  loading?: boolean
  onSearch?: (keywords: string) => void
  showSearch?: boolean
  placeholder?: string
}

export const DropDownList: FC<PropsWithChildren<DropDownListProps>> = ({
  entry,
  height = 356,
  loading,
  children,
  onSearch,
  showSearch = true,
  placeholder
}) => {
  const ref = useRef(null)
  const { t } = useTranslation()
  const [open, toggle] = useState<boolean>(false)
  const [keyword, setKeyword] = useState<string>('')
  useClickAway(ref, () => toggle(false))
  return (
    <div className="web-c-drop-down-list" ref={ref}>
      <div onClick={() => toggle(!open)} className={classNames('web-c-drop-down-list-entry', { open: open })}>
        {entry}
      </div>
      <motion.div
        className="web-c-drop-down-list-motion-div"
        initial={{ height: 0 }}
        animate={{ height: open ? height : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="web-c-drop-down-list-wrapper">
          <div className="web-c-drop-down-list-content">
            {showSearch && (
              <div className="web-c-drop-down-search-bar">
                <Input
                  type="text"
                  value={keyword}
                  placeholder={placeholder}
                  onChange={(v) => {
                    onSearch?.(v)
                    setKeyword(v)
                  }}
                />
                <i />
              </div>
            )}
            <div className="web-c-drop-down-list-content-items">
              {loading && (
                <div className="loading">
                  <div className="loading-inner" />
                  {t('common.Loading')}
                </div>
              )}
              <ul onClick={() => toggle(false)}>{children}</ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface DropDownListItemProps {
  id?: string
  content: React.ReactNode
  className?: string
  onSelect: () => void

  [key: string]: any
}

export const DropDownListItem = React.forwardRef<HTMLLIElement, DropDownListItemProps>((props, ref) => (
  <li id={props?.id} ref={ref} className={props?.className} onClick={props.onSelect}>
    {props.content}
  </li>
))
