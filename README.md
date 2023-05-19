```
node version: v16.14.0
npm version: v8.3.1
sass version: ^1.52.1
```

####Data update frequency:
````
usePositionChangeFeeRatios = 5000
useMarginIndicators = 10000
useTokenSpotPrices = 3000
useCurrentOpenInterest = 5000
````

```  
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[quoteToken.symbol] ?? '0'
  }, [quoteToken, tokenSpotPrices])
  
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  ```