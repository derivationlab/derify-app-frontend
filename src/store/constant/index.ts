import { Dispatch, createSlice } from '@reduxjs/toolkit'

import { getBTCAddress, getETHAddress } from '@/utils/addressHelpers'

import {
  getBankBDRFPoolData,
  getCurrentPositionsAmountData,
  getPositionChangeFeeRatioData,
  getStakingDrfPoolData
} from './helper'
import { ConstantState } from '../types'
import { getIndicatorData } from '@/api'

const initialState: ConstantState = {
  bankBDRF: '0',
  stakingDrf: '0',
  positions: [],
  posFeeRatio: {},
  indicator: {}
}

export const getCurrentPositionsAmountDataAsync = () => async (dispatch: Dispatch) => {
  // todo check often pending
  const eth = await getCurrentPositionsAmountData(getETHAddress())
  const btc = await getCurrentPositionsAmountData(getBTCAddress())
  const all = await getCurrentPositionsAmountData('all')
  dispatch(
    setPositionsData([
      { ...all, token: '' },
      { ...btc, token: getBTCAddress() },
      {
        ...eth,
        token: getETHAddress()
      }
    ])
  )
}

export const getPositionChangeFeeRatioDataAsync = () => async (dispatch: Dispatch) => {
  const data = await getPositionChangeFeeRatioData()
  dispatch(setPosFeeRatioData(data))
}

export const getStakingDrfPoolDataAsync = () => async (dispatch: Dispatch) => {
  const data = await getStakingDrfPoolData()
  dispatch(setStakingDrfData(data))
}

export const getIndicatorDataAsync = () => async (dispatch: Dispatch) => {
  const { data } = await getIndicatorData()
  if (data) dispatch(setIndicatorData(data))
}

export const getBankBDRFPoolDataAsync = () => async (dispatch: Dispatch) => {
  const data = await getBankBDRFPoolData()
  dispatch(setBankBdrfData(data))
}

export const constantDataSlice = createSlice({
  name: 'ConstantData',
  initialState,
  reducers: {
    setIndicatorData: (state, action) => {
      state.indicator = action.payload
    },
    setBankBdrfData: (state, action) => {
      state.bankBDRF = action.payload
    },
    setStakingDrfData: (state, action) => {
      state.stakingDrf = action.payload
    },
    setPositionsData: (state, action) => {
      state.positions = action.payload
    },
    setPosFeeRatioData: (state, action) => {
      state.posFeeRatio = action.payload
    }
  }
})

// Actions
export const { setPositionsData, setPosFeeRatioData, setStakingDrfData, setBankBdrfData, setIndicatorData } =
  constantDataSlice.actions

export default constantDataSlice.reducer
