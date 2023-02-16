interface ActionType {
  type: 'SET_DISABLED' | 'SET_WITHDRAW_AMOUNT' | 'SET_WITHDRAW_DAT' | 'SET_DEPOSIT_AMOUNT'
  payload: any
}

interface StateType {
  disabled: boolean
  withdrawData: Record<string, any>
  depositAmount: string
  withdrawAmount: string
}

const stateInit: StateType = {
  disabled: false,
  withdrawData: {},
  depositAmount: '',
  withdrawAmount: ''
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_DISABLED':
      return { ...state, disabled: action.payload }
    case 'SET_DEPOSIT_AMOUNT':
      return { ...state, depositAmount: action.payload }
    case 'SET_WITHDRAW_AMOUNT':
      return { ...state, withdrawAmount: action.payload }
    case 'SET_WITHDRAW_DAT':
      return { ...state, withdrawData: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
