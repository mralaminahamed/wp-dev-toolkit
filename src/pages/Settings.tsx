import React, { useState, useEffect } from 'react';

import {
	ToggleControl,
	SelectControl,
	RangeControl,
	Button,
	Spinner,
	Dashicon,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';

import { STORE_NAME as SETTINGS_STORE } from '@/stores/settings/constants';

interface Settings {
  dev_mode: boolean;
  error_logger: boolean;
  query_monitor: boolean;
  hook_inspector: boolean;
  log_level: string;
  max_queries: number;
  slow_query_threshold: number;
}

const Settings: React.FC = () => {
	const { config, isResolving } = useSelect(
		( select: any ) => ( {
			config: select( SETTINGS_STORE ).getConfig(),
			isResolving: ( key: string ) => select( SETTINGS_STORE ).isResolving( key ),
		} ),
		[],
	);

	const { toggleTool } = useDispatch( SETTINGS_STORE );
	const [ settings, setSettings ] = useState<Settings>( {
		dev_mode: false,
		error_logger: true,
		query_monitor: true,
		hook_inspector: true,
		log_level: 'all',
		max_queries: 100,
		slow_query_threshold: 1.0,
	} );
	const [ isSaving, setIsSaving ] = useState<boolean>( false );
	const [ saved, setSaved ] = useState<boolean>( false );
	const [ error, setError ] = useState<string | null>( null );
	const [ isLoading, setIsLoading ] = useState<boolean>( false );

	useEffect( () => {
		fetchSettings();
	}, [] );

	const fetchSettings = async () => {
		setIsLoading( true );
		try {
			const response = await fetch( `${ window.wpDevToolkit.apiUrl }/settings`, {
				headers: {
					'X-WP-Nonce': window.wpDevToolkit.nonce,
				},
			} );
			const data = await response.json();

			if ( data.success && data.data.settings ) {
				setSettings( data.data.settings );
			}
		} catch ( err ) {
			console.error( 'Error fetching settings:', err );
			setError( 'Failed to load settings' );
		}
		setIsLoading( false );
	};

	const updateSetting = <K extends keyof Settings>(
		key: K,
		value: Settings[K],
	) => {
		setSettings( ( prev ) => ( {
			...prev,
			[ key ]: value,
		} ) );
	};

	const saveSettings = async () => {
		setIsSaving( true );
		setSaved( false );
		setError( null );

		try {
			const response = await fetch( `${ window.wpDevToolkit.apiUrl }/settings`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.wpDevToolkit.nonce,
				},
				body: JSON.stringify( settings ),
			} );

			const data = await response.json();

			if ( data.success ) {
				setSaved( true );
				setTimeout( () => setSaved( false ), 3000 );
			} else {
				setError( data.data.message || 'Failed to save settings' );
			}
		} catch ( err ) {
			console.error( 'Error saving settings:', err );
			setError( 'Failed to save settings' );
		}

		setIsSaving( false );
	};

	const resetSettings = async () => {
		if (
			! confirm( 'Are you sure you want to reset all settings to default values?' )
		) {
			return;
		}

		setIsSaving( true );
		setSaved( false );
		setError( null );

		try {
			const response = await fetch(
				`${ window.wpDevToolkit.apiUrl }/settings/reset`,
				{
					method: 'POST',
					headers: {
						'X-WP-Nonce': window.wpDevToolkit.nonce,
					},
				},
			);

			const data = await response.json();

			if ( data.success ) {
				setSettings( data.data.settings );
				setSaved( true );
				setTimeout( () => setSaved( false ), 3000 );
			} else {
				setError( data.data.message || 'Failed to reset settings' );
			}
		} catch ( err ) {
			console.error( 'Error resetting settings:', err );
			setError( 'Failed to reset settings' );
		}

		setIsSaving( false );
	};

	if ( isLoading ) {
		return (
			<div className="wp-dev-toolkit-settings">
				<div className="wp-dev-toolkit-page-header">
					<h1>Settings</h1>
					<p>Configure the WordPress Development Toolkit</p>
				</div>
				<div className="flex justify-center items-center p-16 bg-white rounded-lg shadow-sm">
					<Spinner /> <span className="ml-2">Loading settings...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="wp-dev-toolkit-settings">
			<div className="wp-dev-toolkit-page-header">
				<h1>Settings</h1>
				<p>Configure the WordPress Development Toolkit</p>
			</div>

			{ saved && (
				<div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6 flex items-start">
					<Dashicon icon="yes-alt" className="text-green-500 mr-3 mt-0.5" />
					<div>
						<h3 className="font-medium">Success</h3>
						<p>Settings saved successfully!</p>
					</div>
				</div>
			) }

			{ error && (
				<div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-start">
					<Dashicon icon="warning" className="text-red-500 mr-3 mt-0.5" />
					<div>
						<h3 className="font-medium">Error</h3>
						<p>{ error }</p>
						<Button
							className="mt-2 text-red-700 underline text-sm"
							onClick={ () => setError( null ) }
						>
							Dismiss
						</Button>
					</div>
				</div>
			) }

			<div className="wp-dev-toolkit-card mb-6">
				<div className="wp-dev-toolkit-card-header">
					<div className="flex items-center">
						<Dashicon icon="admin-generic" className="mr-2" />
						<h2>General Settings</h2>
					</div>
				</div>
				<div className="wp-dev-toolkit-card-body">
					<div className="space-y-6">
						<div className="wp-dev-toolkit-settings-option">
							<ToggleControl
								label="Development Mode"
								checked={ settings.dev_mode }
								onChange={ ( value ) => updateSetting( 'dev_mode', value ) }
								help="Enable development mode features across all tools"
							/>
						</div>

						<div className="wp-dev-toolkit-settings-option">
							<SelectControl
								label="Log Level"
								value={ settings.log_level }
								options={ [
									{ label: 'All', value: 'all' },
									{ label: 'Errors Only', value: 'error' },
									{ label: 'Warnings & Errors', value: 'warning' },
									{ label: 'Notices & Above', value: 'notice' },
									{ label: 'Info & Above', value: 'info' },
								] }
								onChange={ ( value ) => updateSetting( 'log_level', value ) }
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="wp-dev-toolkit-card mb-6">
				<div className="wp-dev-toolkit-card-header">
					<div className="flex items-center">
						<Dashicon icon="admin-tools" className="mr-2" />
						<h2>Tool Settings</h2>
					</div>
				</div>
				<div className="wp-dev-toolkit-card-body">
					<div className="space-y-6">
						<div className="wp-dev-toolkit-settings-option">
							<ToggleControl
								label="Error Logger"
								checked={ settings.error_logger }
								onChange={ ( value ) => updateSetting( 'error_logger', value ) }
								help="Enable error logging functionality"
							/>
						</div>

						<div className="wp-dev-toolkit-settings-option">
							<ToggleControl
								label="Query Monitor"
								checked={ settings.query_monitor }
								onChange={ ( value ) => updateSetting( 'query_monitor', value ) }
								help="Enable database query monitoring"
							/>
						</div>

						<div className="wp-dev-toolkit-settings-option">
							<ToggleControl
								label="Hook Inspector"
								checked={ settings.hook_inspector }
								onChange={ ( value ) => updateSetting( 'hook_inspector', value ) }
								help="Enable WordPress hook inspection"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="wp-dev-toolkit-card mb-6">
				<div className="wp-dev-toolkit-card-header">
					<div className="flex items-center">
						<Dashicon icon="performance" className="mr-2" />
						<h2>Performance Settings</h2>
					</div>
				</div>
				<div className="wp-dev-toolkit-card-body">
					<div className="space-y-6">
						<div className="wp-dev-toolkit-settings-option">
							<RangeControl
								label="Maximum Queries to Log"
								value={ settings.max_queries }
								onChange={ ( value ) => updateSetting( 'max_queries', value || 100 ) }
								min={ 10 }
								max={ 1000 }
								step={ 10 }
								help="Number of database queries to keep in memory"
							/>
						</div>

						<div className="wp-dev-toolkit-settings-option">
							<RangeControl
								label="Slow Query Threshold (seconds)"
								value={ settings.slow_query_threshold }
								onChange={ ( value ) =>
									updateSetting( 'slow_query_threshold', value || 1.0 )
								}
								min={ 0.1 }
								max={ 10.0 }
								step={ 0.1 }
								help="Queries taking longer than this will be highlighted"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="flex space-x-4">
				<Button
					className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
					onClick={ saveSettings }
					disabled={ isSaving }
					icon="yes"
				>
					{ isSaving ? 'Saving...' : 'Save Settings' }
				</Button>
				<Button
					className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
					onClick={ resetSettings }
					disabled={ isSaving }
					icon="update"
				>
					Reset to Defaults
				</Button>
			</div>
		</div>
	);
};

export default Settings;
