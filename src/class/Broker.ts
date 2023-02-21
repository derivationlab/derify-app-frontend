import BN from 'bignumber.js'
import type { Signer } from 'ethers'

import { setAllowance } from '@/utils/practicalMethod'
import { getDerifyBrokerContract } from '@/utils/contractHelpers'
import { getDecimalAmount, safeInterceptionValues, toHexString } from '@/utils/tools'
import { getDerifyBrokerAddress, getEDRFAddress } from '@/utils/addressHelpers'

class Broker {
  burnLimitAmount = '0'
  burnLimitPerDay = '0'

  constructor() {
    void this.getBurnLimitAmount()
  }

  getPrivilegeForBroker = async (signer: Signer): Promise<boolean> => {
    const contract = getDerifyBrokerContract(signer)

    try {
      // const amount1 = toHexString(this.burnLimitAmount, 8)
      const amount2 = toHexString(this.burnLimitAmount, 18)

      const approve = await setAllowance(signer, getDerifyBrokerAddress(), getEDRFAddress(), amount2)

      if (!approve) return false

      const response = await contract.applyBroker()
      const receipt = await response.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  extendBrokerPrivilege = async (signer: Signer, amount: string): Promise<boolean> => {
    const contract = getDerifyBrokerContract(signer)

    try {
      const amount1 = toHexString(amount, 8)
      const amount2 = toHexString(amount, 18)

      const approve = await setAllowance(signer, getDerifyBrokerAddress(), getEDRFAddress(), amount2)

      if (!approve) return false

      const response = await contract.burnEdrfExtendValidPeriod(amount1)
      const receipt = await response.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  withdrawBrokerReward = async (signer: Signer): Promise<boolean> => {
    const contract = getDerifyBrokerContract(signer)

    try {
      const response = await contract.withdrawBrokerReward()
      const receipt = await response.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  getBurnLimitAmount = async () => {
    const contract = getDerifyBrokerContract()

    const applyNumber = await contract.brokerApplyNumber()
    const validNumber = await contract.brokerValidUnitNumber()

    const validNumber_BN = new BN(validNumber._hex)
    const burnLimitPerDay = validNumber_BN
      .times(24 * 3600)
      .div(3)
      .div(new BN(10).pow(8))

    this.burnLimitAmount = safeInterceptionValues(applyNumber)
    this.burnLimitPerDay = burnLimitPerDay.integerValue(BN.ROUND_CEIL).toString()
  }
}

export default new Broker()
