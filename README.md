node version: v16.14.0\
npm version: v8.3.1\
sass version: ^1.52.1

```
npm install
npm start
npm run build
```

数据流review;
dispatch(getTraderDataAsync(;
PubSub同类更新统一通知处理；

使用合约DerifyDerivative，
传入交易对地址：0xEfEF8789f5A268d181b6187B40a5790935ce88f1初始化DerifyDerivative合约，调用tradingFeeRatio方法获得交易费