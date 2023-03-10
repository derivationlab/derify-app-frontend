interface ActionType {
  type: 'SET_OPT_SELECT' | 'SET_BROKER_DAT' | 'SET_SHOW_MODAL' | 'SET_TO_BIND_DAT'
  payload: any
}

interface StateType {
  optSelect: { l: string; c: string; i: string }
  toBindDAT: Record<string, any>
  brokerDAT: { pageIndex: number; records: any[]; totalItems: number; isLoaded: boolean }
  showModal: string
}

const stateInit: StateType = {
  optSelect: { l: 'ALL', c: 'ALL', i: '-' },
  toBindDAT: {},
  brokerDAT: { pageIndex: 0, records: [], totalItems: 0, isLoaded: true },
  showModal: ''
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_BROKER_DAT':
      return { ...state, brokerDAT: { ...state.brokerDAT, ...action.payload } }
    case 'SET_SHOW_MODAL':
      return { ...state, showModal: action.payload }
    case 'SET_TO_BIND_DAT':
      return { ...state, toBindDAT: action.payload }
    case 'SET_OPT_SELECT':
      return { ...state, optSelect: { ...state.optSelect, ...action.payload } }
    default:
      return state
  }
}

export { stateInit, reducer }
