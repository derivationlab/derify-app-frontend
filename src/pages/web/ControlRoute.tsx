// import { useParams, Navigate } from 'react-router-dom'
// import React, { FunctionComponent, PropsWithChildren, useCallback, useMemo } from 'react'
//
// import { BASE_TOKEN, DEFAULT_QUOTE_TOKEN, SUPPORTED_QUOTE_TOKENS } from '@/config/tokens'
// import { Redirect } from '@/components/common/Route'
// import Loading from '@/components/common/Loading'
//
// const matchPairs = SUPPORTED_QUOTE_TOKENS.map((token) => ({
//   fuzzyMatch: token.symbol,
//   exactMatch: `${token.symbol}-${BASE_TOKEN.symbol}`
// }))

// const ControlRoute = (props: PropsWithChildren) => {
  // const { children } = props
  //
  // const params = useParams()
  //
  // const handleUnbindBroker = useCallback(
  //   (C: FunctionComponent) => {
  //     // return <C />
  //     if (brokerBoundLoaded) {
  //       return brokerBound?.broker ? <C /> : <Redirect to='/broker-bind' />
  //     }
  //     if (!account?.address) {
  //       return <C />
  //     }
  //     return <Loading show type='fixed' />
  //   },
  //   [brokerBoundLoaded, brokerBound?.broker, account?.address]
  // )
  //
  // return <>{exactMatch ? children : <Navigate to={`/trade/${fuzzyMatch}`} />}</>
// }

// export default ControlRoute
export default null


// <Route
// path="/trade/:token"
// element={
// <TradeRoute>
//   <Trade />
// </TradeRoute>
// }
// />