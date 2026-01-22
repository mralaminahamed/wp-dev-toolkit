import React from 'react';

import { Input } from '@/components/ui/input';

interface LogFiltersProps {
	searchTerm: string;
	onSearchChange: ( term: string ) => void;
	selectedLevel: string | null;
	onLevelChange: ( level: string | null ) => void;
	selectedDate: string | null;
	onDateChange: ( date: string | null ) => void;
	availableDates: string[];
	filteredCount: number;
	config: any;
	toggleLogging: () => void;
}

const LogFilters: React.FC<LogFiltersProps> = ( {
	searchTerm,
	onSearchChange,
	selectedLevel,
	onLevelChange,
	selectedDate,
	onDateChange,
	availableDates,
	filteredCount,
	config,
	toggleLogging,
} ) => (
	<div className='wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-4 wdt:mb-6'>
		<div className='wdt:flex-1 wdt:min-w-[200px]'>
			<label className='wdt:block'>
				<span className='wdt:text-sm wdt:font-medium wdt:text-gray-700'>
					Search logs
				</span>
				<Input
					value={ searchTerm }
					onChange={ ( e ) => onSearchChange( e.target.value ) }
					placeholder='Search for error messages or files...'
					className='wdt:mt-1'
	      />
			</label>
		</div>

		<div className='wdt:flex wdt:flex-col'>
			<label className='wdt:text-xs wdt:font-medium wdt:text-gray-700 wdt:mb-1'>
				Filter by level
			</label>
			<div className='wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-2'>
				<button
					className={ `wdt:px-3 wdt:py-1 wdt:rounded-md wdt:text-xs wdt:font-medium wdt:transition-colors ${ selectedLevel === null ? 'wdt:bg-blue-100 wdt:text-blue-800' : 'wdt:bg-gray-100 wdt:text-gray-700 hover:wdt:bg-gray-200' }` }
					onClick={ () => onLevelChange( null ) }
	      >
					All ({ filteredCount })
				</button>
				<button
					className={ `wdt:px-3 wdt:py-1 wdt:rounded-md wdt:text-xs wdt:font-medium wdt:transition-colors ${ selectedLevel === 'ERROR' ? 'wdt:bg-red-100 wdt:text-red-800' : 'wdt:bg-gray-100 wdt:text-gray-700 hover:wdt:bg-gray-200' }` }
					onClick={ () => onLevelChange( 'ERROR' ) }
	      >
					Errors
				</button>
				<button
					className={ `wdt:px-3 wdt:py-1 wdt:rounded-md wdt:text-xs wdt:font-medium wdt:transition-colors ${ selectedLevel === 'WARNING' ? 'wdt:bg-yellow-100 wdt:text-yellow-800' : 'wdt:bg-gray-100 wdt:text-gray-700 hover:wdt:bg-gray-200' }` }
					onClick={ () => onLevelChange( 'WARNING' ) }
	      >
					Warnings
				</button>
				<button
					className={ `wdt:px-3 wdt:py-1 wdt:rounded-md wdt:text-xs wdt:font-medium wdt:transition-colors ${ selectedLevel === 'INFO' ? 'wdt:bg-blue-100 wdt:text-blue-800' : 'wdt:bg-gray-100 wdt:text-gray-700 hover:wdt:bg-gray-200' }` }
					onClick={ () => onLevelChange( 'INFO' ) }
	      >
					Info
				</button>
			</div>
		</div>

		{ availableDates.length > 0 && (
			<div>
				<label className='wdt:text-xs wdt:font-medium wdt:text-gray-700 wdt:mb-1'>
					Filter by date
				</label>
				<select
					value={ selectedDate || '' }
					onChange={ ( e ) => onDateChange( e.target.value || null ) }
					className='wdt:block wdt:w-full wdt:px-3 wdt:py-2 wdt:border wdt:border-gray-300 wdt:rounded-md wdt:shadow-sm wdt:focus:outline-none wdt:focus:ring-blue-500 wdt:focus:border-blue-500'
	      >
					<option value=''>All dates</option>
					{ availableDates.map( ( date ) => (
						<option key={ date } value={ date }>
							{ date }
						</option>
	        ) ) }
				</select>
			</div>
	  ) }

		<div className='wdt:ml-auto'>
			<button
				className={ `wdt:px-4 wdt:py-2 wdt:rounded-md ${
	        config.error_logging
	          ? 'wdt:bg-secondary wdt:text-secondary-foreground wdt:hover:bg-secondary/80'
	          : 'wdt:bg-primary wdt:text-primary-foreground wdt:hover:bg-primary/90'
	      }` }
				onClick={ toggleLogging }
	    >
				{ config.error_logging ? 'Disable Logging' : 'Enable Logging' }
			</button>
		</div>
	</div>
);

export default LogFilters;
