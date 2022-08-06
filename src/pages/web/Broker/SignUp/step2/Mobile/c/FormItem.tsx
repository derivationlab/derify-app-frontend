import React, { FC, useState, ReactNode } from 'react'

import Image from '@/components/common/Image'

import InputDialog from './InputDialog'
import LanguageDialog from './LanguageDialog'
import LogoDialog from './LogoDialog'
import CommunityDialog from './CommunityDialog'

interface Props {
  label: string
  value: string
  readOnly?: boolean
  onChange: (value: string, file?: File | undefined) => void
  tip?: ReactNode | string
  rules?: Record<string, any>
  type: 'input' | 'textarea' | 'language' | 'logo' | 'community'
  format?: (value: string) => string
}

const MFormItem: FC<Props> = ({ label, value, onChange, type, tip, rules, format, readOnly }) => {
  const [show, setShow] = useState<boolean>(false)
  return (
    <>
      <div className="m-reg-item" onClick={() => setShow(true)}>
        <label>{label}</label>
        {(type === 'input' || type === 'language') && (
          <span className="m-reg-item-value">{format ? format(value) : value}</span>
        )}
        {type === 'textarea' && <p className="m-reg-item-value textarea">{value}</p>}
        {type === 'logo' && (
          <div className="m-reg-item-logo">
            <Image src={value || 'icon/normal-ico.svg'} cover />
          </div>
        )}
        {type === 'community' && (
          <div className="m-reg-item-community">
            {Object.keys(JSON.parse(value)).map(
              (name: string) => JSON.parse(value)[name] && <i key={name} className={name.toLowerCase()} />
            )}
          </div>
        )}
      </div>
      {(type === 'input' || type === 'textarea') && (
        <InputDialog
          type={type}
          show={show}
          value={value}
          rules={rules}
          title={label}
          readOnly={readOnly}
          maxLength={500}
          onClose={() => setShow(false)}
          onConfirm={onChange}
          tip={tip}
        />
      )}
      {type === 'language' && (
        <LanguageDialog show={show} value={value} title={label} onClose={() => setShow(false)} onConfirm={onChange} />
      )}
      {type === 'logo' && (
        <LogoDialog
          show={show}
          value={value}
          title={label}
          onClose={() => setShow(false)}
          tip={tip}
          onConfirm={onChange}
        />
      )}
      {type === 'community' && (
        <CommunityDialog show={show} value={value} title={label} onClose={() => setShow(false)} onConfirm={onChange} />
      )}
    </>
  )
}

export default MFormItem
