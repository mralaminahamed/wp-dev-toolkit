import { AlertTriangle, Info, CheckCircle, Wrench } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { useSelect, useDispatch } from '@wordpress/data';

import { STORE_NAME as ERROR_LOG_STORE } from '@/stores/error-log/constants';
import { STORE_NAME as SETTINGS_STORE } from '@/stores/settings/constants';

import ErrorLogHeader from './ErrorLog/ErrorLogHeader';
import LogFilters from './ErrorLog/LogFilters';
import LogStats from './ErrorLog/LogStats';
import LogTable from './ErrorLog/LogTable';

interface LogStats {
	total: number;
	errors: number;
	warnings: number;
	info: number;
	debug: number;
	other: number;
}

const ErrorLog: React.FC = () => {
	const { entries } = useSelect(
	  ( select: any ) => ( {
	    entries: select( ERROR_LOG_STORE ).getEntries(),
	  } ),
	  [],
	);

	const { config } = useSelect(
	  ( select: any ) => ( {
	    config: select( SETTINGS_STORE ).getConfig(),
	  } ),
	  [],
	);

	const { fetchEntries, clearLog } = useDispatch( ERROR_LOG_STORE );
	const { toggleTool } = useDispatch( SETTINGS_STORE );

	const [ isFetching, setIsFetching ] = useState( false );
	const [ isClearing, setIsClearing ] = useState( false );
	const [ filterLevel, setFilterLevel ] = useState<string | null>( null );
	const [ autoRefresh, setAutoRefresh ] = useState( false );
	const [ refreshRate, setRefreshRate ] = useState( 10 );
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ logStats, setLogStats ] = useState<LogStats>( {
	  total: 0,
	  errors: 0,
	  warnings: 0,
	  info: 0,
	  debug: 0,
	  other: 0,
	} );
	const [ expandedLogs, setExpandedLogs ] = useState<Set<number>>( new Set() );
	const [ dateFilter, setDateFilter ] = useState<string | null>( null );
	const logEndRef = useRef<HTMLDivElement>( null );

	useEffect( () => {
	  fetchErrorLog();

	  // Set up auto-refresh if enabled
	  let intervalId: NodeJS.Timeout | null = null;
	  if ( autoRefresh ) {
	    intervalId = setInterval( fetchErrorLog, refreshRate * 1000 );
	  }

	  return () => {
	    if ( intervalId ) {
	      clearInterval( intervalId );
	    }
	  };
	}, [ autoRefresh, refreshRate ] );

	// Calculate log statistics when entries change
	useEffect( () => {
	  const currentLogs = entries || [];
	  const stats: LogStats = {
	    total: currentLogs.length,
	    errors: getLogLevelCount( 'ERROR' ),
	    warnings: getLogLevelCount( 'WARNING' ),
	    info: getLogLevelCount( 'INFO' ),
	    debug: getLogLevelCount( 'DEBUG' ),
	    other: 0,
	  };

	  stats.other =
	    stats.total - ( stats.errors + stats.warnings + stats.info + stats.debug );
	  setLogStats( stats );
	}, [ entries ] );

	const fetchErrorLog = async () => {
	  if ( isFetching ) {
	    return;
	  } // Prevent multiple simultaneous requests

	  setIsFetching( true );
	  try {
	    await fetchEntries();
	    // The store will update the entries automatically
	    // parsedLogs is derived from the store data
	  } catch ( error: any ) {
	    console.error( 'Failed to fetch error log:', error );
	  } finally {
	    setIsFetching( false );
	  }
	};

	const clearErrorLog = async () => {
	  if ( ! window.confirm( 'Are you sure you want to clear the error log?' ) ) {
	    return;
	  }

	  setIsClearing( true );
	  try {
	    await clearLog();
	    // The store will update the entries automatically
	  } catch ( error ) {
	    console.error( 'Error clearing error log:', error );
	  } finally {
	    setIsClearing( false );
	  }
	};

	const toggleLogging = () => {
	  toggleTool( 'error_logging' );
	};

	const getFilteredLogs = () => {
	  let filtered = entries || [];

	  // Apply level filter if set
	  if ( filterLevel ) {
	    filtered = filtered.filter( ( log ) => log.level === filterLevel );
	  }

	  // Apply search filter if set
	  if ( searchQuery ) {
	    const query = searchQuery.toLowerCase();
	    filtered = filtered.filter(
	      ( log ) =>
	        log.message.toLowerCase().includes( query ) ||
	        ( log.file && log.file.toLowerCase().includes( query ) ),
	    );
	  }

	  // Apply date filter if set
	  if ( dateFilter ) {
	    filtered = filtered.filter( ( log ) => {
	      const logDate = log.timestamp.split( ' ' )[ 0 ]; // Extract date part
	      return logDate === dateFilter;
	    } );
	  }

	  return filtered;
	};

	const formatFileSize = ( bytes: number ): string => {
	  if ( bytes === 0 ) {
	    return '0 Bytes';
	  }
	  const k = 1024;
	  const sizes = [ 'Bytes', 'KB', 'MB', 'GB' ];
	  const i = Math.floor( Math.log( bytes ) / Math.log( k ) );
	  return `${ parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( 2 ) ) } ${ sizes[ i ] }`;
	};

	const getLogLevelCount = ( level: string ): number => {
	  return ( entries || [] ).filter( ( log ) => log.level === level ).length;
	};

	const getLogLevelClass = ( level: string ): string => {
	  switch ( level.toUpperCase() ) {
	    case 'ERROR':
	      return 'wdt:bg-red-100 wdt:text-red-800';
	    case 'WARNING':
	      return 'wdt:bg-yellow-100 wdt:text-yellow-800';
	    case 'INFO':
	      return 'wdt:bg-blue-100 wdt:text-blue-800';
	    case 'DEBUG':
	      return 'wdt:bg-gray-100 wdt:text-gray-800';
	    default:
	      return 'wdt:bg-gray-100 wdt:text-gray-800';
	  }
	};

	const toggleExpandLog = ( index: number ) => {
	  setExpandedLogs( ( prev ) => {
	    const newSet = new Set( prev );
	    if ( newSet.has( index ) ) {
	      newSet.delete( index );
	    } else {
	      newSet.clear(); // Only allow one expanded at a time for now
	      newSet.add( index );
	      // Scroll to the expanded log after a short delay to allow rendering
	      setTimeout( () => {
	        logEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
	      }, 100 );
	    }
	    return newSet;
	  } );
	};

	// Get unique dates from logs for the date filter
	const getUniqueDates = (): string[] => {
	  const dates = new Set<string>();
	  ( entries || [] ).forEach( ( log ) => {
	    const datePart = log.timestamp.split( ' ' )[ 0 ]; // Extract date part
	    if ( datePart ) {
	      dates.add( datePart );
	    }
	  } );
	  return Array.from( dates ).sort( ( a, b ) => b.localeCompare( a ) ); // Sort descending
	};

	return (
		<div className='wdt:min-h-screen wdt:bg-gradient-to-br wdt:from-background wdt:via-background wdt:to-muted/20 wdt:p-6 lg:wdt:p-8'>
			<div className='wdt:max-w-7xl wdt:mx-auto wdt:space-y-8'>
				<ErrorLogHeader
					title='Error Log'
					description='Monitor and manage PHP errors, warnings and notices in real-time'
	      />

				{ /* Control Panel */ }
				<div className='wdt:bg-card/50 wdt:backdrop-blur-sm wdt:rounded-xl wdt:shadow-lg wdt:border wdt:border-border/50 wdt:p-6'>
					<div className='wdt:flex wdt:flex-wrap wdt:items-center wdt:justify-between wdt:gap-4'>
						<div className='wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-3'>
							<button
								className='wdt:px-6 wdt:py-3 wdt:bg-primary wdt:text-primary-foreground wdt:rounded-lg wdt:hover:bg-primary/90 wdt:disabled:opacity-50 wdt:transition-all wdt:duration-200 wdt:shadow-md wdt:hover:shadow-lg wdt:font-medium'
								onClick={ fetchErrorLog }
								disabled={ isFetching || isClearing }
	            >
								{ isFetching ? (
									<div className='wdt:flex wdt:items-center wdt:gap-2'>
										<div className='wdt:animate-spin wdt:rounded-full wdt:h-4 wdt:w-4 wdt:border-b-2 wdt:border-primary-foreground'></div>
										Refreshing...
									</div>
	              ) : (
	                'Refresh Log'
	              ) }
							</button>

							<button
								className='wdt:px-6 wdt:py-3 wdt:bg-destructive/10 wdt:text-destructive wdt:border wdt:border-destructive/20 wdt:rounded-lg wdt:hover:bg-destructive/20 wdt:disabled:opacity-50 wdt:transition-all wdt:duration-200 wdt:shadow-sm wdt:hover:shadow-md wdt:font-medium'
								onClick={ clearErrorLog }
								disabled={
	                isFetching || isClearing || ( entries && entries.length === 0 )
	              }
	            >
								{ isClearing ? 'Clearing...' : 'Clear Log' }
							</button>

							<button
								className={ `wdt:px-6 wdt:py-3 wdt:rounded-lg wdt:transition-all wdt:duration-200 wdt:shadow-sm wdt:hover:shadow-md wdt:font-medium ${
	                config.error_logging
	                  ? 'wdt:bg-amber-100 wdt:text-amber-700 wdt:border wdt:border-amber-200 wdt:hover:bg-amber-200 wdt:dark:bg-amber-900/20 wdt:dark:text-amber-300 wdt:dark:border-amber-800'
	                  : 'wdt:bg-green-100 wdt:text-green-700 wdt:border wdt:border-green-200 wdt:hover:bg-green-200 wdt:dark:bg-green-900/20 wdt:dark:text-green-300 wdt:dark:border-green-800'
	              }` }
								onClick={ toggleLogging }
	            >
								{ config.error_logging ? 'Disable Logging' : 'Enable Logging' }
							</button>
						</div>

						<div className='wdt:flex wdt:items-center wdt:gap-4'>
							<label className='wdt:flex wdt:items-center wdt:gap-2 wdt:cursor-pointer'>
								<input
									type='checkbox'
									checked={ autoRefresh }
									onChange={ () => setAutoRefresh( ! autoRefresh ) }
									className='wdt:rounded wdt:border-border wdt:text-primary wdt:focus:ring-primary/20'
	              />
								<span className='wdt:text-sm wdt:font-medium'>
									Auto-refresh
								</span>
							</label>

							{ autoRefresh && (
								<div className='wdt:flex wdt:items-center wdt:gap-2'>
									<span className='wdt:text-sm wdt:font-medium wdt:text-muted-foreground'>
										Rate:
									</span>
									<select
										value={ refreshRate.toString() }
										onChange={ ( e ) =>
	                    setRefreshRate( parseInt( e.target.value, 10 ) )
	                  }
										className='wdt:px-3 wdt:py-2 wdt:border wdt:border-border wdt:rounded-md wdt:bg-background wdt:text-sm wdt:focus:outline-none wdt:focus:ring-2 wdt:focus:ring-primary/20'
	                >
										<option value='5'>5s</option>
										<option value='10'>10s</option>
										<option value='30'>30s</option>
										<option value='60'>60s</option>
									</select>
								</div>
	            ) }
						</div>
					</div>
				</div>

				<LogStats
					stats={ logStats }
					fileSize={ ( entries || [] ).length * 100 } // Rough estimate for demo
					formatFileSize={ formatFileSize }
	      />

				<div className='wdt:bg-card/50 wdt:backdrop-blur-sm wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:border-border/50 wdt:py-6 wdt:shadow-lg'>
					<div className='wdt:px-6 wdt:pb-4 wdt:border-b wdt:border-border/50'>
						<div className='wdt:flex wdt:items-center wdt:gap-3'>
							<div className='wdt:p-2 wdt:bg-primary/10 wdt:rounded-lg'>
								<AlertTriangle className='wdt:w-5 wdt:h-5 wdt:text-primary' />
							</div>
							<div>
								<h2 className='wdt:text-xl wdt:font-semibold'>Log Entries</h2>
								<p className='wdt:text-sm wdt:text-muted-foreground'>
									View and analyze error logs with filtering options
								</p>
							</div>
						</div>
					</div>
					<div className='wdt:px-6'>
						<LogFilters
							searchTerm={ searchQuery }
							onSearchChange={ setSearchQuery }
							selectedLevel={ filterLevel }
							onLevelChange={ setFilterLevel }
							selectedDate={ dateFilter }
							onDateChange={ setDateFilter }
							availableDates={ getUniqueDates() }
							filteredCount={ ( entries || [] ).length }
							config={ config }
							toggleLogging={ toggleLogging }
	          />

						{ /* Log Content */ }
						{ isFetching ? (
							<div className='wdt:flex wdt:flex-col wdt:justify-center wdt:items-center wdt:p-12 wdt:bg-muted/30 wdt:rounded-lg'>
								<div className='wdt:animate-spin wdt:rounded-full wdt:h-8 wdt:w-8 wdt:border-b-2 wdt:border-primary wdt:mb-4'></div>
								<span className='wdt:text-muted-foreground wdt:font-medium'>
									Loading error log...
								</span>
							</div>
	          ) : entries && entries.length > 0 ? (
							<>
			<LogTable
									logs={ getFilteredLogs() }
									expandedLogs={ expandedLogs }
									onToggleExpanded={ toggleExpandLog }
									getLogLevelBgClass={ getLogLevelClass }
	              />
			<div ref={ logEndRef }></div>
			{ /* Log entry count */ }
			<div className='wdt:mt-6 wdt:flex wdt:items-center wdt:justify-between wdt:p-4 wdt:bg-muted/30 wdt:rounded-lg'>
									<div className='wdt:text-sm wdt:text-muted-foreground'>
					Showing{ ' ' }
					<span className='wdt:font-medium wdt:text-foreground'>
											{ getFilteredLogs().length }
										</span>{ ' ' }
					of{ ' ' }
					<span className='wdt:font-medium wdt:text-foreground'>
											{ entries.length }
										</span>{ ' ' }
					log entries
									</div>
									{ ( entries || [] ).length !== getFilteredLogs().length && (
				<button
											onClick={ () => {
	                      setFilterLevel( null );
	                      setSearchQuery( '' );
	                      setDateFilter( null );
	                    } }
											className='wdt:text-sm wdt:text-primary wdt:hover:text-primary/80 wdt:underline'
	                  >
											Clear filters
										</button>
	                ) }
								</div>
		</>
	          ) : (
							<div className='wdt:bg-gradient-to-br wdt:from-green-50 wdt:to-green-100/50 wdt:dark:from-green-950/20 wdt:dark:to-green-900/10 wdt:p-12 wdt:rounded-xl wdt:text-center wdt:border wdt:border-green-200/50 wdt:dark:border-green-800/30'>
			<div className='wdt:flex wdt:justify-center wdt:mb-4'>
									<div className='wdt:p-4 wdt:bg-green-100 wdt:dark:bg-green-900/30 wdt:rounded-full'>
					<CheckCircle className='wdt:w-8 wdt:h-8 wdt:text-green-600 wdt:dark:text-green-400' />
				</div>
								</div>
			<h3 className='wdt:text-lg wdt:font-semibold wdt:text-green-900 wdt:dark:text-green-100 wdt:mb-2'>
									All Clear!
								</h3>
			<p className='wdt:text-green-700 wdt:dark:text-green-300 wdt:max-w-md wdt:mx-auto'>
									No log entries found. Your application is running smoothly
									without any errors or warnings.
								</p>
		</div>
	          ) }
					</div>
				</div>

				<div className='wdt:bg-card/50 wdt:backdrop-blur-sm wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:border-border/50 wdt:py-6 wdt:shadow-lg'>
					<div className='wdt:px-6 wdt:pb-4 wdt:border-b wdt:border-border/50'>
						<div className='wdt:flex wdt:items-center wdt:gap-3'>
							<div className='wdt:p-2 wdt:bg-primary/10 wdt:rounded-lg'>
								<Wrench className='wdt:w-5 wdt:h-5 wdt:text-primary' />
							</div>
							<div>
								<h2 className='wdt:text-xl wdt:font-semibold'>
									Log Configuration
								</h2>
								<p className='wdt:text-sm wdt:text-muted-foreground'>
									Understanding error logging and configuration
								</p>
							</div>
						</div>
					</div>
					<div className='wdt:px-6'>
						<div className='wdt:grid wdt:grid-cols-1 md:wdt:grid-cols-2 wdt:gap-6'>
							<div className='wdt:space-y-4'>
								<div className='wdt:p-4 wdt:bg-muted/30 wdt:rounded-lg wdt:border wdt:border-border/50'>
									<h4 className='wdt:font-medium wdt:mb-2 wdt:flex wdt:items-center wdt:gap-2'>
										<FileText className='wdt:w-4 wdt:h-4' />
										Log File Location
									</h4>
									<code className='wdt:text-sm wdt:bg-muted wdt:px-3 wdt:py-2 wdt:rounded wdt:block wdt:font-mono'>
										{ window.wpDevToolkit?.logPath ||
	                    'wp-content/wp-dev-toolkit-error.log' }
									</code>
								</div>
								<p className='wdt:text-sm wdt:text-muted-foreground'>
									The error log captures PHP errors, warnings, and notices based
									on your WordPress and PHP configurations. Logs are
									automatically rotated and cleaned up according to your
									settings.
								</p>
							</div>
							<div className='wdt:p-4 wdt:bg-blue-50 wdt:dark:bg-blue-950/20 wdt:rounded-lg wdt:border wdt:border-blue-200/50 wdt:dark:border-blue-800/30'>
								<div className='wdt:flex wdt:items-start wdt:gap-3'>
									<Info className='wdt:text-blue-500 wdt:dark:text-blue-400 wdt:mt-0.5 wdt:flex-shrink-0' />
									<div>
										<h4 className='wdt:font-medium wdt:text-blue-900 wdt:dark:text-blue-100 wdt:mb-3'>
											PHP Error Levels
										</h4>
										<div className='wdt:space-y-2'>
											<div className='wdt:flex wdt:items-start wdt:gap-2'>
												<div className='wdt:w-2 wdt:h-2 wdt:bg-red-500 wdt:rounded-full wdt:mt-2 wdt:flex-shrink-0'></div>
												<div className='wdt:text-sm'>
													<span className='wdt:font-medium wdt:text-red-700 wdt:dark:text-red-300'>
														E_ERROR:
													</span>
													<span className='wdt:text-red-600 wdt:dark:text-red-400 wdt:ml-1'>
														Fatal run-time errors that cannot be recovered from
													</span>
												</div>
											</div>
											<div className='wdt:flex wdt:items-start wdt:gap-2'>
												<div className='wdt:w-2 wdt:h-2 wdt:bg-yellow-500 wdt:rounded-full wdt:mt-2 wdt:flex-shrink-0'></div>
												<div className='wdt:text-sm'>
													<span className='wdt:font-medium wdt:text-yellow-700 wdt:dark:text-yellow-300'>
														E_WARNING:
													</span>
													<span className='wdt:text-yellow-600 wdt:dark:text-yellow-400 wdt:ml-1'>
														Run-time warnings that do not interrupt script
														execution
													</span>
												</div>
											</div>
											<div className='wdt:flex wdt:items-start wdt:gap-2'>
												<div className='wdt:w-2 wdt:h-2 wdt:bg-blue-500 wdt:rounded-full wdt:mt-2 wdt:flex-shrink-0'></div>
												<div className='wdt:text-sm'>
													<span className='wdt:font-medium wdt:text-blue-700 wdt:dark:text-blue-300'>
														E_NOTICE:
													</span>
													<span className='wdt:text-blue-600 wdt:dark:text-blue-400 wdt:ml-1'>
														Notices indicating possible coding issues
													</span>
												</div>
											</div>
											<div className='wdt:flex wdt:items-start wdt:gap-2'>
												<div className='wdt:w-2 wdt:h-2 wdt:bg-purple-500 wdt:rounded-full wdt:mt-2 wdt:flex-shrink-0'></div>
												<div className='wdt:text-sm'>
													<span className='wdt:font-medium wdt:text-purple-700 wdt:dark:text-purple-300'>
														E_DEPRECATED:
													</span>
													<span className='wdt:text-purple-600 wdt:dark:text-purple-400 wdt:ml-1'>
														Functions that will be removed in future PHP
														versions
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ErrorLog;
