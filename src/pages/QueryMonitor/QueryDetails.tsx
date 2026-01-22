import { Database } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface QueryDetailsProps {
	selectedQuery: {
	  time: number;
	  caller: string;
	  backtrace?: string[];
	};
	onClose: () => void;
	formatTime: ( time: number ) => string;
	getTimeClass: ( time: number ) => string;
}

const QueryDetails: React.FC<QueryDetailsProps> = ( {
	selectedQuery,
	onClose,
	formatTime,
	getTimeClass,
} ) => (
	<div
		id='query-details'
		className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm wdt:mb-6'
	>
		<div className='wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6'>
			<div className='wdt:flex wdt:justify-between wdt:items-center'>
				<div className='wdt:flex wdt:items-center wdt:gap-2'>
					<Database />
					<h2>Query Details</h2>
				</div>
				<Button variant='secondary' onClick={ onClose }>
					Close Details
				</Button>
			</div>
		</div>
		<div className='wdt:px-6'>
			<div className='wdt:grid wdt:grid-cols-1 md:wdt:grid-cols-2 wdt:gap-6 wdt:mb-6'>
				<div>
					<h3 className='wdt:font-medium wdt:mb-2'>Execution Time</h3>
					<div
						className={ `wdt:p-3 wdt:rounded-lg wdt:border wdt:font-medium ${ getTimeClass( selectedQuery.time ) }` }
					>
						{ formatTime( selectedQuery.time ) }
					</div>
				</div>
				<div>
					<h3 className='wdt:font-medium wdt:mb-2'>Caller</h3>
					<div className='wdt:bg-gray-50 wdt:p-3 wdt:rounded-lg wdt:border wdt:border-gray-200 wdt:font-mono wdt:text-sm wdt:overflow-x-auto'>
						{ selectedQuery.caller }
					</div>
				</div>
			</div>
			{ selectedQuery.backtrace && (
				<div>
					<h3 className='wdt:font-medium wdt:mb-2'>Backtrace</h3>
					<div className='wdt:bg-gray-50 wdt:p-3 wdt:rounded-lg wdt:border wdt:border-gray-200 wdt:font-mono wdt:text-sm wdt:overflow-x-auto'>
						<pre>{ selectedQuery.backtrace.join( '\n' ) }</pre>
					</div>
				</div>
			) }
		</div>
	</div>
);

export default QueryDetails;
