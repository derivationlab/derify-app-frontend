import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ShareMessageState } from '@/store/types'

const initialState: ShareMessageState = {
  shareMessage: undefined
}

export const ShareMessageSlice = createSlice({
  name: 'ShareMessage',
  initialState,
  reducers: {
    setShareMessage: (state, action: PayloadAction<unknown>) => {
      state.shareMessage = action.payload
    },
    clearShareMessage: (state) => {
      state.shareMessage = undefined
    }
  }
})

// Actions
export const { setShareMessage, clearShareMessage } = ShareMessageSlice.actions

export default ShareMessageSlice.reducer
