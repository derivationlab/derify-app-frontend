interface ActionType {
  type: 'SET_GRANT_DAT' | 'SET_PAGE_INDEX' | 'SET_GRANT_STATUS' | 'SET_GRANT_TARGET' | 'SET_MARGIN_TOKEN'
  payload: any
}

interface StateType {
  grantData: { records: any[]; totalItems: number; isLoaded: boolean }
  pageIndex: number
  grantTarget: string
  marginToken: string
  grantStatus: string
}

export const grantStateOptions = [
  {
    key: 'all',
    value: '',
    label: 'ALL'
  },
  {
    key: 'upcoming',
    value: 1,
    label: 'Upcoming'
  },
  {
    key: 'active',
    value: 2,
    label: 'Active'
  },
  {
    key: 'closed',
    value: 3,
    label: 'Closed'
  }
]

const stateInit: StateType = {
  grantData: { records: [], totalItems: 0, isLoaded: true },
  pageIndex: 0,
  marginToken: '',
  grantTarget: '',
  grantStatus: ''
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_GRANT_DAT':
      return { ...state, grantData: action.payload }
    case 'SET_GRANT_TARGET':
      return { ...state, grantTarget: action.payload }
    case 'SET_GRANT_STATUS':
      return { ...state, grantStatus: action.payload }
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload }
    case 'SET_MARGIN_TOKEN':
      return { ...state, marginToken: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
