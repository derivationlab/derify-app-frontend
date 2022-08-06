import { useDispatch } from 'react-redux'
import storage from 'redux-persist/lib/storage'
import { persistStore, persistReducer } from 'redux-persist'
import { configureStore, combineReducers } from '@reduxjs/toolkit'

import shareMessageReducer from './share'
import traderReducer from './trader'
import constantReducer from './constant'
import contractReducer from './contract'

const isProduction = process.env.NODE_ENV === 'production'

const persistConfig = {
  key: isProduction ? 'derify' : 'derify-test',
  storage,
  whitelist: []
}

const store = configureStore({
  devTools: !isProduction,
  reducer: persistReducer(
    persistConfig,
    combineReducers({
      shareMessage: shareMessageReducer,
      trader: traderReducer,
      contract: contractReducer,
      constant: constantReducer
    })
  ),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export type AppDispatch = typeof store.dispatch
export type AppState = ReturnType<typeof store.getState>
export const useAppDispatch = () => useDispatch()
export const persistor = persistStore(store)

export default store
