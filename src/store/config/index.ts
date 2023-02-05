import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ContractConfigState } from '@/store/types'

const initialState: ContractConfigState = {
  contractConfig: {}
}

// todo 查询合约配置地址 多个保证金

export const ContractConfigSlice = createSlice({
  name: 'ContractConfig',
  initialState,
  reducers: {
    setContractConfig: (state, action: PayloadAction<Record<string, any>>) => {
      state.contractConfig = action.payload
    },
  }
})

// Actions
export const { setContractConfig } = ContractConfigSlice.actions

export default ContractConfigSlice.reducer
