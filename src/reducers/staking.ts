interface ActionType {
  type: 'SET_DEPOSIT_DAT'
  payload: any
}

interface StateType {
  depositDAT: { balance: string; inAmount: string; disabled: boolean }
}

const stateInit: StateType = {
  depositDAT: { balance: '0', inAmount: '0', disabled: false }
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_DEPOSIT_DAT':
      return { ...state, depositDAT: { ...state.depositDAT, ...action.payload } }
    default:
      return state
  }
}

export { stateInit, reducer }
