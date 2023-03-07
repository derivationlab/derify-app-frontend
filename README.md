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


todo:
. 现货价格更新频率带来的数据更新不及时问题；
. 质押授权修改-全额还是限额；
. bbusd的完整信息 bMarginToken；
. brokers_rank_list 支持 marginToken;
. http://localhost:3890/BUSD/broker/workbench 分mt；
. 由于加了mt参数，需要全局检查路由跳转；
. 加载效果；
. BN数据解析方法简化；
. api/current_positions_amount 要支持
. /Users/wugongwei/1-project/derify-app-frontend/src/pages/web/Trade/Bench/c/Margin.tsx ui
. 路由改造
. /Users/wugongwei/1-project/derify-app-frontend/src/App.tsx