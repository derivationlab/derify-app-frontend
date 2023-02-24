import React, { FC, useState } from 'react'

import { Select } from '@/components/common/Form'

import { MarginData, TargetData, StateData } from './mockData'
const GrantList: FC = () => {
  const [marginType, setMarginType] = useState<string | number>('')
  const [target, setTarget] = useState<string | number>('')
  const [state, setState] = useState<string | number>('')
  return (
    <div className="web-dashboard">
      <header className="web-dashboard-grant-header">
        <Select
          label="Margin"
          value={marginType}
          onChange={setMarginType}
          large
          filter
          filterPlaceholder="serch name or contract address.."
          objOptions={MarginData}
        />
        <Select label="Target" value={target} onChange={setTarget} large objOptions={TargetData} />
        <Select label="State" value={state} onChange={setState} large objOptions={StateData} />
      </header>
      <div>
        <p>GrantList</p>
      </div>
    </div>
  )
}

export default GrantList
