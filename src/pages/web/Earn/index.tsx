import EarningUpdater from '@/pages/updater/EarningUpdater'

import CompetitionPool from './c/Competition'
import DerifyTokenPool from './c/DerifyTokenPool'
import MarginTokenPool from './c/MarginTokenPool'
import PositionMining from './c/PositionMining'

const Eran = () => {
  return (
    <div className="web-eran">
      <EarningUpdater />
      <PositionMining />
      <CompetitionPool />
      <DerifyTokenPool />
      <MarginTokenPool />
    </div>
  )
}

export default Eran
