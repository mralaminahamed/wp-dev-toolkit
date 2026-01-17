import { Database, Clock, BarChart3 } from 'lucide-react';
import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface QueryStatsCardsProps {
  totalQueries: number;
  totalTime: number;
  stats: {
    slow: number;
    medium: number;
    fast: number;
  };
  formatTime: ( time: number ) => string;
}

const QueryStatsCards: React.FC<QueryStatsCardsProps> = ( {
	totalQueries,
	totalTime,
	stats,
	formatTime,
} ) => (
	<div className="wdt:grid wdt:gap-4 md:wdt:grid-cols-3 wdt:mb-6 wdt:mb-6">
		<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm">
			<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-icon blue">
				<Database />
			</div>
			<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-content">
				<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-title">
					Total Queries
				</div>
				<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-value">
					{ totalQueries }
				</div>
				<div className="wdt:mt-2 wdt:text-sm wdt:text-muted-foreground">
					This page load
				</div>
			</div>
		</div>

		<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm">
			<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-icon amber">
				<Clock />
			</div>
			<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-content">
				<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-title">
					Total Execution Time
				</div>
				<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-value">
					{ formatTime( totalTime ) }
				</div>
				<div className="wdt:mt-2 wdt:flex wdt:gap-2">
					<span className="wdt:inline-flex wdt:items-center wdt:gap-1 wdt:px-2 wdt:py-0.5 wdt:rounded-full wdt:text-xs wdt:font-medium wdt:bg-green-100 wdt:text-green-800">
						Fast{ ' ' }
						<span className="wdt:bg-white wdt:px-1.5 wdt:py-0.5 wdt:rounded-full">
							{ stats.fast }
						</span>
					</span>
					<span className="wdt:inline-flex wdt:items-center wdt:gap-1 wdt:px-2 wdt:py-0.5 wdt:rounded-full wdt:text-xs wdt:font-medium wdt:bg-yellow-100 wdt:text-yellow-800">
						Medium{ ' ' }
						<span className="wdt:bg-white wdt:px-1.5 wdt:py-0.5 wdt:rounded-full">
							{ stats.medium }
						</span>
					</span>
					<span className="wdt:inline-flex wdt:items-center wdt:gap-1 wdt:px-2 wdt:py-0.5 wdt:rounded-full wdt:text-xs wdt:font-medium wdt:bg-red-100 wdt:text-red-800">
						Slow{ ' ' }
						<span className="wdt:bg-white wdt:px-1.5 wdt:py-0.5 wdt:rounded-full">
							{ stats.slow }
						</span>
					</span>
				</div>
			</div>
		</div>

		<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border-border wdt:border wdt:py-6 wdt:shadow-sm">
			<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-icon green">
				<BarChart3 />
			</div>
			<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-content">
				<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-title">
					Average Query Time
				</div>
				<div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:p-6 wdt:shadow-sm-value">
					{ totalQueries > 0 ? formatTime( totalTime / totalQueries ) : '0 ms' }
				</div>
				<div className="wdt:mt-2 wdt:text-sm wdt:text-muted-foreground">
					{ totalQueries > 30
						? 'High query count - consider caching'
						: 'Query count is acceptable' }
				</div>
			</div>
		</div>
	</div>
);

export default QueryStatsCards;
