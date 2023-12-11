import { getTraderWithdrawAmount } from 'derify-apis-v22'

import { useEffect, useState } from 'react'

const init = {
  marginTokenAmount: '0',
  bMarginTokenAmount: '0'
}

export const useAmountCanWithdrawn = (account: string | undefined, amount: string, marginToken: string) => {
  const [canWithdrawn, setCanWithdrawn] = useState<typeof init>(init)

  useEffect(() => {
    const func = async (account: string, amount: string, marginToken: string) => {
      const { data } = await getTraderWithdrawAmount<{ data: typeof init }>(account, amount, marginToken)
      setCanWithdrawn(data)
    }

    if (account && Number(amount) > 0 && marginToken) {
      void func(account, amount, marginToken)
    }
  }, [account, amount, marginToken])

  return {
    canWithdrawn
  }
}
