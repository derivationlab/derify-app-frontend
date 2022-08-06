import { externalLink } from '@/utils/http'

export const getEventsData = (callback: (d: Record<string, any>[]) => void) => {
  let data: Record<string, any>[] = []
  const e = new EventSource(externalLink('api/events_data'))
  e.onmessage = (event) => {
    data = JSON.parse(event.data)
    callback(data)
  }
}
