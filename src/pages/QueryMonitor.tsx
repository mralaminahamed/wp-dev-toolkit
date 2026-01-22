import { AlertTriangle } from 'lucide-react';
import React from 'react';

import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';

import { STORE_NAME as SETTINGS_STORE } from '@/stores/settings/constants';

import { Button } from '@/components/ui/button';

import LoadingState from './QueryMonitor/LoadingState';
import QueryDetails from './QueryMonitor/QueryDetails';
import QueryFilters from './QueryMonitor/QueryFilters';
import QueryStatsCards from './QueryMonitor/QueryStatsCards';
import QueryTable from './QueryMonitor/QueryTable';

interface QueryItem {
	query: string;
	time: number;
	caller: string;
	backtrace?: string[];
}

interface QueryOptions {
	order: 'time' | 'caller' | 'query';
	direction: 'asc' | 'desc';
	limit: number;
	search?: string;
}

interface QueryStats {
	slow: number;
	medium: number;
	fast: number;
}

const QueryMonitor: React.FC = () => {
	const { config } = useSelect(
	  ( select: any ) => ( {
	    config: select( SETTINGS_STORE ).getConfig(),
	  } ),
	  [],
	);

	const { toggleTool } = useDispatch( SETTINGS_STORE );
	const [ queries, setQueries ] = useState<QueryItem[]>( [] );
	const [ totalTime, setTotalTime ] = useState<number>( 0 );
	const [ totalQueries, setTotalQueries ] = useState<number>( 0 );
	const [ selectedQuery, setSelectedQuery ] = useState<QueryItem | null>( null );
	const [ searchTimeout, setSearchTimeout ] = useState<NodeJS.Timeout | null>(
	  null,
	);
	const [ searchTerm, setSearchTerm ] = useState<string>( '' );
	const [ stats, setStats ] = useState<QueryStats>( {
	  slow: 0,
	  medium: 0,
	  fast: 0,
	} );
	const [ showOptimizationTips, setShowOptimizationTips ] =
	  useState<boolean>( false );
	const [ queryOptions, setQueryOptions ] = useState<QueryOptions>( {
	  order: 'time',
	  direction: 'desc',
	  limit: 100,
	  search: '',
	} );
	const [ isLoading, setIsLoading ] = useState<boolean>( false );
	const [ filteredQueries, setFilteredQueries ] = useState<QueryItem[]>( [] );

	useEffect( () => {
	  fetchQueries();
	}, [ queryOptions ] );

	// Cleanup search timeout on unmount
	useEffect( () => {
	  return () => {
	    if ( searchTimeout ) {
	      clearTimeout( searchTimeout );
	    }
	  };
	}, [ searchTimeout ] );

	useEffect( () => {
	  if ( searchTerm ) {
	    const filtered = queries.filter(
	      ( query ) =>
	        query.query.toLowerCase().includes( searchTerm.toLowerCase() ) ||
	        ( query.caller &&
	          query.caller.toLowerCase().includes( searchTerm.toLowerCase() ) ),
	    );
	    setFilteredQueries( filtered );
	  } else {
	    setFilteredQueries( queries );
	  }
	}, [ searchTerm, queries ] );

	useEffect( () => {
	  if ( queries.length ) {
	    // Calculate query stats
	    const slow = queries.filter( ( q ) => q.time > 0.1 ).length;
	    const medium = queries.filter(
	      ( q ) => q.time <= 0.1 && q.time > 0.05,
	    ).length;
	    const fast = queries.filter( ( q ) => q.time <= 0.05 ).length;
	    setStats( { slow, medium, fast } );
	  }
	}, [ queries ] );

	const fetchQueries = async () => {
	  setIsLoading( true );
	  try {
	    const response = await fetch(
	      `${ window.wpDevToolkit.apiUrl }/query-monitor?limit=${ queryOptions.limit }&order=${ queryOptions.order }&direction=${ queryOptions.direction }${ queryOptions.search ? `&search=${ encodeURIComponent( queryOptions.search ) }` : '' }`,
	      {
	        headers: {
	          'X-WP-Nonce': window.wpDevToolkit.nonce,
	        },
	      },
	    );
	    const data = await response.json();

	    if ( data.success ) {
	      setQueries( data.data.queries || [] );
	      setTotalTime( data.data.total_time || 0 );
	      setTotalQueries( data.data.total || 0 );
	    }
	  } catch ( error ) {
	    console.error( 'Error fetching queries:', error );
	  } finally {
	    setIsLoading( false );
	  }
	};

	const handleOrderChange = ( order: string ) => {
	  setQueryOptions( ( prev ) => ( {
	    ...prev,
	    order: order as 'time' | 'caller' | 'query',
	  } ) );
	};

	const handleDirectionChange = ( direction: string ) => {
	  setQueryOptions( ( prev ) => ( {
	    ...prev,
	    direction: direction as 'asc' | 'desc',
	  } ) );
	};

	const handleSearch = ( term: string ) => {
	  setSearchTerm( term );

	  // Debounce API search
	  if ( searchTimeout ) {
	    clearTimeout( searchTimeout );
	  }

	  const timeout = setTimeout( () => {
	    setQueryOptions( ( prev ) => ( { ...prev, search: term } ) );
	  }, 500 );

	  setSearchTimeout( timeout );
	};

	const viewQueryDetails = ( query: QueryItem ) => {
	  setSelectedQuery( query );

	  // Scroll to details section
	  setTimeout( () => {
	    const detailsElement = document.getElementById( 'query-details' );
	    if ( detailsElement ) {
	      detailsElement.scrollIntoView( { behavior: 'smooth' } );
	    }
	  }, 100 );
	};

	const closeDetails = () => {
	  setSelectedQuery( null );
	};

	const formatTime = ( time: number ): string => {
	  return `${ ( time * 1000 ).toFixed( 2 ) } ms`;
	};

	const getTimeClass = ( time: number ): string => {
	  if ( time > 0.1 ) {
	    return 'wdt:bg-red-100 wdt:text-red-800 wdt:border-red-200';
	  } else if ( time > 0.05 ) {
	    return 'wdt:bg-yellow-100 wdt:text-yellow-800 wdt:border-yellow-200';
	  }
	  return 'wdt:bg-green-100 wdt:text-green-800 wdt:border-green-200';
	};

	const toggleQueryMonitoring = () => {
	  toggleTool( 'query_monitoring' );
	};

	const getOptimizationTips = () => {
	  if ( stats.slow === 0 ) {
	    return null;
	  }

	  return (
			<div className='wdt:p-6 wdt:bg-gradient-to-r wdt:from-amber-50 wdt:to-orange-50 wdt:dark:from-amber-950/20 wdt:dark:to-orange-950/20 wdt:border wdt:border-amber-200/50 wdt:dark:border-amber-800/30 wdt:rounded-xl wdt:shadow-sm'>
			<div className='wdt:flex wdt:items-start wdt:gap-4'>
					<div className='wdt:p-2 wdt:bg-amber-100 wdt:dark:bg-amber-900/30 wdt:rounded-lg'>
					<AlertTriangle className='wdt:w-5 wdt:h-5 wdt:text-amber-600 wdt:dark:text-amber-400' />
				</div>
					<div className='wdt:flex-1'>
					<h3 className='wdt:text-lg wdt:font-semibold wdt:text-amber-900 wdt:dark:text-amber-100 wdt:mb-3'>
							Query Optimization Suggestions
						</h3>
					<div className='wdt:space-y-3'>
							<div className='wdt:flex wdt:items-start wdt:gap-3'>
							<div className='wdt:w-2 wdt:h-2 wdt:bg-amber-500 wdt:rounded-full wdt:mt-2 wdt:flex-shrink-0'></div>
							<p className='wdt:text-sm wdt:text-amber-800 wdt:dark:text-amber-200'>
									You have <span className='wdt:font-medium'>{ stats.slow }</span>{ ' ' }
									slow { stats.slow === 1 ? 'query' : 'queries' } (&gt; 100ms)
									that may need optimization.
								</p>
						</div>
							{ stats.slow > 3 && (
						<div className='wdt:flex wdt:items-start wdt:gap-3'>
									<div className='wdt:w-2 wdt:h-2 wdt:bg-amber-500 wdt:rounded-full wdt:mt-2 wdt:flex-shrink-0'></div>
									<p className='wdt:text-sm wdt:text-amber-800 wdt:dark:text-amber-200'>
								Consider adding proper indexes to tables frequently queried.
									</p>
								</div>
	            ) }
							<div className='wdt:flex wdt:items-start wdt:gap-3'>
							<div className='wdt:w-2 wdt:h-2 wdt:bg-amber-500 wdt:rounded-full wdt:mt-2 wdt:flex-shrink-0'></div>
							<p className='wdt:text-sm wdt:text-amber-800 wdt:dark:text-amber-200'>
									Check for queries inside loops that could be consolidated.
								</p>
						</div>
							<div className='wdt:flex wdt:items-start wdt:gap-3'>
							<div className='wdt:w-2 wdt:h-2 wdt:bg-amber-500 wdt:rounded-full wdt:mt-2 wdt:flex-shrink-0'></div>
							<p className='wdt:text-sm wdt:text-amber-800 wdt:dark:text-amber-200'>
									Use{ ' ' }
									<code className='wdt:px-2 wdt:py-1 wdt:bg-amber-100 wdt:dark:bg-amber-900/50 wdt:rounded wdt:text-amber-800 wdt:dark:text-amber-200 wdt:text-xs wdt:font-mono'>
									get_posts()
									</code>{ ' ' }
									instead of{ ' ' }
									<code className='wdt:px-2 wdt:py-1 wdt:bg-amber-100 wdt:dark:bg-amber-900/50 wdt:rounded wdt:text-amber-800 wdt:dark:text-amber-200 wdt:text-xs wdt:font-mono'>
									WP_Query
									</code>{ ' ' }
									when you don't need pagination.
								</p>
						</div>
							<div className='wdt:flex wdt:items-start wdt:gap-3'>
							<div className='wdt:w-2 wdt:h-2 wdt:bg-amber-500 wdt:rounded-full wdt:mt-2 wdt:flex-shrink-0'></div>
							<p className='wdt:text-sm wdt:text-amber-800 wdt:dark:text-amber-200'>
									Use{ ' ' }
									<code className='wdt:px-2 wdt:py-1 wdt:bg-amber-100 wdt:dark:bg-amber-900/50 wdt:rounded wdt:text-amber-800 wdt:dark:text-amber-200 wdt:text-xs wdt:font-mono'>
									$wpdb-&gt;prepare()
									</code>{ ' ' }
									for all SQL queries with variables.
								</p>
						</div>
						</div>
				</div>
				</div>
		</div>
	  );
	};

	return (
		<div className='wdt:min-h-screen wdt:bg-gradient-to-br wdt:from-background wdt:via-background wdt:to-muted/20 wdt:p-6 lg:wdt:p-8'>
			<div className='wdt:max-w-7xl wdt:mx-auto wdt:space-y-8'>
				{ /* Header */ }
				<div className='wdt:space-y-4 wdt:text-center md:wdt:text-left'>
					<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-4'>
						<div className='wdt:relative'>
							<div className='wdt:p-4 wdt:bg-gradient-to-br wdt:from-blue-50 wdt:to-blue-100/50 wdt:dark:from-blue-950/20 wdt:dark:to-blue-900/10 wdt:rounded-2xl wdt:border wdt:border-blue-200/50 wdt:dark:border-blue-800/30'>
								<Database className='wdt:w-8 wdt:h-8 wdt:text-blue-600 wdt:dark:text-blue-400' />
							</div>
							<div className='wdt:absolute wdt:-top-1 wdt:-right-1 wdt:w-3 wdt:h-3 wdt:bg-blue-500 wdt:rounded-full wdt:animate-pulse'></div>
						</div>
						<div>
							<h1 className='wdt:text-4xl wdt:font-bold wdt:bg-gradient-to-r wdt:from-foreground wdt:to-foreground/70 wdt:bg-clip-text wdt:text-transparent'>
								Query Monitor
							</h1>
							<p className='wdt:text-lg wdt:text-muted-foreground wdt:mt-1'>
								Database Performance Analysis
							</p>
						</div>
					</div>
					<p className='wdt:text-lg wdt:text-muted-foreground wdt:max-w-3xl wdt:mx-auto md:wdt:mx-0 wdt:leading-relaxed'>
						Track and analyze database queries with detailed performance metrics
						and optimization insights
					</p>
					<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-2 wdt:mt-4'>
						<AlertTriangle className='wdt:w-4 wdt:h-4 wdt:text-amber-500' />
						<span className='wdt:text-sm wdt:text-amber-600 wdt:dark:text-amber-400'>
							Monitor query performance and identify bottlenecks
						</span>
					</div>
				</div>

				{ /* Quick Actions */ }
				<div className='wdt:bg-card/50 wdt:backdrop-blur-sm wdt:rounded-xl wdt:shadow-lg wdt:border wdt:border-border/50 wdt:p-6'>
					<div className='wdt:flex wdt:flex-wrap wdt:items-center wdt:justify-between wdt:gap-4'>
						<div className='wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-3'>
							<Button
								onClick={ fetchQueries }
								disabled={ isLoading }
								className='wdt:shadow-md wdt:hover:shadow-lg wdt:transition-all wdt:duration-200'
	            >
								{ isLoading ? (
									<div className='wdt:flex wdt:items-center wdt:gap-2'>
										<div className='wdt:animate-spin wdt:rounded-full wdt:h-4 wdt:w-4 wdt:border-b-2 wdt:border-primary-foreground'></div>
										Refreshing...
									</div>
	              ) : (
	                'Refresh Queries'
	              ) }
							</Button>

							<Button
								variant={ config.query_monitoring ? 'secondary' : 'default' }
								onClick={ toggleQueryMonitoring }
								className='wdt:shadow-sm wdt:hover:shadow-md wdt:transition-all wdt:duration-200'
	            >
								{ config.query_monitoring
	                ? 'Disable Query Monitor'
	                : 'Enable Query Monitor' }
							</Button>
						</div>

						<div className='wdt:flex wdt:items-center wdt:gap-3'>
							<label className='wdt:flex wdt:items-center wdt:gap-2 wdt:cursor-pointer'>
								<input
									type='checkbox'
									checked={ showOptimizationTips }
									onChange={ () =>
	                  setShowOptimizationTips( ! showOptimizationTips )
	                }
									className='wdt:rounded wdt:border-border wdt:text-primary wdt:focus:ring-primary/20'
	              />
								<span className='wdt:text-sm wdt:font-medium'>
									Show optimization tips
								</span>
							</label>
						</div>
					</div>
				</div>

				<QueryStatsCards
					totalQueries={ totalQueries }
					totalTime={ totalTime }
					stats={ stats }
					formatTime={ formatTime }
	      />

				{ showOptimizationTips && getOptimizationTips() }

				<QueryFilters
					searchTerm={ searchTerm }
					onSearch={ handleSearch }
					queryOptions={ queryOptions }
					onOrderChange={ handleOrderChange }
					onDirectionChange={ handleDirectionChange }
					filteredQueriesCount={ filteredQueries.length }
	      />

				{ isLoading && <LoadingState /> }

				{ ! isLoading && selectedQuery && (
					<QueryDetails
						selectedQuery={ selectedQuery }
						onClose={ closeDetails }
						formatTime={ formatTime }
						getTimeClass={ getTimeClass }
	        />
	      ) }

				{ ! isLoading && (
					<QueryTable
						queries={ filteredQueries }
						onViewDetails={ viewQueryDetails }
						formatTime={ formatTime }
						getTimeClass={ getTimeClass }
	        />
	      ) }
			</div>
		</div>
	);
};

export default QueryMonitor;
