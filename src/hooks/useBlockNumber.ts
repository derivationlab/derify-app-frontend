import { useBlockNumber } from 'wagmi'

export const useBlockNum = () => {
  const chainId = parseInt(process.env.REACT_APP_CHAIN_ID ?? '56')
  const { data: blockNumber } = useBlockNumber({
    chainId,
    watch: true
  })

  return { blockNumber }
}
