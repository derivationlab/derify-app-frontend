const urlTable: Record<string, { web: string }> = {
  dev: {
    web: 'https://derify-web-fe-pre.vercel.app/'
  },
  prod: {
    web: 'https://derify.finance/'
  },
  pre: {
    web: ''
  }
}

const { NODE_ENV } = process.env
export const getEnv = (): string => {
  if (NODE_ENV === 'development') return 'dev'
  return Object.keys(urlTable).find((i) => JSON.stringify(urlTable[i]).includes(window.location.host)) ?? 'prod'
}

export default getEnv
