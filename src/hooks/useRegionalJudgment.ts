import { getRegionalJudgment } from 'derify-apis-v20'

import { useEffect, useState } from 'react'

export const useRegionalJudgment = () => {
  const [warning, setWarning] = useState<boolean>(false)

  useEffect(() => {
    const func = async () => {
      const data = await getRegionalJudgment<number>()
      setWarning(!data)
    }

    void func()
  }, [])

  return { warning }
}
