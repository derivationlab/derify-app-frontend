import styled from 'styled-components'

import { useTranslation } from 'react-i18next'

const Small = styled.small`
  color: #888;
  font-size: 12px;
  padding: 12px 0;
`

function NoResults() {
  const { t } = useTranslation()
  return <Small className="tc block">{t('Trade.Bench.NoResultsFound')}</Small>
}

export default NoResults
