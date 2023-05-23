import { DEFAULT_MARGIN_TOKEN } from '@/config/tokens'
import { GrantKeys } from '@/typings'

interface StateType {
  disabled: boolean
  grantDays: number
  cliffDays: number
  amountInp: string
  pageIndex: number
  marginToken: string
  marginToken1: string
  grantTarget: string
  grantTarget1: string
  grantStatus: string
  grantData: { records: any[]; totalItems: number; isLoaded: boolean }
}

interface ActionType {
  type:
    | 'SET_DISABLED'
    | 'SET_GRANT_DAT'
    | 'SET_GRANT_DAYS'
    | 'SET_CLIFF_DAYS'
    | 'SET_AMOUNT_INP'
    | 'SET_PAGE_INDEX'
    | 'SET_GRANT_STATUS'
    | 'SET_GRANT_TARGET'
    | 'SET_GRANT_TARGET1'
    | 'SET_MARGIN_TOKEN'
    | 'SET_MARGIN_TOKEN1'
  payload: any
}

export const all = { value: 'all', label: 'ALL' }

export const grantTargetOptions = (needAll = false): { value: GrantKeys | string; label: string }[] => {
  const _ = [
    {
      value: 'mining',
      label: 'Position Mining'
    },
    {
      value: 'awards',
      label: 'Broker'
    },
    {
      value: 'rank',
      label: 'Trading Competition'
    }
  ]
  return !needAll ? _ : [all, ..._]
}

export const grantStateOptions = [
  {
    value: 'all',
    label: 'ALL'
  },
  {
    value: 'upcoming',
    label: 'Upcoming'
  },
  {
    value: 'active',
    label: 'Active'
  },
  {
    value: 'closed',
    label: 'Closed'
  }
]

const stateInit: StateType = {
  disabled: false,
  grantDays: 1,
  cliffDays: 0,
  amountInp: '',
  pageIndex: 0,
  grantData: { records: [], totalItems: 0, isLoaded: true },
  marginToken: DEFAULT_MARGIN_TOKEN.symbol,
  marginToken1: all.value,
  grantStatus: grantStateOptions[0].value,
  grantTarget: grantTargetOptions()[0].value,
  grantTarget1: grantTargetOptions(true)[0].value
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_DISABLED':
      return { ...state, disabled: action.payload }
    case 'SET_GRANT_DAT':
      return { ...state, grantData: { ...state.grantData, ...action.payload } }
    case 'SET_GRANT_DAYS':
      return { ...state, grantDays: action.payload }
    case 'SET_CLIFF_DAYS':
      return { ...state, cliffDays: action.payload }
    case 'SET_AMOUNT_INP':
      return { ...state, amountInp: action.payload }
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload }
    case 'SET_MARGIN_TOKEN':
      return { ...state, marginToken: action.payload }
    case 'SET_MARGIN_TOKEN1':
      return { ...state, marginToken1: action.payload }
    case 'SET_GRANT_STATUS':
      return { ...state, grantStatus: action.payload }
    case 'SET_GRANT_TARGET':
      return { ...state, grantTarget: action.payload }
    case 'SET_GRANT_TARGET1':
      return { ...state, grantTarget1: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
