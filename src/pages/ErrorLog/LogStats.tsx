import {
	Database,
	AlertTriangle,
	Clock,
	Info,
	FileText,
	TrendingUp,
	TrendingDown,
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LogStatsProps {
	stats: {
	  total: number;
	  errors: number;
	  warnings: number;
	  info: number;
	  debug: number;
	  other: number;
	};
	fileSize: number;
	formatFileSize: ( bytes: number ) => string;
}

const LogStats: React.FC<LogStatsProps> = ( {
	stats,
	fileSize,
	formatFileSize,
} ) => {
	const statCards = [
	  {
	    title: 'Total Logs',
	    value: stats.total,
	    description: 'All log entries',
	    icon: Database,
	    color:
	      'wdt:from-slate-50 wdt:to-slate-100/50 wdt:dark:from-slate-950/20 wdt:dark:to-slate-900/10',
	    iconColor: 'wdt:text-slate-600 wdt:dark:text-slate-400',
	    textColor: 'wdt:text-slate-900 wdt:dark:text-slate-100',
	    trend: stats.total > 0 ? 'neutral' : 'good',
	  },
	  {
	    title: 'Errors',
	    value: stats.errors,
	    description: 'Critical issues',
	    icon: AlertTriangle,
	    color:
	      'wdt:from-red-50 wdt:to-red-100/50 wdt:dark:from-red-950/20 wdt:dark:to-red-900/10',
	    iconColor: 'wdt:text-red-600 wdt:dark:text-red-400',
	    textColor: 'wdt:text-red-900 wdt:dark:text-red-100',
	    trend: stats.errors > 0 ? 'bad' : 'good',
	  },
	  {
	    title: 'Warnings',
	    value: stats.warnings,
	    description: 'Potential issues',
	    icon: Clock,
	    color:
	      'wdt:from-yellow-50 wdt:to-yellow-100/50 wdt:dark:from-yellow-950/20 wdt:dark:to-yellow-900/10',
	    iconColor: 'wdt:text-yellow-600 wdt:dark:text-yellow-400',
	    textColor: 'wdt:text-yellow-900 wdt:dark:text-yellow-100',
	    trend: stats.warnings > 5 ? 'warning' : 'good',
	  },
	  {
	    title: 'Info',
	    value: stats.info,
	    description: 'Informational',
	    icon: Info,
	    color:
	      'wdt:from-blue-50 wdt:to-blue-100/50 wdt:dark:from-blue-950/20 wdt:dark:to-blue-900/10',
	    iconColor: 'wdt:text-blue-600 wdt:dark:text-blue-400',
	    textColor: 'wdt:text-blue-900 wdt:dark:text-blue-100',
	    trend: 'neutral',
	  },
	  {
	    title: 'File Size',
	    value: formatFileSize( fileSize ),
	    description: 'Log file size',
	    icon: FileText,
	    color:
	      'wdt:from-purple-50 wdt:to-purple-100/50 wdt:dark:from-purple-950/20 wdt:dark:to-purple-900/10',
	    iconColor: 'wdt:text-purple-600 wdt:dark:text-purple-400',
	    textColor: 'wdt:text-purple-900 wdt:dark:text-purple-100',
	    trend: fileSize > 1024 * 1024 ? 'warning' : 'good', // Warning if > 1MB
	  },
	];

	const getTrendIcon = ( trend: string ) => {
	  switch ( trend ) {
	    case 'good':
	      return <TrendingDown className='wdt:w-3 wdt:h-3 wdt:text-green-500' />;
	    case 'bad':
	      return <TrendingUp className='wdt:w-3 wdt:h-3 wdt:text-red-500' />;
	    case 'warning':
	      return <TrendingUp className='wdt:w-3 wdt:h-3 wdt:text-yellow-500' />;
	    default:
	      return null;
	  }
	};

	return (
		<div className='wdt:grid wdt:gap-6 md:wdt:grid-cols-5 wdt:mb-8'>
			{ statCards.map( ( card, index ) => (
				<Card
					key={ card.title }
					className={ `wdt:relative wdt:overflow-hidden wdt:hover:shadow-lg wdt:transition-all wdt:duration-300 wdt:border-0 wdt:bg-gradient-to-br ${ card.color }` }
	      >
					<div className='wdt:absolute wdt:top-0 wdt:right-0 wdt:w-16 wdt:h-16 wdt:bg-primary/5 wdt:rounded-full wdt:-translate-y-6 wdt:translate-x-6'></div>
					<CardHeader className='wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-3 wdt:relative'>
						<CardTitle className='wdt:text-sm wdt:font-semibold wdt:text-muted-foreground'>
							{ card.title }
						</CardTitle>
						<div className='wdt:p-2 wdt:bg-primary/10 wdt:rounded-lg'>
							<card.icon className={ `wdt:w-4 wdt:h-4 ${ card.iconColor }` } />
						</div>
					</CardHeader>
					<CardContent className='wdt:relative'>
						<div
							className={ `wdt:text-2xl wdt:font-bold wdt:mb-1 ${ card.textColor }` }
	          >
							{ card.value }
						</div>
						<div className='wdt:flex wdt:items-center wdt:justify-between'>
							<p className='wdt:text-xs wdt:text-muted-foreground wdt:font-medium'>
								{ card.description }
							</p>
							<div className='wdt:flex wdt:items-center wdt:gap-1'>
								{ getTrendIcon( card.trend ) }
							</div>
						</div>
					</CardContent>
				</Card>
	    ) ) }
		</div>
	);
};

export default LogStats;
