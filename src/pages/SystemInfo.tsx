import {
	AlertTriangle,
	Info,
	Database,
	Check,
	X,
	Palette,
	List,
	Monitor,
	Settings as SettingsIcon,
	Lock,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

import { SystemInfoCard, PermissionsCard } from './SystemInfo/SystemInfoCard';
import SystemInfoHeader from './SystemInfo/SystemInfoHeader';

interface SystemInfo {
	wordpress: {
	  version: string;
	  home_url: string;
	  site_url: string;
	  is_multisite: boolean;
	  debug_mode: boolean;
	  memory_limit: string;
	  permalink_structure: string;
	  theme: string;
	  theme_version: string;
	  active_plugins: number;
	  language: string;
	};
	server: {
	  php_version: string;
	  mysql_version: string;
	  web_server: string;
	  user_agent: string;
	  php_memory_limit: string;
	  php_max_execution_time: string;
	  php_post_max_size: string;
	  php_upload_max_filesize: string;
	  php_max_input_vars: string;
	  php_extensions: string;
	};
	constants: Record<string, any>;
	permissions: Record<string, boolean>;
}

const SystemInfo: React.FC = () => {
	const [ systemInfo, setSystemInfo ] = useState<SystemInfo | null>( null );
	const [ isLoading, setIsLoading ] = useState<boolean>( true );
	const [ error, setError ] = useState<string | null>( null );
	const [ activeTab, setActiveTab ] = useState<string>( 'wordpress' );
	const [ copySuccess, setCopySuccess ] = useState<boolean>( false );

	useEffect( () => {
	  fetchSystemInfo();
	}, [] );

	const fetchSystemInfo = async () => {
	  setIsLoading( true );
	  setError( null );
	  try {
	    const response = await fetch(
	      `${ window.wpDevToolkit.apiUrl }/system-info`,
	      {
	        headers: {
	          'X-WP-Nonce': window.wpDevToolkit.nonce,
	        },
	      },
	    );
	    const data = await response.json();

	    if ( data.success ) {
	      setSystemInfo( data.data );
	    } else {
	      setError( 'Failed to load system information.' );
	    }
	  } catch ( error ) {
	    console.error( 'Error fetching system info:', error );
	    setError( 'Error connecting to the API.' );
	  }
	  setIsLoading( false );
	};

	const copyToClipboard = () => {
	  if ( ! systemInfo ) {
	    return;
	  }

	  // Create a formatted string of system info
	  let text = '=== WordPress Dev Toolkit - System Information ===\n\n';

	  // WordPress Info
	  text += '--- WordPress Environment ---\n';
	  Object.entries( systemInfo.wordpress ).forEach( ( [ key, value ] ) => {
	    text += `${ key.replace( /_/g, ' ' ).replace( /\b\w/g, ( l ) => l.toUpperCase() ) }: ${ value }\n`;
	  } );

	  // Server Info
	  text += '\n--- Server Environment ---\n';
	  Object.entries( systemInfo.server ).forEach( ( [ key, value ] ) => {
	    text += `${ key.replace( /_/g, ' ' ).replace( /\b\w/g, ( l ) => l.toUpperCase() ) }: ${ value }\n`;
	  } );

	  // Constants
	  text += '\n--- WordPress Constants ---\n';
	  Object.entries( systemInfo.constants ).forEach( ( [ key, value ] ) => {
	    text += `${ key }: ${ value }\n`;
	  } );

	  // Permissions
	  text += '\n--- File Permissions ---\n';
	  Object.entries( systemInfo.permissions ).forEach( ( [ key, value ] ) => {
	    text += `${ key.replace( /_/g, ' ' ).replace( /\b\w/g, ( l ) => l.toUpperCase() ) }: ${ value ? 'Yes' : 'No' }\n`;
	  } );

	  navigator.clipboard.writeText( text ).then( () => {
	    setCopySuccess( true );
	    setTimeout( () => setCopySuccess( false ), 3000 );
	  } );
	};

	const InfoRow = ( { label, value }: { label: string; value: any } ) => (
		<tr className='wdt:border-b wdt:border-gray-200'>
			<td className='wdt:py-3 wdt:px-4 wdt:font-medium wdt:text-gray-700'>
				{ label }
			</td>
			<td className='wdt:py-3 wdt:px-4'>
				{ typeof value === 'boolean' ? (
	        value ? (
						<span className='wdt:inline-flex wdt:items-center wdt:px-2.5 wdt:py-0.5 wdt:rounded-full wdt:text-xs wdt:font-medium wdt:bg-green-100 wdt:text-green-800'>
			<Check className='wdt:mr-1 wdt:inline' /> Yes
		</span>
	        ) : (
						<span className='wdt:inline-flex wdt:items-center wdt:px-2.5 wdt:py-0.5 wdt:rounded-full wdt:text-xs wdt:font-medium wdt:bg-red-100 wdt:text-red-800'>
			<X className='wdt:mr-1 wdt:inline' /> No
		</span>
	        )
	      ) : (
	        value
	      ) }
			</td>
		</tr>
	);

	if ( isLoading ) {
	  return (
			<div className='wdt:space-y-6 wdt:p-6'>
			<div className='wdt:space-y-2'>
					<h1>System Information</h1>
					<p>View details about your WordPress environment</p>
				</div>

			<div className='wdt:flex wdt:justify-center wdt:items-center wdt:p-16 wdt:bg-white wdt:rounded-lg wdt:shadow-sm'>
					<div className='wdt:animate-spin wdt:rounded-full wdt:h-8 wdt:w-8 wdt:border-b-2 wdt:border-blue-600'></div>
					<span className='wdt:ml-2'>Loading system information...</span>
				</div>
		</div>
	  );
	}

	if ( error ) {
	  return (
			<div className='wdt:space-y-6 wdt:p-6'>
			<div className='wdt:space-y-2'>
					<h1>System Information</h1>
					<p>View details about your WordPress environment</p>
				</div>

			<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:py-6 wdt:shadow-sm wdt:bg-red-50 wdt:border wdt:border-red-200'>
					<div className='wdt:px-6'>
					<div className='wdt:flex wdt:items-start'>
							<AlertTriangle className='wdt:text-red-500 wdt:mr-3 wdt:mt-1' />
							<div>
							<h3 className='wdt:text-red-800 wdt:font-medium wdt:mb-2'>
									Error Loading System Information
								</h3>
							<p className='wdt:text-red-700 wdt:mb-4'>{ error }</p>
							<Button onClick={ fetchSystemInfo }>Retry</Button>
						</div>
						</div>
				</div>
				</div>
		</div>
	  );
	}

	if ( ! systemInfo ) {
	  return (
			<div className='wdt:space-y-6 wdt:p-6'>
			<div className='wdt:space-y-2'>
					<h1>System Information</h1>
					<p>View details about your WordPress environment</p>
				</div>

			<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm'>
					<div className='wdt:px-6'>
					<p>No system information available.</p>
				</div>
				</div>
		</div>
	  );
	}

	const getTabIcon = ( iconName: string ) => {
	  switch ( iconName ) {
	    case 'wordpress':
	      return Info;
	    case 'desktop':
	      return Monitor;
	    case 'admin-settings':
	      return SettingsIcon;
	    case 'lock':
	      return Lock;
	    default:
	      return Info;
	  }
	};

	const tabs = [
	  { name: 'wordpress', title: 'WordPress', icon: 'wordpress' },
	  { name: 'server', title: 'Server', icon: 'desktop' },
	  { name: 'constants', title: 'Constants', icon: 'admin-settings' },
	  { name: 'permissions', title: 'Permissions', icon: 'lock' },
	];

	return (
		<div className='wdt:min-h-screen wdt:bg-gradient-to-br wdt:from-background wdt:via-background wdt:to-muted/20 wdt:p-6 lg:wdt:p-8'>
			<div className='wdt:max-w-7xl wdt:mx-auto wdt:space-y-8'>
				<div className='wdt:space-y-4 wdt:text-center md:wdt:text-left'>
					<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-4'>
						<div className='wdt:relative'>
							<div className='wdt:p-4 wdt:bg-gradient-to-br wdt:from-green-50 wdt:to-green-100/50 wdt:dark:from-green-950/20 wdt:dark:to-green-900/10 wdt:rounded-2xl wdt:border wdt:border-green-200/50 wdt:dark:border-green-800/30'>
								<Monitor className='wdt:w-8 wdt:h-8 wdt:text-green-600 wdt:dark:text-green-400' />
							</div>
							<div className='wdt:absolute wdt:-top-1 wdt:-right-1 wdt:w-3 wdt:h-3 wdt:bg-green-500 wdt:rounded-full wdt:animate-pulse'></div>
						</div>
						<div>
							<h1 className='wdt:text-4xl wdt:font-bold wdt:bg-gradient-to-r wdt:from-foreground wdt:to-foreground/70 wdt:bg-clip-text wdt:text-transparent'>
								System Information
							</h1>
							<p className='wdt:text-lg wdt:text-muted-foreground wdt:mt-1'>
								Server & Environment Details
							</p>
						</div>
					</div>
					<p className='wdt:text-lg wdt:text-muted-foreground wdt:max-w-3xl wdt:mx-auto md:wdt:mx-0 wdt:leading-relaxed'>
						Comprehensive overview of your WordPress installation, server
						configuration, and system environment
					</p>
					<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-2 wdt:mt-4'>
						<Info className='wdt:w-4 wdt:h-4 wdt:text-blue-500' />
						<span className='wdt:text-sm wdt:text-blue-600 wdt:dark:text-blue-400'>
							Real-time system monitoring and diagnostics
						</span>
					</div>
				</div>

				<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm wdt:mb-6'>
					<div className='wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6'>
						<div className='wdt:flex wdt:justify-between wdt:items-center'>
							<div className='wdt:flex wdt:items-center wdt:gap-2'>
								<Info />
								<h2>System Overview</h2>
							</div>
							<div className='wdt:flex wdt:gap-2'>
								<Button variant='secondary' onClick={ copyToClipboard }>
									{ copySuccess ? 'Copied!' : 'Copy All Info' }
								</Button>
								<Button onClick={ fetchSystemInfo }>Refresh Info</Button>
							</div>
						</div>
					</div>
					<div className='wdt:px-6'>
						<div className='wdt:grid wdt:grid-cols-1 md:wdt:grid-cols-2 lg:wdt:grid-cols-4 wdt:gap-6'>
							<div className='wdt:bg-white wdt:p-4 wdt:rounded-lg wdt:border wdt:border-gray-200 wdt:shadow-sm'>
								<div className='wdt:flex wdt:items-center wdt:mb-2'>
									<span className='wdt:text-blue-600 wdt:mr-2'>W</span>
									<h3 className='wdt:text-lg wdt:font-medium'>WordPress</h3>
								</div>
								<div className='wdt:text-xl wdt:font-bold'>
									{ systemInfo.wordpress.version }
								</div>
								<div className='wdt:text-sm wdt:text-gray-500 wdt:mt-1'>
									{ systemInfo.wordpress.debug_mode ? (
										<span className='wdt:text-amber-600'>
											Debug Mode Enabled
										</span>
	                ) : (
	                  'Debug Mode Disabled'
	                ) }
								</div>
							</div>

							<div className='wdt:bg-white wdt:p-4 wdt:rounded-lg wdt:border wdt:border-gray-200 wdt:shadow-sm'>
								<div className='wdt:flex wdt:items-center wdt:mb-2'>
									<span className='wdt:text-purple-600 wdt:mr-2'>🌐</span>
									<h3 className='wdt:text-lg wdt:font-medium'>PHP</h3>
								</div>
								<div className='wdt:text-xl wdt:font-bold'>
									{ systemInfo.server.php_version }
								</div>
								<div className='wdt:text-sm wdt:text-gray-500 wdt:mt-1'>
									Memory: { systemInfo.server.php_memory_limit }
								</div>
							</div>

							<div className='wdt:bg-white wdt:p-4 wdt:rounded-lg wdt:border wdt:border-gray-200 wdt:shadow-sm'>
								<div className='wdt:flex wdt:items-center wdt:mb-2'>
									<Database className='wdt:text-green-600 wdt:mr-2' />
									<h3 className='wdt:text-lg wdt:font-medium'>MySQL</h3>
								</div>
								<div className='wdt:text-xl wdt:font-bold'>
									{ systemInfo.server.mysql_version }
								</div>
								<div className='wdt:text-sm wdt:text-gray-500 wdt:mt-1'>
									{ systemInfo.server.web_server }
								</div>
							</div>

							<div className='wdt:bg-white wdt:p-4 wdt:rounded-lg wdt:border wdt:border-gray-200 wdt:shadow-sm'>
								<div className='wdt:flex wdt:items-center wdt:mb-2'>
									<Palette className='wdt:text-amber-600 wdt:mr-2' />
									<h3 className='wdt:text-lg wdt:font-medium'>Theme</h3>
								</div>
								<div className='wdt:text-xl wdt:font-bold'>
									{ systemInfo.wordpress.theme }
								</div>
								<div className='wdt:text-sm wdt:text-gray-500 wdt:mt-1'>
									Version: { systemInfo.wordpress.theme_version }
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm'>
					<div className='wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6'>
						<div className='wdt:flex wdt:items-center wdt:gap-2'>
							<List />
							<h2>Detailed Information</h2>
						</div>
					</div>
					<div className='wdt:px-6 wdt:p-0'>
						<div className='wdt:border-b wdt:border-gray-200'>
							<nav className='wdt:flex'>
								{ tabs.map( ( tab ) => (
									<button
										key={ tab.name }
										className={ `wdt:px-6 wdt:py-3 wdt:font-medium wdt:flex wdt:items-center ${
	                    activeTab === tab.name
	                      ? 'wdt:border-b-2 wdt:border-blue-500 wdt:text-blue-600'
	                      : 'wdt:text-gray-600 hover:wdt:text-gray-800 hover:wdt:bg-gray-50'
	                  }` }
										onClick={ () => setActiveTab( tab.name ) }
	                >
										{ React.createElement( getTabIcon( tab.icon ), {
	                    className: 'wdt:mr-2',
	                  } ) }
										{ tab.title }
									</button>
	              ) ) }
							</nav>
						</div>

						<div className='wdt:p-6'>
							<SystemInfoCard
								title='WordPress Information'
								icon={ Info }
								data={ systemInfo.wordpress }
								formatValue={ ( key, value ) => {
	                switch ( key ) {
	                  case 'is_multisite':
	                    return value ? 'Yes' : 'No';
	                  case 'debug_mode':
	                    return value ? 'Enabled' : 'Disabled';
	                  case 'theme':
	                    return `${ value } (${ systemInfo.wordpress.theme_version })`;
	                  default:
	                    return String( value );
	                }
	              } }
	            />

							<SystemInfoCard
								title='Server Information'
								icon={ Monitor }
								data={ systemInfo.server }
								formatValue={ ( key, value ) => {
	                if ( key === 'php_max_execution_time' ) {
	                  return `${ value } seconds`;
	                }
	                return String( value );
	              } }
	            />

							<SystemInfoCard
								title='WordPress Constants'
								icon={ SettingsIcon }
								data={ systemInfo.constants }
	            />

							<PermissionsCard permissions={ systemInfo.permissions } />

							{ activeTab === 'server' && (
								<div>
									<h3 className='wdt:text-lg wdt:font-medium wdt:mb-4'>
										Server Environment
									</h3>
									<table className='wdt:w-full wdt:text-sm'>
										<tbody>
											<InfoRow
												label='PHP Version'
												value={ systemInfo.server.php_version }
	                    />
											<InfoRow
												label='MySQL Version'
												value={ systemInfo.server.mysql_version }
	                    />
											<InfoRow
												label='Web Server'
												value={ systemInfo.server.web_server }
	                    />
											<InfoRow
												label='PHP Memory Limit'
												value={ systemInfo.server.php_memory_limit }
	                    />
											<InfoRow
												label='PHP Execution Time'
												value={ `${ systemInfo.server.php_max_execution_time } seconds` }
	                    />
											<InfoRow
												label='PHP Post Max Size'
												value={ systemInfo.server.php_post_max_size }
	                    />
											<InfoRow
												label='PHP Upload Max Size'
												value={ systemInfo.server.php_upload_max_filesize }
	                    />
											<InfoRow
												label='PHP Max Input Vars'
												value={ systemInfo.server.php_max_input_vars }
	                    />
											<InfoRow
												label='PHP Extensions'
												value={
													<div className='wdt:max-h-32 wdt:overflow-y-auto wdt:text-xs'>
														{ systemInfo.server.php_extensions }
													</div>
	                      }
	                    />
										</tbody>
									</table>
								</div>
	            ) }

							{ activeTab === 'constants' && (
								<div>
									<h3 className='wdt:text-lg wdt:font-medium wdt:mb-4'>
										WordPress Constants
									</h3>
									<table className='wdt:w-full wdt:text-sm'>
										<tbody>
											{ Object.entries( systemInfo.constants ).map(
	                      ( [ key, value ] ) => (
													<InfoRow key={ key } label={ key } value={ value } />
	                      ),
	                    ) }
										</tbody>
									</table>
								</div>
	            ) }

							{ activeTab === 'permissions' && (
								<div>
									<h3 className='wdt:text-lg wdt:font-medium wdt:mb-4'>
										File Permissions
									</h3>
									<table className='wdt:w-full wdt:text-sm'>
										<tbody>
											{ Object.entries( systemInfo.permissions ).map(
	                      ( [ key, value ] ) => (
													<InfoRow
			key={ key }
			label={ key
	                            .replace( /_/g, ' ' )
	                            .replace( /\b\w/g, ( l ) => l.toUpperCase() ) }
			value={ value }
	                        />
	                      ),
	                    ) }
										</tbody>
									</table>
								</div>
	            ) }
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SystemInfo;
