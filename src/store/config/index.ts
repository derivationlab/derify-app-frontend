import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { ConfigState, AppGetState } from '@/store/types'
import {
  getConfigFromProtocol as _getConfigFromProtocol,
  getConfigFromFactory as _getConfigFromFactory,
  initialConfigFromProtocol,
  initialConfigFromFactory
} from '@/store/config/helper'
import { MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote } from '@/typings'

const initialState: ConfigState = {
  marginToken: BASE_TOKEN_SYMBOL as MarginTokenKeys,
  factoryConfig: initialConfigFromFactory(),
  protocolConfig: initialConfigFromProtocol(),
  factoryConfigLoaded: false,
  protocolConfigLoaded: false
}

export const getConfigFromProtocol = () => async (dispatch: Dispatch) => {
  const data = await _getConfigFromProtocol()
  dispatch(setProtocolConfig(data))
}

export const getConfigFromFactory = () => async (dispatch: Dispatch, getState: AppGetState) => {
  const data = await _getConfigFromFactory(getState().config.protocolConfig)
  dispatch(setFactoryConfig(data))
}

export const ConfigSlice = createSlice({
  name: 'Config',
  initialState,
  reducers: {
    setFactoryConfig: (state, action: PayloadAction<MarginTokenWithQuote>) => {
      state.factoryConfig = action.payload
      state.factoryConfigLoaded = true
    },
    setProtocolConfig: (state, action: PayloadAction<MarginTokenWithContract>) => {
      state.protocolConfig = action.payload
      state.protocolConfigLoaded = true
    },
    setMarginToken: (state, action: PayloadAction<MarginTokenKeys>) => {
      state.marginToken = action.payload
    }
  }
})

// Actions
export const { setFactoryConfig, setProtocolConfig, setMarginToken } = ConfigSlice.actions

export default ConfigSlice.reducer
