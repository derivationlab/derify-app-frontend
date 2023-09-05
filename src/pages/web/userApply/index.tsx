import IsItConnected from '@/components/web/IsItConnected'
import MarginApply from '@/pages/web/userApply/MarginApply'

function UserApplyInner() {
  return (
    <section className="web-user-apply">
      <section className="web-user-apply-inner">
        <MarginApply />
      </section>
    </section>
  )
}

const UserApply = () => {
  return (
    <IsItConnected>
      <UserApplyInner />
    </IsItConnected>
  )
}

export default UserApply
