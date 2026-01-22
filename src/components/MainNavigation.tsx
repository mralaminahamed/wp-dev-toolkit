import {
	LayoutDashboard,
	AlertTriangle,
	Database,
	Puzzle,
	Code,
	Info,
	Palette,
	Settings,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useSelect, useDispatch } from '@wordpress/data';

import settingsSelectors from '@/stores/settings/selectors';

import Logo from '@/images/wp-dev-toolkit-icon';

interface NavigationTab {
	name: string;
	title: string;
	icon: React.ComponentType<{ className?: string }>;
}

const MainNavigation: React.FC = () => {
	const location = useLocation();
	const currentPath = location.pathname;
	const { updateConfigAsync } = useDispatch( 'wp-dev-toolkit/settings' );
	const isCollapsed = useSelect( ( select ) =>
	  settingsSelectors.getSetting(
	    select( 'wp-dev-toolkit/settings' ),
	    'sidebarCollapsed',
	    null,
	  ),
	);

	const toggleSidebar = () => {
	  updateConfigAsync( { sidebarCollapsed: ! isCollapsed } );
	};

	const tabs: NavigationTab[] = [
	  { name: 'dashboard', title: 'Dashboard', icon: LayoutDashboard },
	  { name: 'error-log', title: 'Error Log', icon: AlertTriangle },
	  { name: 'query-monitor', title: 'Query Monitor', icon: Database },
	  { name: 'hook-inspector', title: 'Hook Inspector', icon: Puzzle },
	  { name: 'terminal', title: 'Terminal', icon: Code },
	  { name: 'system-info', title: 'System Info', icon: Info },
	  { name: 'tailwind-test', title: 'Tailwind Test', icon: Palette },
	  { name: 'settings', title: 'Settings', icon: Settings },
	];

	return (
		<aside
			className={ `wdt:flex wdt:flex-col wdt:h-full wdt:border-r wdt:border-border wdt:bg-card wdt:transition-all wdt:duration-300 ${
	      isCollapsed ? 'wdt:w-16 wdt:min-w-16' : 'wdt:w-60 wdt:min-w-60'
	    }` }
	  >
			<div className='wdt:flex wdt:items-center wdt:justify-between wdt:p-4 wdt:border-b wdt:border-border'>
				<div className='wdt:flex wdt:items-center wdt:gap-3'>
					<Logo className='wdt:w-8 wdt:h-8' />
					{ ! isCollapsed && (
						<h1 className='wdt:text-lg wdt:font-medium wdt:text-primary'>
							Dev Toolkit
						</h1>
	        ) }
				</div>
				<button
					onClick={ toggleSidebar }
					className='wdt:p-1 wdt:rounded-md wdt:hover:bg-muted wdt:transition-colors wdt:duration-150'
					title={ isCollapsed ? 'Expand sidebar' : 'Collapse sidebar' }
	      >
					{ isCollapsed ? (
						<ChevronRight className='wdt:w-4 wdt:h-4 wdt:text-muted-foreground' />
	        ) : (
						<ChevronLeft className='wdt:w-4 wdt:h-4 wdt:text-muted-foreground' />
	        ) }
				</button>
			</div>

			<nav className='wdt:flex-1 wdt:p-2 wdt:pb-2 wdt:overflow-auto'>
				<ul className='wdt:flex wdt:flex-col wdt:gap-1'>
					{ tabs.map( ( tab ) => {
	          const isActive =
	            ( tab.name === 'dashboard' &&
	              ( currentPath === '/' || currentPath === '/dashboard' ) ) ||
	            ( tab.name !== 'dashboard' && currentPath === `/${ tab.name }` );

	          return (
							<li key={ tab.name } className='wdt:relative'>
			{ isActive && (
									<div className='wdt:absolute wdt:left-0 wdt:top-0 wdt:h-full wdt:w-1 wdt:bg-primary wdt:rounded-r'></div>
	              ) }
			<Link
									to={ tab.name === 'dashboard' ? '/' : `/${ tab.name }` }
									className={ `wdt:flex wdt:items-center wdt:justify-center wdt:px-4 wdt:py-3 wdt:text-muted-foreground wdt:no-underline wdt:rounded-md wdt:transition-all wdt:duration-150 ${
	                  isActive
	                    ? 'wdt:bg-primary/10 wdt:text-primary'
	                    : 'wdt:hover:bg-muted wdt:hover:text-primary'
	                } ${ isCollapsed ? 'wdt:gap-0' : 'wdt:gap-3' }` }
									title={ isCollapsed ? tab.title : undefined }
	              >
									<tab.icon className='wdt:text-current wdt:text-lg' />
									{ ! isCollapsed && (
				<span className='wdt:font-medium'>{ tab.title }</span>
	                ) }
								</Link>
		</li>
	          );
	        } ) }
				</ul>
			</nav>

			<div className='wdt:p-4 wdt:text-center wdt:text-sm wdt:text-muted-foreground wdt:border-t wdt:border-border'>
				{ ! isCollapsed && (
					<span>v{ window.wpDevToolkit?.version || '1.0.0' }</span>
	      ) }
			</div>
		</aside>
	);
};

export default MainNavigation;
