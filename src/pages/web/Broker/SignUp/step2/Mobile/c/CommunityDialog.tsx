import React, { FC, useState, ReactNode, useEffect } from 'react'

import { SelectLangOptions } from '@/data'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import { Input } from '@/components/common/Form'

import { rules2 as rules, CommunityProps } from '../../config'

interface Props {
  show: boolean
  title: string
  value: string
  onClose: () => void
  onConfirm: (val: string) => void
}
// 'Telegram' |  'Discord' |  'Twitter' |  'Reddit' |  'WeChat'

const CommunityDialog: FC<Props> = ({ show, title, value, onClose, onConfirm }) => {
  const [currValue, setCurrValue] = useState<CommunityProps>({})

  const confirmFunc = () => {
    for (const i in currValue) {
      // @ts-ignore
      const rule = rules[i.toLowerCase()]
      // @ts-ignore
      const val = currValue[i]
      if (val && rule && rule?.pattern && !rule?.pattern.value.test(val)) {
        window.toast.error(rule?.pattern?.message)
        return
      }
    }
    onClose()
    onConfirm(JSON.stringify(currValue))
  }
  const closeFunc = () => {
    setCurrValue(JSON.parse(value))
    onClose()
  }

  const setCurrHelp = (val: string, type: 'Telegram' | 'Discord' | 'Twitter' | 'Reddit' | 'WeChat') => {
    // @ts-ignore

    const o = { ...currValue }
    o[type] = val
    setCurrValue(o)
  }

  useEffect(() => {
    if (value) setCurrValue(JSON.parse(value))
  }, [value])

  return (
    <Dialog width="540px" visible={show} title={title} onClose={closeFunc}>
      <div className="m-reg-dialog">
        <dl className="m-reg-community-telegram">
          <dt>Telegram</dt>
          <dd>
            <Input value={currValue?.Telegram ?? ''} onChange={(val: string) => setCurrHelp(val, 'Telegram')} />
          </dd>
        </dl>
        <dl className="m-reg-community-discord">
          <dt>Discord</dt>
          <dd>
            <Input value={currValue?.Discord ?? ''} onChange={(val: string) => setCurrHelp(val, 'Discord')} />
          </dd>
        </dl>
        <dl className="m-reg-community-twitter">
          <dt>Twitter</dt>
          <dd>
            <Input value={currValue?.Twitter ?? ''} onChange={(val: string) => setCurrHelp(val, 'Twitter')} />
          </dd>
        </dl>
        <dl className="m-reg-community-reddit">
          <dt>Reddit</dt>
          <dd>
            <Input value={currValue?.Reddit ?? ''} onChange={(val: string) => setCurrHelp(val, 'Reddit')} />
          </dd>
        </dl>
        <dl className="m-reg-community-wechat">
          <dt>WeChat</dt>
          <dd>
            <Input value={currValue?.WeChat ?? ''} onChange={(val: string) => setCurrHelp(val, 'WeChat')} />
          </dd>
        </dl>
      </div>
      <Button onClick={confirmFunc}>Confirm</Button>
    </Dialog>
  )
}

export default CommunityDialog
