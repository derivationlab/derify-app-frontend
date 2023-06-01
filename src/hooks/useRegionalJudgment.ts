import { useEffect, useState } from 'react'

import { getRegionalJudgment } from '@/api'

export const useRegionalJudgment = () => {
  const [warning, setWarning] = useState<boolean>(false)

  useEffect(() => {
    const func = async () => {
      const data = await getRegionalJudgment()
      setWarning(!data)
    }

    void func()
  }, [])

  return { warning }
}
