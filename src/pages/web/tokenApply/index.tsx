import { motion } from 'framer-motion'

import React, { useState } from 'react'

import IsItConnected from '@/components/web/IsItConnected'
import ApplyOptions, { applyTypeOptions } from '@/pages/web/tokenApply/ApplyOptions'
import MarginApply from '@/pages/web/tokenApply/MarginApply'
import TradingApply from '@/pages/web/tokenApply/TradingApply'

function UserApplyInner() {
  const [selected, setSelected] = useState<string>('')

  return (
    <section className="web-user-apply">
      <section className="web-user-apply-inner">
        <ApplyOptions onChange={setSelected} />
        {selected === applyTypeOptions[0].val && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: 'easeIn' }}>
            <MarginApply />
          </motion.div>
        )}
        {selected === applyTypeOptions[1].val && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: 'easeIn' }}>
            <TradingApply />
          </motion.div>
        )}
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
