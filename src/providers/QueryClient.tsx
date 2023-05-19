// import { ReactQueryDevtools } from 'react-query/devtools'
import { QueryClientProvider, QueryClient, QueryClientProviderProps } from '@tanstack/react-query'

import React, { useState } from 'react'

function Provider(props: Omit<QueryClientProviderProps, 'client'>) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}

export default Provider
