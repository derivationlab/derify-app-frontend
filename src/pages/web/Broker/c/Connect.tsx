import ConnectButton from '@/components/common/Wallet/ConnectButton'

function BrokerConnect({ br = 48 }) {
  return (
    <div className="web-broker-not-connect">
      <section className="web-not-connect" style={{ borderRadius: `${br}px` }}>
        <ConnectButton />
      </section>
    </div>
  )
}

export default BrokerConnect
