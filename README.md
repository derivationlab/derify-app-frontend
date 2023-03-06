node version: v16.14.0\
npm version: v8.3.1\
sass version: ^1.52.1


const marginToken = useMarginToken((state) => state.marginToken)
const brokerBound = useBrokerInfo((state) => state.brokerBound)
const [state, dispatch] = useReducer(reducer, stateInit)

PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)   // 持仓历史数据
PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION) // 持仓数据
PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME) // 贷款额度
PubSub.publish(PubSubEvents.UPDATE_TRADER_VARIABLES) // 保证金变化


todo:
. 现货价格更新频率带来的数据更新不及时问题；
. 质押授权修改-全额还是限额；
. usePairIndicator 指标数据被 api/app_data 参数限制了，影响了k线币对选择的下拉数据；
. 路由链接带上保证金名字；
. bbusd的完整信息 bMarginToken；
. brokers_rank_list 支持 marginToken;
. http://localhost:3890/BUSD/broker/workbench 分mt；
. 由于加了mt参数，需要全局检查路由跳转；
. api/trade_records分mt；
. 加载效果；
. BN数据解析方法简化；