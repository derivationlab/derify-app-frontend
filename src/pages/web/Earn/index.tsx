import CompetitionPool from './c/Competition'
import DerifyTokenPool from './c/DerifyTokenPool'
import MarginTokenPool from './c/MarginTokenPool'
import PositionMining from './c/PositionMining'

const Eran = () => {
  return (
    <div className="web-eran">
      <PositionMining />
      <CompetitionPool />
      <DerifyTokenPool />
      <MarginTokenPool />
    </div>
  )
}

export default Eran
