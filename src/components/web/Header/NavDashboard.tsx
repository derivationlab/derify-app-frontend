import classNames from 'classnames'

import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { NavLink } from '@/components/common/Route'

const NavDashboard = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <span className={classNames({ active: pathname.indexOf('dashboard') > -1 })}>
      {t('Nav.Nav.Dashboard', 'Dashboard')}
      <em />
      <ul>
        <li>
          <NavLink to="/dashboard/overview">{t('Nav.Nav.Overview', 'Overview')}</NavLink>
        </li>
        <li>
          <NavLink to={`/dashboard/buyback`}>{t('Nav.Nav.BuybackPlan', 'Buyback Plan')}</NavLink>
        </li>
        <li>
          <NavLink to={`/dashboard/grant`}>{t('Nav.Nav.GrantList', 'Grant List')}</NavLink>
        </li>
      </ul>
    </span>
  )
}

export default NavDashboard
