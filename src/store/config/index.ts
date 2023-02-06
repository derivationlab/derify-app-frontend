import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit'

import { ContractConfigState } from '@/store/types'
import { DEFAULT_MARGIN_TOKEN } from '@/config/tokens'
import { getMarginTokenContractConfig } from '@/store/config/helper'

const initialState: ContractConfigState = {
  loaded: false,
  marginToken: DEFAULT_MARGIN_TOKEN,
  contractConfig: {},
}

export const getMarginTokenContractConfigAsync = () => async (dispatch: Dispatch) => {
  const data = await getMarginTokenContractConfig()
  dispatch(setContractConfig(data))
}

export const ContractConfigSlice = createSlice({
  name: 'ContractConfig',
  initialState,
  reducers: {
    setContractConfig: (state, action: PayloadAction<Record<string, any>>) => {
      state.contractConfig = action.payload
      state.loaded = true
    },
    setMarginToken: (state, action: PayloadAction<string>) => {
      console.info(action)
      state.marginToken = action.payload
    }
  }
})

// Actions
export const { setContractConfig, setMarginToken } = ContractConfigSlice.actions

export default ContractConfigSlice.reducer
