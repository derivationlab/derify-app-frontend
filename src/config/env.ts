const urlTable: Record<string, { web: string }> = {
  dev: {
    web: 'https://test.derify.exchange/'
  },
  prod: {
    web: 'https://derify.finance/'
  },
  pre: {
    web: 'https://pre.derify.exchange/'
  }
}

const { NODE_ENV } = process.env
export const getEnv = (): string => {
  if (NODE_ENV === 'development') return 'dev'
  return Object.keys(urlTable).find((i) => JSON.stringify(urlTable[i]).includes(window.location.origin)) ?? 'prod'
}

export default getEnv
