interface ActionType {
  type:
    | 'SET_TOKEN_SELECT'
    | 'SET_MODAL_STATUS'
    | 'SET_OPENING_AMOUNT'
    | 'SET_OPENING_PARAMS'
    | 'SET_CHANGE_FEE_INFO'
    | 'SET_TRADING_FEE_INFO'
    | 'SET_VALID_OPENING_VOLUME'
  payload: any
}

const R = { loaded: false, value: 0 }

interface StateType {
  tokenSelect: string
  modalStatus: boolean
  openingAmount: string
  posChangeFee: typeof R
  openingParams: Record<string, any>
  tradingFeeInfo: typeof R
  validOpeningVol: typeof R & { maximum: number; isGreater: boolean }
}

const stateInit: StateType = {
  tokenSelect: '',
  modalStatus: false,
  openingAmount: '',
  openingParams: {},
  posChangeFee: R,
  tradingFeeInfo: R,
  validOpeningVol: { ...R, maximum: 0, isGreater: false }
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_MODAL_STATUS':
      return { ...state, modalStatus: action.payload }
    case 'SET_TOKEN_SELECT':
      return { ...state, tokenSelect: action.payload }
    case 'SET_OPENING_PARAMS':
      return { ...state, openingParams: action.payload }
    case 'SET_OPENING_AMOUNT':
      return { ...state, openingAmount: action.payload }
    case 'SET_CHANGE_FEE_INFO':
      return { ...state, posChangeFee: action.payload }
    case 'SET_TRADING_FEE_INFO':
      return { ...state, tradingFeeInfo: action.payload }
    case 'SET_VALID_OPENING_VOLUME':
      return { ...state, validOpeningVol: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
