import { Filter, Search, X } from 'lucide-react';
import React from 'react';

import { Input } from '@/components/ui/input';

interface QueryFiltersProps {
	searchTerm: string;
	onSearch: ( term: string ) => void;
	queryOptions: {
	  order: 'time' | 'caller' | 'query';
	  direction: 'asc' | 'desc';
	};
	onOrderChange: ( order: string ) => void;
	onDirectionChange: ( direction: string ) => void;
	filteredQueriesCount: number;
}

const QueryFilters: React.FC<QueryFiltersProps> = ( {
	searchTerm,
	onSearch,
	queryOptions,
	onOrderChange,
	onDirectionChange,
	filteredQueriesCount,
} ) => (
	<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm wdt:mb-6'>
		<div className='wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6'>
			<div className='wdt:flex wdt:items-center'>
				<Filter />
				<h2 className='wdt:text-lg wdt:font-semibold'>Query Filters</h2>
			</div>
		</div>
		<div className='wdt:px-6'>
			<div className='wdt:grid wdt:grid-cols-1 md:wdt:grid-cols-3 wdt:gap-6'>
				<div>
					<label className='wdt:block'>
						<span className='wdt:text-sm wdt:font-medium wdt:text-muted-foreground'>
							Search Queries
						</span>
						<Input
							value={ searchTerm }
							onChange={ ( e ) => onSearch( e.target.value ) }
							placeholder='Search in query or caller...'
							className='wdt:mt-1'
						/>
					</label>
				</div>
				<div>
					<label className='wdt:block'>
						<span className='wdt:text-sm wdt:font-medium wdt:text-muted-foreground'>
							Sort By
						</span>
						<select
							value={ queryOptions.order }
							onChange={ ( e ) => onOrderChange( e.target.value ) }
							className='wdt:mt-1 wdt:block wdt:w-full wdt:px-3 wdt:py-2 wdt:border wdt:border-input wdt:rounded-md wdt:bg-background wdt:text-foreground wdt:shadow-sm wdt:focus:outline-none wdt:focus:ring-2 wdt:focus:ring-ring wdt:focus:border-ring'
						>
							<option value='time'>Execution Time</option>
							<option value='caller'>Caller</option>
							<option value='query'>Query</option>
						</select>
					</label>
				</div>
				<div>
					<label className='wdt:block'>
						<span className='wdt:text-sm wdt:font-medium wdt:text-muted-foreground'>
							Direction
						</span>
						<select
							value={ queryOptions.direction }
							onChange={ ( e ) => onDirectionChange( e.target.value ) }
							className='wdt:mt-1 wdt:block wdt:w-full wdt:px-3 wdt:py-2 wdt:border wdt:border-input wdt:rounded-md wdt:bg-background wdt:text-foreground wdt:shadow-sm wdt:focus:outline-none wdt:focus:ring-2 wdt:focus:ring-ring wdt:focus:border-ring'
						>
							<option value='desc'>Descending</option>
							<option value='asc'>Ascending</option>
						</select>
					</label>
				</div>
			</div>

			{ searchTerm && (
				<div className='wdt:bg-blue-50 wdt:p-3 wdt:rounded-md wdt:border wdt:border-blue-100 wdt:mt-4'>
					<div className='wdt:flex wdt:items-center wdt:gap-2'>
						<Search className='wdt:text-blue-500' />
						<span className='wdt:text-blue-700'>
							Found <strong>{ filteredQueriesCount }</strong> queries matching:{ ' ' }
							<strong>{ searchTerm }</strong>
						</span>
						<button
							onClick={ () => onSearch( '' ) }
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
);

export default QueryFilters;
