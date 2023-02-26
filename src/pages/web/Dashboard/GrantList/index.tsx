import React, { FC, useState } from 'react'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'

import { MarginData, TargetData, StateData, GrantListData } from './mockData'

import ListItem from './ListItem'
import AddGrant from './AddGrant'
const GrantList: FC = () => {
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [marginType, setMarginType] = useState<string | number>('')
  const [target, setTarget] = useState<string | number>('')
  const [state, setState] = useState<string | number>('')

  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    // void getBrokersListCb(index)
  }
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
      <Pagination page={pageIndex} total={100} onChange={onPageChangeEv} />
    </div>
  )
}

export default GrantList
