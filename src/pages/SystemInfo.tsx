import React, { useState, useEffect } from 'react';

import { Button, Spinner, TabPanel, Dashicon } from '@wordpress/components';

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
			const response = await fetch( `${ window.wpDevToolkit.apiUrl }/system-info`, {
				headers: {
					'X-WP-Nonce': window.wpDevToolkit.nonce,
				},
			} );
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
		<tr className="wdtborder-b wdtborder-gray-200">
			<td className="wdtpy-3 wdtpx-4 wdtfont-medium wdttext-gray-700">{ label }</td>
			<td className="wdtpy-3 wdtpx-4">
				{ typeof value === 'boolean' ? (
					value ? (
						<span className="wdtinline-flex wdtitems-center wdtpx-2.5 wdtpy-0.5 wdtrounded-full wdttext-xs wdtfont-medium wdtbg-green-100 wdttext-green-800">
							<Dashicon icon="yes" size={ 14 } className="wdtmr-1" /> Yes
						</span>
					) : (
						<span className="wdtinline-flex wdtitems-center wdtpx-2.5 wdtpy-0.5 wdtrounded-full wdttext-xs wdtfont-medium wdtbg-red-100 wdttext-red-800">
							<Dashicon icon="no-alt" size={ 14 } className="wdtmr-1" /> No
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
			<div className="wp-dev-toolkit-system-info">
				<div className="wp-dev-toolkit-page-header">
					<h1>System Information</h1>
					<p>View details about your WordPress environment</p>
				</div>

				<div className="wdtflex wdtjustify-center wdtitems-center wdtp-16 wdtbg-white wdtrounded-lg wdtshadow-sm">
					<Spinner /> <span className="wdtml-2">Loading system information...</span>
				</div>
			</div>
		);
	}

	if ( error ) {
		return (
			<div className="wp-dev-toolkit-system-info">
				<div className="wp-dev-toolkit-page-header">
					<h1>System Information</h1>
					<p>View details about your WordPress environment</p>
				</div>

				<div className="wp-dev-toolkit-card wdtbg-red-50 wdtborder wdtborder-red-200">
					<div className="wp-dev-toolkit-card-body">
						<div className="wdtflex wdtitems-start">
							<Dashicon icon="warning" className="wdttext-red-500 wdtmr-3 wdtmt-1" />
							<div>
								<h3 className="wdttext-red-800 wdtfont-medium wdtmb-2">Error Loading System Information</h3>
								<p className="wdttext-red-700 wdtmb-4">{ error }</p>
								<Button className="wp-dev-toolkit-button wp-dev-toolkit-button-primary" onClick={ fetchSystemInfo } icon="update">
									Retry
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if ( ! systemInfo ) {
		return (
			<div className="wp-dev-toolkit-system-info">
				<div className="wp-dev-toolkit-page-header">
					<h1>System Information</h1>
					<p>View details about your WordPress environment</p>
				</div>

				<div className="wp-dev-toolkit-card">
					<div className="wp-dev-toolkit-card-body">
						<p>No system information available.</p>
					</div>
				</div>
			</div>
		);
	}

	const tabs = [
		{ name: 'wordpress', title: 'WordPress', icon: 'wordpress' },
		{ name: 'server', title: 'Server', icon: 'desktop' },
		{ name: 'constants', title: 'Constants', icon: 'admin-settings' },
		{ name: 'permissions', title: 'Permissions', icon: 'lock' },
	];

	return (
		<div className="wp-dev-toolkit-system-info">
			<div className="wp-dev-toolkit-page-header">
				<h1>System Information</h1>
				<p>View details about your WordPress environment</p>
			</div>

			<div className="wp-dev-toolkit-card wdtmb-6">
				<div className="wp-dev-toolkit-card-header">
					<div className="wdtflex wdtjustify-between wdtitems-center">
						<div className="wdtflex wdtitems-center wdtgap-2">
							<Dashicon icon="info-outline" />
							<h2>System Overview</h2>
						</div>
						<div className="wdtflex wdtgap-2">
							<Button className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary" onClick={ copyToClipboard } icon="clipboard">
								{ copySuccess ? 'Copied!' : 'Copy All Info' }
							</Button>
							<Button className="wp-dev-toolkit-button wp-dev-toolkit-button-primary" onClick={ fetchSystemInfo } icon="update">
								Refresh Info
							</Button>
						</div>
					</div>
				</div>
				<div className="wp-dev-toolkit-card-body">
					<div className="wdtgrid wdtgrid-cols-1 md:wdtgrid-cols-2 lg:wdtgrid-cols-4 wdtgap-6">
						<div className="wdtbg-white wdtp-4 wdtrounded-lg wdtborder wdtborder-gray-200 wdtshadow-sm">
							<div className="wdtflex wdtitems-center wdtmb-2">
								<Dashicon icon="wordpress" className="wdttext-blue-600 wdtmr-2" />
								<h3 className="wdttext-lg wdtfont-medium">WordPress</h3>
							</div>
							<div className="wdttext-xl wdtfont-bold">{ systemInfo.wordpress.version }</div>
							<div className="wdttext-sm wdttext-gray-500 wdtmt-1">{ systemInfo.wordpress.debug_mode ? <span className="wdttext-amber-600">Debug Mode Enabled</span> : 'Debug Mode Disabled' }</div>
						</div>

						<div className="wdtbg-white wdtp-4 wdtrounded-lg wdtborder wdtborder-gray-200 wdtshadow-sm">
							<div className="wdtflex wdtitems-center wdtmb-2">
								<Dashicon icon="admin-site-alt3" className="wdttext-purple-600 wdtmr-2" />
								<h3 className="wdttext-lg wdtfont-medium">PHP</h3>
							</div>
							<div className="wdttext-xl wdtfont-bold">{ systemInfo.server.php_version }</div>
							<div className="wdttext-sm wdttext-gray-500 wdtmt-1">Memory: { systemInfo.server.php_memory_limit }</div>
						</div>

						<div className="wdtbg-white wdtp-4 wdtrounded-lg wdtborder wdtborder-gray-200 wdtshadow-sm">
							<div className="wdtflex wdtitems-center wdtmb-2">
								<Dashicon icon="database" className="wdttext-green-600 wdtmr-2" />
								<h3 className="wdttext-lg wdtfont-medium">MySQL</h3>
							</div>
							<div className="wdttext-xl wdtfont-bold">{ systemInfo.server.mysql_version }</div>
							<div className="wdttext-sm wdttext-gray-500 wdtmt-1">{ systemInfo.server.web_server }</div>
						</div>

						<div className="wdtbg-white wdtp-4 wdtrounded-lg wdtborder wdtborder-gray-200 wdtshadow-sm">
							<div className="wdtflex wdtitems-center wdtmb-2">
								<Dashicon icon="admin-appearance" className="wdttext-amber-600 wdtmr-2" />
								<h3 className="wdttext-lg wdtfont-medium">Theme</h3>
							</div>
							<div className="wdttext-xl wdtfont-bold">{ systemInfo.wordpress.theme }</div>
							<div className="wdttext-sm wdttext-gray-500 wdtmt-1">Version: { systemInfo.wordpress.theme_version }</div>
						</div>
					</div>
				</div>
			</div>

			<div className="wp-dev-toolkit-card">
				<div className="wp-dev-toolkit-card-header">
					<div className="wdtflex wdtitems-center wdtgap-2">
						<Dashicon icon="list-view" />
						<h2>Detailed Information</h2>
					</div>
				</div>
				<div className="wp-dev-toolkit-card-body wdtp-0">
					<div className="wdtborder-b wdtborder-gray-200">
						<nav className="wdtflex">
							{ tabs.map( ( tab ) => (
								<button
									key={ tab.name }
									className={ `wdtpx-6 wdtpy-3 wdtfont-medium wdtflex wdtitems-center ${
										activeTab === tab.name ? 'wdtborder-b-2 wdtborder-blue-500 wdttext-blue-600' : 'wdttext-gray-600 hover:wdttext-gray-800 hover:wdtbg-gray-50'
									}` }
									onClick={ () => setActiveTab( tab.name ) }
								>
									<Dashicon icon={ tab.icon as any } className="wdtmr-2" />
									{ tab.title }
								</button>
							) ) }
						</nav>
					</div>

					<div className="wdtp-6">
						{ activeTab === 'wordpress' && (
							<div>
								<h3 className="wdttext-lg wdtfont-medium wdtmb-4">WordPress Environment</h3>
								<table className="wp-dev-toolkit-system-info-table">
									<tbody>
										<InfoRow label="WordPress Version" value={ systemInfo.wordpress.version } />
										<InfoRow label="Home URL" value={ systemInfo.wordpress.home_url } />
										<InfoRow label="Site URL" value={ systemInfo.wordpress.site_url } />
										<InfoRow label="Multisite" value={ systemInfo.wordpress.is_multisite } />
										<InfoRow label="Debug Mode" value={ systemInfo.wordpress.debug_mode } />
										<InfoRow label="Memory Limit" value={ systemInfo.wordpress.memory_limit } />
										<InfoRow label="Permalink Structure" value={ systemInfo.wordpress.permalink_structure || 'Default' } />
										<InfoRow label="Active Theme" value={ `${ systemInfo.wordpress.theme } ${ systemInfo.wordpress.theme_version }` } />
										<InfoRow label="Active Plugins" value={ systemInfo.wordpress.active_plugins } />
										<InfoRow label="Site Language" value={ systemInfo.wordpress.language } />
									</tbody>
								</table>
							</div>
						) }

						{ activeTab === 'server' && (
							<div>
								<h3 className="wdttext-lg wdtfont-medium wdtmb-4">Server Environment</h3>
								<table className="wp-dev-toolkit-system-info-table">
									<tbody>
										<InfoRow label="PHP Version" value={ systemInfo.server.php_version } />
										<InfoRow label="MySQL Version" value={ systemInfo.server.mysql_version } />
										<InfoRow label="Web Server" value={ systemInfo.server.web_server } />
										<InfoRow label="PHP Memory Limit" value={ systemInfo.server.php_memory_limit } />
										<InfoRow label="PHP Execution Time" value={ `${ systemInfo.server.php_max_execution_time } seconds` } />
										<InfoRow label="PHP Post Max Size" value={ systemInfo.server.php_post_max_size } />
										<InfoRow label="PHP Upload Max Size" value={ systemInfo.server.php_upload_max_filesize } />
										<InfoRow label="PHP Max Input Vars" value={ systemInfo.server.php_max_input_vars } />
										<InfoRow label="PHP Extensions" value={ <div className="wdtmax-h-32 wdtoverflow-y-auto wdttext-xs">{ systemInfo.server.php_extensions }</div> } />
									</tbody>
								</table>
							</div>
						) }

						{ activeTab === 'constants' && (
							<div>
								<h3 className="wdttext-lg wdtfont-medium wdtmb-4">WordPress Constants</h3>
								<table className="wp-dev-toolkit-system-info-table">
									<tbody>
										{ Object.entries( systemInfo.constants ).map( ( [ key, value ] ) => (
											<InfoRow key={ key } label={ key } value={ value } />
										) ) }
									</tbody>
								</table>
							</div>
						) }

						{ activeTab === 'permissions' && (
							<div>
								<h3 className="wdttext-lg wdtfont-medium wdtmb-4">File Permissions</h3>
								<table className="wp-dev-toolkit-system-info-table">
									<tbody>
										{ Object.entries( systemInfo.permissions ).map( ( [ key, value ] ) => (
											<InfoRow key={ key } label={ key.replace( /_/g, ' ' ).replace( /\b\w/g, ( l ) => l.toUpperCase() ) } value={ value } />
										) ) }
									</tbody>
								</table>
							</div>
						) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default SystemInfo;
