import classNames from 'classnames'

import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { _NavLink } from '@/components/web/Header/index'

const NavDashboard = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <span className={classNames({ active: pathname.indexOf('dashboard') > -1 })}>
      {t('Nav.Nav.Dashboard', 'Dashboard')}
      <em />
      <ul>
        <li>
          <_NavLink to="/dashboard/overview">{t('Nav.Nav.Overview', 'Overview')}</_NavLink>
        </li>
        <li>
          <_NavLink to={`/dashboard/buyback`}>{t('Nav.Nav.BuybackPlan', 'Buyback Plan')}</_NavLink>
        </li>
        <li>
          <_NavLink to={`/dashboard/grant`}>{t('Nav.Nav.GrantList', 'Grant List')}</_NavLink>
        </li>
      </ul>
    </span>
  )
}

export default NavDashboard
