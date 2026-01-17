import { Database } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface QueryTableProps {
  queries: Array<{
    time: number;
    query: string;
    caller: string;
  }>;
  onViewDetails: ( query: any ) => void;
  formatTime: ( time: number ) => string;
  getTimeClass: ( time: number ) => string;
}

const QueryTable: React.FC<QueryTableProps> = ( {
	queries,
	onViewDetails,
	formatTime,
	getTimeClass,
} ) => (
	<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm">
		<div className="wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6">
			<div className="wdt:flex wdt:justify-between wdt:items-center">
				<div className="wdt:flex wdt:items-center wdt:gap-2">
					<Database />
					<h2>Database Queries</h2>
				</div>
				<div className="wdt:text-sm wdt:text-muted-foreground">
					{ queries.length } queries found
				</div>
			</div>
		</div>
		<div className="wdt:px-6 wdt:p-0">
			<div className="wdt:overflow-x-auto">
				<table className="wdt:w-full">
					<thead className="wdt:bg-muted/50 wdt:border-b wdt:border-border">
						<tr>
							<th className="wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-muted-foreground wdt:uppercase wdt:tracking-wider">
								Time (ms)
							</th>
							<th className="wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-muted-foreground wdt:uppercase wdt:tracking-wider">
								SQL Query
							</th>
							<th className="wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-muted-foreground wdt:uppercase wdt:tracking-wider">
								Caller
							</th>
							<th className="wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-muted-foreground wdt:uppercase wdt:tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="wdt:bg-card wdt:divide-y wdt:divide-border">
						{ queries.length > 0 ? (
							queries.map( ( query, index ) => (
								<tr
									key={ index }
									className="hover:wdt:bg-muted/50 wdt:transition-colors"
								>
									<td className="wdt:py-3 wdt:px-4 wdt:font-mono wdt:text-sm wdt:whitespace-nowrap">
										<span
											className={ `wdt:inline-block wdt:px-2 wdt:py-1 wdt:rounded-full wdt:text-xs ${ getTimeClass( query.time ) }` }
										>
											{ formatTime( query.time ) }
										</span>
									</td>
									<td className="wdt:py-3 wdt:px-4">
										<div className="wdt:max-w-lg wdt:truncate wdt:font-mono wdt:text-xs">
											{ query.query }
										</div>
									</td>
									<td className="wdt:py-3 wdt:px-4">
										<div className="wdt:max-w-md wdt:truncate wdt:text-xs">
											{ query.caller }
										</div>
									</td>
									<td className="wdt:py-3 wdt:px-4">
										<Button
											variant="secondary"
											onClick={ () => onViewDetails( query ) }
											size="sm"
										>
											View
										</Button>
									</td>
								</tr>
							) )
						) : (
							<tr>
								<td
									colSpan={ 4 }
									className="wdt:py-8 wdt:px-4 wdt:text-center wdt:text-muted-foreground"
								>
									No queries found.
								</td>
							</tr>
						) }
					</tbody>
				</table>
			</div>
		</div>
	</div>
);

export default QueryTable;
