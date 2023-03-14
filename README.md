node version: v16.14.0\
npm version: v8.3.1\
sass version: ^1.52.1


const marginToken = useMarginToken((state) => state.marginToken)
const brokerBound = useBrokerInfo((state) => state.brokerBound)
const [state, dispatch] = useReducer(reducer, stateInit)
const { marginToken } = useMTokenFromRoute1()
const marginToken = useMTokenFromRoute()

PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)   // 持仓历史数据
PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION) // 持仓数据
PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME) // 贷款额度
PubSub.publish(PubSubEvents.UPDATE_TRADER_VARIABLES) // 保证金变化

async getBrokerInfo(broker, marginToken) {
    const brokerInfo = await this.protocolInstance.methods.getBrokerInfo(broker).call();
    let marginTokenContractCollection = await this.protocolInstance.methods.marginTokenContractCollections(marginToken).call();
    const rewardsInstance = new this.web3.eth.Contract(abiRewards, marginTokenContractCollection.derifyRewards);
    const brokerReward = await rewardsInstance.methods.getBrokerReward(broker).call()

    return {
        "marginTokenRewardBalance": parseInt(brokerReward.marginTokenRewardBalance) / CONTRACT_DECIMAL,
        "accumulatedMarginTokenReward": parseInt(brokerReward.accumulatedMarginTokenReward) / CONTRACT_DECIMAL,
        "drfRewardBalance": parseInt(brokerReward.drfRewardBalance) / CONTRACT_DECIMAL,
        "accumulatedDrfReward": parseInt(brokerReward.accumulatedDrfReward) / CONTRACT_DECIMAL,
        "validPeriodInBlocks": parseInt(brokerInfo.validPeriodInBlocks),
        "lastUpdatedBlockNumber": parseInt(brokerInfo.lastUpdatedBlockNumber),
    };
}

todo:
. 现货价格更新频率带来的数据更新不及时问题；
. 质押授权修改，全额还是限额；
. bMarginToken动态代币的完整信息；

. /Users/wugongwei/1-project/derify-app-frontend/src/pages/web/Trade/Bench/c/Margin.tsx UI；