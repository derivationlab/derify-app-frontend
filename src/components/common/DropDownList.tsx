import classNames from 'classnames'
import { motion } from 'framer-motion'

import React, { FC, PropsWithChildren, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import Input from '@/components/common/Form/Input'
import Spinner from '@/components/common/Spinner'

interface DropDownListProps {
  entry: React.ReactNode
  height?: number
  loading?: boolean
  fetching?: boolean
  disabled?: boolean
  onSearch?: (keywords: string) => void
  showSearch?: boolean
  placeholder?: string
}

export const DropDownList: FC<PropsWithChildren<DropDownListProps>> = ({
  entry,
  height = 356,
  loading,
  fetching,
  disabled,
  children,
  onSearch,
  showSearch = true,
  placeholder
}) => {
  const ref = useRef(null)
  const { t } = useTranslation()
  const [toggle, setToggle] = useState<boolean>(false)
  const [keyword, setKeyword] = useState<string>('')
  useClickAway(ref, () => setToggle(false))
  return (
    <div className="web-c-drop-down-list" ref={ref}>
      <div
        onClick={() => {
          if (!disabled) setToggle(!toggle)
        }}
        className={classNames('web-c-drop-down-list-entry', { open: toggle, disabled: disabled })}
      >
        {entry}
      </div>
      <motion.div
        className={classNames('web-c-drop-down-list-motion-div', { fetching: fetching })}
        initial={{ height: 0 }}
        animate={{ height: toggle ? height : 0 }}
        transition={{ duration: 0.1 }}
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
              <ul onClick={() => setToggle(false)}>{children}</ul>
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
