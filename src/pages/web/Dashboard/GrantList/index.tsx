import React, { FC, useState } from 'react'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'

import { MarginData, TargetData, StateData, GrantListData } from './mockData'

import ListItem from './ListItem'
import AddGrant from './AddGrant'
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
          renderer={(props) => (
            <div className="web-select-options-item">
              {props.icon && <Image src={props.icon} />}
              {props.label}
            </div>
          )}
        />
        <Select label="Target" value={target} onChange={setTarget} large objOptions={TargetData} />
        <Select label="State" value={state} onChange={setState} large objOptions={StateData} />
      </header>
      <div className="web-dashboard-grant-list">
        <AddGrant />
        {GrantListData.map((item, index) => (
          <ListItem key={index} data={item} />
        ))}
      </div>
    </div>
  )
}

export default GrantList
