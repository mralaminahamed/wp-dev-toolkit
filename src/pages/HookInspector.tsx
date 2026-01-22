import {
	ChevronUp,
	ChevronDown,
	Filter,
	Search,
	X,
	Puzzle,
	BarChart3,
	Clock,
	Code,
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { useSelect, useDispatch } from '@wordpress/data';

import { STORE_NAME as HOOK_INSPECTOR_STORE } from '@/stores/hook-inspector/constants';
import { STORE_NAME as SETTINGS_STORE } from '@/stores/settings/constants';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
	HookDetails,
	HookInspectorOptions,
	HookResponse,
	HookCallback,
} from '@/types';

const HookInspector: React.FC = () => {
	const { hooks, isResolving } = useSelect(
	  ( select: any ) => ( {
	    hooks: select( HOOK_INSPECTOR_STORE ).getHooks(),
	    isResolving: ( key: string ) =>
	      select( HOOK_INSPECTOR_STORE ).isResolving( key ),
	  } ),
	  [],
	);

	const { config } = useSelect(
	  ( select: any ) => ( {
	    config: select( SETTINGS_STORE ).getConfig(),
	  } ),
	  [],
	);

	const { fetchHooks } = useDispatch( HOOK_INSPECTOR_STORE );
	const { toggleTool } = useDispatch( SETTINGS_STORE );

	const isLoading = isResolving( 'fetch-hooks' );
	const [ hookData, setHookData ] = useState<HookResponse | null>( null );
	const [ selectedHook, setSelectedHook ] = useState<HookDetails | null>( null );
	const [ showStackTrace, setShowStackTrace ] = useState( false );
	const [ searchTimeout, setSearchTimeout ] = useState<NodeJS.Timeout | null>(
	  null,
	);
	const [ filterOptions, setFilterOptions ] = useState<HookInspectorOptions>( {
	  type: 'all',
	  search: '',
	} );
	const [ sortConfig, setSortConfig ] = useState<{
	  key: string;
	  direction: 'ascending' | 'descending';
	}>( {
	  key: 'name',
	  direction: 'ascending',
	} );
	const [ actionCount, setActionCount ] = useState( 0 );
	const [ filterCount, setFilterCount ] = useState( 0 );
	const [ isFetching, setIsFetching ] = useState( false );

	useEffect( () => {
	  fetchHookData();
	}, [ fetchHookData ] );

	useEffect( () => {
	  if ( hookData && hookData.grouped_hooks ) {
	    const actionHooks = hookData.grouped_hooks.action || [];
	    const filterHooks = hookData.grouped_hooks.filter || [];
	    setActionCount( actionHooks.length );
	    setFilterCount( filterHooks.length );
	  }
	}, [ hookData ] );

	// Cleanup search timeout on unmount
	useEffect( () => {
	  return () => {
	    if ( searchTimeout ) {
	      clearTimeout( searchTimeout );
	    }
	  };
	}, [ searchTimeout ] );

	const fetchHookData = useCallback( async () => {
	  setIsFetching( true );
	  try {
	    await fetchHooks( filterOptions );
	    // The store will update hooks automatically
	    // For backward compatibility, we'll keep local state
	    const hookList = hooks || [];
	    if ( hookList.length > 0 ) {
	      // Create a mock response structure for compatibility
	      const response: HookResponse = {
	        hooks: hookList,
	        total: hookList.length,
	        filtered: hookList.length,
	      };
	      setHookData( response );
	    }
	  } catch ( error ) {
	    console.error( 'Error fetching hooks:', error );
	  } finally {
	    setIsFetching( false );
	  }
	}, [ filterOptions, fetchHooks, hooks ] );

	const handleSearch = ( search: string ) => {
	  // Debounce search to avoid too many API calls
	  if ( searchTimeout ) {
	    clearTimeout( searchTimeout );
	  }

	  const timeout = setTimeout( () => {
	    setFilterOptions( ( prev ) => ( { ...prev, search } ) );
	  }, 500 );

	  setSearchTimeout( timeout );
	};

	const handleTypeChange = ( type: string ) => {
	  setFilterOptions( ( prev ) => ( {
	    ...prev,
	    type: type as 'all' | 'action' | 'filter',
	  } ) );
	};

	const viewHookDetails = ( hook: HookDetails ) => {
	  setSelectedHook( hook );

	  // Scroll to the details section
	  setTimeout( () => {
	    const detailsElement = document.getElementById( 'hook-details' );
	    if ( detailsElement ) {
	      detailsElement.scrollIntoView( { behavior: 'smooth' } );
	    }
	  }, 100 );
	};

	const closeDetails = () => {
	  setSelectedHook( null );
	};

	const handleSort = ( key: string ) => {
	  let direction: 'ascending' | 'descending' = 'ascending';

	  if ( sortConfig.key === key && sortConfig.direction === 'ascending' ) {
	    direction = 'descending';
	  }

	  setSortConfig( { key, direction } );
	};

	const sortedHooks = useMemo( () => {
	  if ( ! hookData?.hooks ) {
	    return [];
	  }

	  const hooks = [ ...hookData.hooks ];
	  const { key, direction } = sortConfig;

	  return hooks.sort( ( a, b ) => {
	    const aValue = a[ key as keyof typeof a ];
	    const bValue = b[ key as keyof typeof b ];

	    if ( ! aValue && ! bValue ) {
	      return 0;
	    }
	    if ( ! aValue ) {
	      return direction === 'ascending' ? -1 : 1;
	    }
	    if ( ! bValue ) {
	      return direction === 'ascending' ? 1 : -1;
	    }

	    if ( aValue < bValue ) {
	      return direction === 'ascending' ? -1 : 1;
	    }
	    if ( aValue > bValue ) {
	      return direction === 'ascending' ? 1 : -1;
	    }
	    return 0;
	  } );
	}, [ hookData, sortConfig ] );

	const sortIndicator = ( key: string ) => {
	  if ( sortConfig.key !== key ) {
	    return null;
	  }
	  return sortConfig.direction === 'ascending' ? (
			<ChevronUp size={ 14 } />
	  ) : (
			<ChevronDown size={ 14 } />
	  );
	};

	const getHookTypeClass = ( type: string ) => {
	  return type === 'action'
	    ? 'wdt:bg-green-100 wdt:text-green-800 wdt:border-green-200'
	    : 'wdt:bg-blue-100 wdt:text-blue-800 wdt:border-blue-200';
	};

	const getHookTypeBadge = ( type: string, count: number ) => {
	  return (
			<span
			className={ `wdt:inline-flex wdt:items-center wdt:gap-1 wdt:px-2.5 wdt:py-0.5 wdt:rounded-full wdt:text-xs wdt:font-medium ${
	        type === 'action'
	          ? 'wdt:bg-green-100 wdt:text-green-800'
	          : 'wdt:bg-blue-100 wdt:text-blue-800'
	      }` }
	    >
			{ type }{ ' ' }
			<span className='wdt:bg-white wdt:px-1.5 wdt:py-0.5 wdt:rounded-full'>
					{ count }
				</span>
		</span>
	  );
	};

	const formatFunctionName = ( func: string ) => {
	  // Handle closures and anonymous functions
	  if ( func.includes( 'Closure' ) ) {
	    return <span className='wdt:text-amber-600'>Closure function</span>;
	  } else if ( func.includes( 'class@anonymous' ) ) {
	    return <span className='wdt:text-amber-600'>Anonymous class</span>;
	  }

	  // Format class methods
	  if ( func.includes( '::' ) ) {
	    const [ className, methodName ] = func.split( '::' );
	    return (
				<span>
			<span className='wdt:text-blue-600'>{ className }</span>
			<span className='wdt:text-gray-500'>::</span>
			<span className='wdt:text-purple-600'>{ methodName }</span>
		</span>
	    );
	  }

	  return <span className='wdt:text-gray-900'>{ func }</span>;
	};

	const formatFilePath = ( file: string ) => {
	  if ( ! file ) {
	    return null;
	  }

	  // Get the relative path from the WordPress root
	  const wpContentPos = file.indexOf( 'wp-content' );
	  if ( wpContentPos !== -1 ) {
	    return file.substring( wpContentPos );
	  }

	  return file;
	};

	const toggleHookInspection = () => {
	  toggleTool( 'hook_inspection' );
	};

	const formatTime = ( time?: number ) => {
	  if ( time === undefined ) {
	    return '0.00';
	  }
	  return time.toFixed( 2 );
	};

	return (
		<div className='wdt:min-h-screen wdt:bg-gradient-to-br wdt:from-background wdt:via-background wdt:to-muted/20 wdt:p-6 lg:wdt:p-8'>
			<div className='wdt:max-w-6xl wdt:mx-auto wdt:space-y-8'>
				<div className='wdt:space-y-4 wdt:text-center md:wdt:text-left'>
					<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-4'>
						<div className='wdt:relative'>
							<div className='wdt:p-4 wdt:bg-gradient-to-br wdt:from-orange-50 wdt:to-orange-100/50 wdt:dark:from-orange-950/20 wdt:dark:to-orange-900/10 wdt:rounded-2xl wdt:border wdt:border-orange-200/50 wdt:dark:border-orange-800/30'>
								<Puzzle className='wdt:w-8 wdt:h-8 wdt:text-orange-600 wdt:dark:text-orange-400' />
							</div>
							<div className='wdt:absolute wdt:-top-1 wdt:-right-1 wdt:w-3 wdt:h-3 wdt:bg-orange-500 wdt:rounded-full wdt:animate-pulse'></div>
						</div>
						<div>
							<h1 className='wdt:text-4xl wdt:font-bold wdt:bg-gradient-to-r wdt:from-foreground wdt:to-foreground/70 wdt:bg-clip-text wdt:text-transparent'>
								Hook Inspector
							</h1>
							<p className='wdt:text-lg wdt:text-muted-foreground wdt:mt-1'>
								Actions & Filters Analysis
							</p>
						</div>
					</div>
					<p className='wdt:text-lg wdt:text-muted-foreground wdt:max-w-3xl wdt:mx-auto md:wdt:mx-0 wdt:leading-relaxed'>
						Monitor and analyze WordPress hooks, actions, and filters with
						detailed callback information
					</p>
					<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-2 wdt:mt-4'>
						<BarChart3 className='wdt:w-4 wdt:h-4 wdt:text-orange-500' />
						<span className='wdt:text-sm wdt:text-orange-600 wdt:dark:text-orange-400'>
							Real-time hook monitoring and performance insights
						</span>
					</div>
				</div>

				{ /* Quick Actions */ }
				<div className='wdt:bg-white wdt:rounded-lg wdt:shadow-sm wdt:p-4 wdt:mb-6'>
					<div className='wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-4'>
						<Button onClick={ fetchHookData } disabled={ isFetching }>
							{ isFetching ? 'Refreshing...' : 'Refresh Hooks' }
						</Button>

						<Button
							variant={ config.hook_inspection ? 'secondary' : 'default' }
							onClick={ toggleHookInspection }
	          >
							{ config.hook_inspection
	              ? 'Disable Hook Inspection'
	              : 'Enable Hook Inspection' }
						</Button>

						<div className='wdt:ml-auto wdt:flex wdt:items-center wdt:gap-2'>
							<label className='wdt:flex wdt:items-center wdt:gap-2 wdt:cursor-pointer'>
								<input
									type='checkbox'
									checked={ showStackTrace }
									onChange={ () => setShowStackTrace( ! showStackTrace ) }
									className='wdt:rounded wdt:border-gray-300 wdt:text-blue-600 wdt:focus:ring-blue-500'
	              />
								<span className='wdt:text-sm wdt:font-medium'>
									Show Stack Traces
								</span>
							</label>
						</div>
					</div>
				</div>

				{ /* Filter Controls */ }
				<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm wdt:mb-6'>
					<div className='wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6'>
						<div className='wdt:flex wdt:items-center wdt:gap-2'>
							<Filter />
							<h2>Filter Hooks</h2>
						</div>
					</div>
					<div className='wdt:px-6'>
						<div className='wdt:grid wdt:grid-cols-1 md:wdt:grid-cols-2 wdt:gap-6 wdt:mb-4'>
							<div>
								<label className='wdt:block'>
									<span className='wdt:text-sm wdt:font-medium wdt:text-gray-700'>
										Search Hooks
									</span>
									<Input
										value={ filterOptions.search }
										onChange={ ( e ) => handleSearch( e.target.value ) }
										placeholder='Enter hook name...'
										className='wdt:mt-1'
	                />
								</label>
							</div>
							<div>
								<label className='wdt:block'>
									<span className='wdt:text-sm wdt:font-medium wdt:text-gray-700'>
										Hook Type
									</span>
									<select
										value={ filterOptions.type }
										onChange={ ( e ) => handleTypeChange( e.target.value ) }
										className='wdt:mt-1 wdt:block wdt:w-full wdt:px-3 wdt:py-2 wdt:border wdt:border-gray-300 wdt:rounded-md wdt:shadow-sm wdt:focus:outline-none wdt:focus:ring-blue-500 wdt:focus:border-blue-500'
	                >
										<option value='all'>All</option>
										<option value='action'>Actions</option>
										<option value='filter'>Filters</option>
									</select>
								</label>
							</div>
						</div>

						{ filterOptions.search && (
							<div className='wdt:bg-blue-50 wdt:p-3 wdt:rounded-md wdt:border wdt:border-blue-100 wdt:mb-4'>
								<div className='wdt:flex wdt:items-center wdt:gap-2'>
									<Search className='wdt:text-blue-500' />
									<span className='wdt:text-blue-700'>
										Searching for: <strong>{ filterOptions.search }</strong>
									</span>
									<button
										onClick={ () =>
	                    setFilterOptions( ( prev ) => ( { ...prev, search: '' } ) )
	                  }
										className='wdt:ml-auto wdt:text-blue-700 hover:wdt:text-blue-900'
										aria-label='Clear search'
	                >
										<X />
									</button>
								</div>
							</div>
	          ) }
					</div>
				</div>

				{ /* Statistics Summary */ }
				{ hookData?.summary && (
					<div className='wdt:grid wdt:gap-4 md:wdt:grid-cols-3 wdt:mb-6 wdt:mb-6'>
						<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm'>
							<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-icon blue'>
								<Puzzle />
							</div>
							<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-content'>
								<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-title'>
									Total Hooks
								</div>
								<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-value'>
									{ hookData.summary.total_hooks }
								</div>
								<div className='wdt:mt-2 wdt:flex wdt:gap-2'>
									{ getHookTypeBadge( 'action', actionCount ) }
									{ getHookTypeBadge( 'filter', filterCount ) }
								</div>
							</div>
						</div>
						<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm'>
							<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-icon green'>
								<BarChart3 />
							</div>
							<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-content'>
								<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-title'>
									Total Executions
								</div>
								<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-value'>
									{ hookData.summary.total_executions }
								</div>
								<div className='wdt:mt-2 wdt:text-sm wdt:text-gray-500'>
									Average:{ ' ' }
									{ (
	                  hookData.summary.total_executions /
	                  hookData.summary.total_hooks
	                ).toFixed( 2 ) }{ ' ' }
									per hook
								</div>
							</div>
						</div>
						<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm'>
							<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-icon amber'>
								<Clock />
							</div>
							<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-content'>
								<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-title'>
									Total Time (ms)
								</div>
								<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-value'>
									{ hookData.summary.total_time.toFixed( 2 ) }
								</div>
								<div className='wdt:mt-2 wdt:text-sm wdt:text-gray-500'>
									Average:{ ' ' }
									{ (
	                  hookData.summary.total_time / hookData.summary.total_hooks
	                ).toFixed( 4 ) }{ ' ' }
									ms per hook
								</div>
							</div>
						</div>
					</div>
	      ) }

				{ isFetching ? (
					<div className='wdt:flex wdt:justify-center wdt:items-center wdt:p-16 wdt:bg-white wdt:rounded-lg wdt:shadow-sm'>
						<div className='wdt:animate-spin wdt:rounded-full wdt:h-8 wdt:w-8 wdt:border-b-2 wdt:border-primary'></div>
						<span className='wdt:ml-2'>Loading hooks...</span>
					</div>
	      ) : (
					<>
			{ /* Hook Details View */ }
			{ selectedHook && (
							<div
				id='hook-details'
				className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm wdt:mb-6'
	            >
				<div className='wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6'>
									<div className='wdt:flex wdt:justify-between wdt:items-center'>
						<div className='wdt:flex wdt:items-center'>
											<h2>{ selectedHook.name }</h2>
											<span
								className={ `wdt:ml-2 wdt:px-3 wdt:py-1 wdt:text-xs wdt:rounded-full wdt:font-medium ${ getHookTypeClass( selectedHook.type ) }` }
	                    >
								{ selectedHook.type }
							</span>
										</div>
						<Button variant='secondary' onClick={ closeDetails }>
											Close Details
										</Button>
					</div>
								</div>
				<div className='wdt:px-6'>
									<div className='wdt:grid wdt:grid-cols-1 md:wdt:grid-cols-3 wdt:gap-4 wdt:mb-6'>
						<div className='wdt:bg-gray-50 wdt:p-4 wdt:rounded-lg wdt:border wdt:border-gray-200'>
											<div className='wdt:text-sm wdt:text-gray-500 wdt:mb-1'>
								Callback Count
											</div>
											<div className='wdt:text-2xl wdt:font-bold'>
								{ selectedHook.callbacks.length }
							</div>
										</div>

						<div className='wdt:bg-gray-50 wdt:p-4 wdt:rounded-lg wdt:border wdt:border-gray-200'>
											<div className='wdt:text-sm wdt:text-gray-500 wdt:mb-1'>
								Type
											</div>
											<div className='wdt:text-2xl wdt:font-bold wdt:capitalize'>
								{ selectedHook.type }
							</div>
										</div>

						<div className='wdt:bg-gray-50 wdt:p-4 wdt:rounded-lg wdt:border wdt:border-gray-200'>
											<div className='wdt:text-sm wdt:text-gray-500 wdt:mb-1'>
								Hook Name
											</div>
											<div className='wdt:text-xl wdt:font-bold wdt:font-mono wdt:truncate'>
								{ selectedHook.name }
							</div>
										</div>
					</div>

									<h3 className='wdt:font-medium wdt:text-lg wdt:mb-3'>
						Callbacks ({ selectedHook.callbacks.length })
					</h3>
									<div className='wdt:overflow-x-auto'>
						<table className='wdt:w-full wdt:border wdt:border-gray-200 wdt:rounded-lg wdt:overflow-hidden'>
											<thead className='wdt:bg-gray-50 wdt:border-b wdt:border-gray-200'>
								<tr>
													<th className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-gray-500 wdt:uppercase wdt:tracking-wider'>
														Priority
													</th>
													<th className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-gray-500 wdt:uppercase wdt:tracking-wider'>
														Function
													</th>
													<th className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-gray-500 wdt:uppercase wdt:tracking-wider'>
														Location
													</th>
													<th className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-gray-500 wdt:uppercase wdt:tracking-wider'>
														Args
													</th>
												</tr>
							</thead>
											<tbody className='wdt:bg-white wdt:divide-y wdt:divide-gray-200'>
								{ selectedHook.callbacks.map(
	                        ( callback: HookCallback, index: number ) => (
														<tr key={ index } className='hover:wdt:bg-gray-50'>
			<td className='wdt:py-3 wdt:px-4 wdt:font-medium'>
																{ callback.priority }
															</td>
			<td className='wdt:py-3 wdt:px-4 wdt:font-mono wdt:text-sm'>
																{ formatFunctionName( callback.function ) }
															</td>
			<td className='wdt:py-3 wdt:px-4 wdt:text-xs wdt:truncate wdt:max-w-[200px]'>
																<div className='wdt:flex wdt:items-center wdt:gap-1'>
					<Code
																		size={ 14 }
																		className='wdt:text-gray-400'
	                                />
					<span title={ callback.file }>
																		{ formatFilePath( callback.file ) }
																	</span>
					<span className='wdt:text-gray-400'>:</span>
					<span className='wdt:text-gray-700'>
																		{ callback.line }
																	</span>
				</div>
															</td>
			<td className='wdt:py-3 wdt:px-4'>
																{ callback.accepted_args }
															</td>
		</tr>
	                        ),
	                      ) }
							</tbody>
										</table>
					</div>
								</div>
			</div>
	          ) }

			{ /* Hooks List */ }
			<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:py-6 wdt:shadow-sm'>
							<div className='wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6'>
					<div className='wdt:flex wdt:justify-between wdt:items-center'>
									<div className='wdt:flex wdt:items-center wdt:gap-2'>
							<Code />
							<h2>Hooks</h2>
						</div>
									<div className='wdt:text-sm wdt:text-gray-500'>
							{ sortedHooks.length } hooks found
						</div>
								</div>
				</div>
							<div className='wdt:px-6 wdt:p-0'>
					<div className='wdt:overflow-x-auto'>
									<table className='wdt:w-full'>
							<thead className='wdt:bg-gray-50 wdt:border-b wdt:border-gray-200'>
											<tr>
									<th
													className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-gray-500 wdt:uppercase wdt:tracking-wider wdt:cursor-pointer hover:wdt:bg-gray-100 wdt:transition-colors'
													onClick={ () => handleSort( 'name' ) }
	                      >
													<div className='wdt:flex wdt:items-center'>
														<span>Hook Name</span>
														<span className='wdt:ml-1'>
															{ sortIndicator( 'name' ) }
														</span>
													</div>
												</th>
									<th
													className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-gray-500 wdt:uppercase wdt:tracking-wider wdt:cursor-pointer hover:wdt:bg-gray-100 wdt:transition-colors'
													onClick={ () => handleSort( 'type' ) }
	                      >
													<div className='wdt:flex wdt:items-center'>
														<span>Type</span>
														<span className='wdt:ml-1'>
															{ sortIndicator( 'type' ) }
														</span>
													</div>
												</th>
									<th
													className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-gray-500 wdt:uppercase wdt:tracking-wider wdt:cursor-pointer hover:wdt:bg-gray-100 wdt:transition-colors'
													onClick={ () => handleSort( 'count' ) }
	                      >
													<div className='wdt:flex wdt:items-center'>
														<span>Count</span>
														<span className='wdt:ml-1'>
															{ sortIndicator( 'count' ) }
														</span>
													</div>
												</th>
									<th
													className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-gray-500 wdt:uppercase wdt:tracking-wider wdt:cursor-pointer hover:wdt:bg-gray-100 wdt:transition-colors'
													onClick={ () => handleSort( 'total_time' ) }
	                      >
													<div className='wdt:flex wdt:items-center'>
														<span>Time (ms)</span>
														<span className='wdt:ml-1'>
															{ sortIndicator( 'total_time' ) }
														</span>
													</div>
												</th>
									<th className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-gray-500 wdt:uppercase wdt:tracking-wider'>
													Actions
												</th>
								</tr>
										</thead>
							<tbody className='wdt:bg-white wdt:divide-y wdt:divide-gray-200'>
											{ sortedHooks.length > 0 ? (
	                      sortedHooks.map( ( hook, index ) => (
													<tr
			key={ index }
			className='hover:wdt:bg-gray-50 wdt:transition-colors'
	                        >
			<td className='wdt:py-3 wdt:px-4 wdt:font-medium wdt:font-mono wdt:text-sm'>
															{ hook.name }
														</td>
			<td className='wdt:py-3 wdt:px-4'>
															<span
					className={ `wdt:px-2 wdt:py-1 wdt:text-xs wdt:rounded-full ${ getHookTypeClass( hook.type ) }` }
	                            >
					{ hook.type }
				</span>
														</td>
			<td className='wdt:py-3 wdt:px-4'>{ hook.count }</td>
			<td className='wdt:py-3 wdt:px-4'>
															{ hook.total_time.toFixed( 2 ) }
														</td>
			<td className='wdt:py-3 wdt:px-4'>
															<Button
					variant='secondary'
					onClick={ () => viewHookDetails( hook ) }
					size='sm'
	                            >
					View
															</Button>
														</td>
		</tr>
	                      ) )
	                    ) : (
												<tr>
			<td
														colSpan={ 5 }
														className='wdt:py-8 wdt:px-4 wdt:text-center wdt:text-gray-500'
	                        >
														No hooks found matching your criteria.
													</td>
		</tr>
	                    ) }
										</tbody>
						</table>
								</div>
				</div>
						</div>
		</>
	      ) }
			</div>
		</div>
	);
};

export default HookInspector;
