import { isEmpty } from 'lodash'
import { API_PREFIX_URL, API_AUTH_KEY } from '@/config'

interface HttpResponse extends Response {
  data: any
  msg: string
  code: number
  [key: string]: any
}

// get request parameters
const combineUrl = (url: string, params: Record<string, unknown> | undefined) => {
  if (params) {
    const paramsArr = Object.keys(params).map((key) => `${key}=${encodeURIComponent(params[key] as string)}`)
    if (url.search(/\?/) === -1) return typeof params === 'object' ? `${url}?${paramsArr.join('&')}` : url
    return `${url}&${paramsArr.join('&')}`
  }
  return url
}

// the request timed out - promise
// const controller = new AbortController()
const timedOutPromise = (delay: number): Promise<Response> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = new Response(
        JSON.stringify({
          code: 500,
          msg: 'timed-out',
          data: null
        })
      )
      resolve(response)
      // controller.abort()
    }, delay)
  })
}

// whether it is an external link
export const externalLink = (url: string): string => {
  const host = /^https?:\/\/([a-zA-Z]*)(\w)+/
  return host.test(url) ? url : `${API_PREFIX_URL}${url}`
}

export async function http(request: Request): Promise<HttpResponse> {
  // { signal: controller.signal }
  // return Promise.race([timedOutPromise(6000), fetch(request)])
  return Promise.race([timedOutPromise(5000), fetch(request)])
    .then(async (res) => {
      const json = await res.json()
      return json
    })
    .catch((error) => {
      console.info(error)
      return Promise.reject(error)
    })
}

export async function get(path: string, params?: Record<string, unknown>, args?: RequestInit): Promise<HttpResponse> {
  const _path = combineUrl(externalLink(path), params)
  const headers = new Headers()
  
  headers.append('x-api-key', API_AUTH_KEY)

  return await http(new Request(_path, { ...args, method: 'get', headers }))
}

export async function post(path: string, body?: Record<string, unknown>, args?: RequestInit): Promise<HttpResponse> {
  const _body = isEmpty(body) ? '' : JSON.stringify(body)
  const headers = new Headers()

  headers.append('Content-Type', 'application/json;charset=UTF-8')
  headers.append('x-api-key', API_AUTH_KEY)

  return await http(
    new Request(externalLink(path), {
      ...args,
      method: 'post',
      mode: 'cors',
      body: _body,
      headers
    })
  )
}

export async function formDataPost(path: string, body: Record<string, any>, args?: RequestInit): Promise<HttpResponse> {
  const formData = new FormData()
  Object.keys(body).forEach((key) => {
    formData.append(key, body[key])
  })

  return await http(
    new Request(externalLink(path), {
      ...args,
      method: 'post',
      mode: 'cors',
      body: formData
    })
  )
}
