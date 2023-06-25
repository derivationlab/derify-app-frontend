import { motion } from 'framer-motion'
import { orderBy, debounce } from 'lodash'
import { uniqBy } from 'lodash'
import { useAccount } from 'wagmi'

import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { searchMarginToken } from '@/api'
import Image from '@/components/common/Image'
import { useMarginBalances } from '@/hooks/useMarginBalances'
import { resortMargin } from '@/pages/web/MySpace'
import { getMarginDeployStatus, getMarginTokenList, useMarginTokenListStore } from '@/store'
import { Rec } from '@/typings'

let seqCount = 0
const MarginToken: FC = () => {
  const { address } = useAccount()
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const [tableDAT, setTableDAT] = useState<any>({
    data: [],
    loaded: true
  })
  const { data: marginBalances } = useMarginBalances(address, marginTokenList)

  const _searchMarginToken = useCallback(
    debounce(async (searchKeyword: string) => {
      const { data = [] } = await searchMarginToken(searchKeyword)
      setTableDAT({ data, loaded: false })
    }, 1500),
    []
  )

  /**
   const options = useMemo(() => {
    if (pagination.data.length && marginBalances) {
      const _ = pagination.data.map((token) => {
        const marginBalance = marginBalances?.[token.symbol] ?? 0
        return {
          apy: token.max_pm_apy,
          open: token.open,
          icon: token.logo,
          value: token.symbol,
          label: token.symbol,
          marginBalance: Number(marginBalance)
        }
      })
      return orderBy(_, (r) => r.marginBalance, 'desc')
    }
    return []
  }, [marginBalances, pagination.data])
   */

  const funcAsync = useCallback(async () => {
    const { records = [] } = await getMarginTokenList(seqCount)
    const deployStatus = await getMarginDeployStatus(records)
    const filter = records.filter((f: Rec) => deployStatus[f.symbol])
    const combine = [...tableDAT.data, ...filter]
    const deduplication = uniqBy(combine, 'margin_token')
    setTableDAT((val: any) => ({ ...val, data: deduplication, loaded: false }))
    if (records.length === 0 || records.length < 4) seqCount = seqCount - 1
  }, [tableDAT.data])

  useEffect(() => {
    if (searchKeyword.trim()) {
      setTableDAT({ data: [], loaded: true })
      void _searchMarginToken(searchKeyword)
    } else {
      seqCount = 0
      setTableDAT({ data: [], loaded: true })
      void funcAsync()
    }
  }, [searchKeyword])
  useEffect(() => {
    if (marginTokenList.length) {
      setTableDAT((val: any) => ({ ...val, data: resortMargin(marginTokenList) }))
    }
  }, [marginTokenList])
  useEffect(() => {
    if (tableDAT.data.length) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id === 'bottom') {
              seqCount += 1
              console.info('intersectionObserver=', seqCount)
              void funcAsync()
            }
          })
        },
        { threshold: 0.2 }
      )
      if (bottomRef.current) {
        intersectionObserver.observe(bottomRef.current)
        observerRef.current = intersectionObserver
      }
    }
    return () => {
      observerRef.current && observerRef.current.disconnect()
    }
  }, [tableDAT.data.length])

  const bottomRef = useRef<any>()
  const observerRef = useRef<IntersectionObserver | null>()
  const [open, toggle] = useState(false)
  return (
    <div style={{ width: '300px' }} className='web-c-drop-down-list'>
      <div onClick={() => toggle(!open)}>ABCDEF</div>
      <motion.div
        style={{ overflow: 'hidden' }}
        initial={{ height: 0 }}
        animate={{ height: open ? 160 : 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className='wrapper'>
          <input
            type='text'
            value={searchKeyword}
            placeholder='search...'
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <div className='content'>
            {tableDAT.loaded && (<small>loading...</small>)}
            <ul>
              {tableDAT.data.map((o: any, index: number) => {
                const len = tableDAT.data.length
                const id = index === len - 1 ? 'bottom' : undefined
                const ref = index === len - 1 ? bottomRef : null
                const _id = searchKeyword.trim() ? undefined : id
                const _ref = searchKeyword.trim() ? null : ref
                return (
                  <li key={o.margin_token} id={_id} ref={_ref}>
                    <Image src={o.logo} style={{ width: '24px' }} />
                    {o.name}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MarginToken
