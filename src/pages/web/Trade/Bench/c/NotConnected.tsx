import { useAccount } from 'wagmi'

import NotConnect from '@/components/web/NotConnect'

const NotConnected = () => {
  const { address } = useAccount()
  return (
    <>
      {!address && (
        <div className="web-trade-bench-connect">
          <NotConnect />
        </div>
      )}
    </>
  )
}

export default NotConnected
