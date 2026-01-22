import { BarChart, Check, Target, Activity, Zap } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
	activeToolsCount: number;
}

const StatsCards: React.FC<StatsCardsProps> = ( { activeToolsCount } ) => (
	<div className='wdt:grid wdt:gap-6 md:wdt:grid-cols-3'>
		<Card className='wdt:relative wdt:overflow-hidden wdt:hover:shadow-lg wdt:transition-all wdt:duration-300 wdt:border-0 wdt:bg-gradient-to-br wdt:from-blue-50 wdt:to-blue-100/50 wdt:dark:from-blue-950/20 wdt:dark:to-blue-900/10'>
			<div className='wdt:absolute wdt:top-0 wdt:right-0 wdt:w-20 wdt:h-20 wdt:bg-blue-500/10 wdt:rounded-full wdt:-translate-y-6 wdt:translate-x-6'></div>
			<CardHeader className='wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-3 wdt:relative'>
				<CardTitle className='wdt:text-sm wdt:font-semibold wdt:text-blue-700 wdt:dark:text-blue-300'>
					Active Tools
				</CardTitle>
				<div className='wdt:p-2 wdt:bg-blue-500/10 wdt:rounded-lg'>
					<BarChart className='wdt:w-5 wdt:h-5 wdt:text-blue-600 wdt:dark:text-blue-400' />
				</div>
			</CardHeader>
			<CardContent className='wdt:relative'>
				<div className='wdt:text-3xl wdt:font-bold wdt:text-blue-900 wdt:dark:text-blue-100 wdt:mb-1'>
					{ activeToolsCount }
				</div>
				<p className='wdt:text-sm wdt:text-blue-600/70 wdt:dark:text-blue-400/70 wdt:font-medium'>
					Development tools enabled
				</p>
				<div className='wdt:mt-3'>
					<Badge
						variant='secondary'
						className='wdt:bg-blue-100 wdt:text-blue-700 wdt:hover:bg-blue-200 wdt:dark:bg-blue-900/30 wdt:dark:text-blue-300'
	        >
						<Activity className='wdt:w-3 wdt:h-3 wdt:mr-1' />
						Active
					</Badge>
				</div>
			</CardContent>
		</Card>

		<Card className='wdt:relative wdt:overflow-hidden wdt:hover:shadow-lg wdt:transition-all wdt:duration-300 wdt:border-0 wdt:bg-gradient-to-br wdt:from-green-50 wdt:to-green-100/50 wdt:dark:from-green-950/20 wdt:dark:to-green-900/10'>
			<div className='wdt:absolute wdt:top-0 wdt:right-0 wdt:w-20 wdt:h-20 wdt:bg-green-500/10 wdt:rounded-full wdt:-translate-y-6 wdt:translate-x-6'></div>
			<CardHeader className='wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-3 wdt:relative'>
				<CardTitle className='wdt:text-sm wdt:font-semibold wdt:text-green-700 wdt:dark:text-green-300'>
					System Status
				</CardTitle>
				<div className='wdt:p-2 wdt:bg-green-500/10 wdt:rounded-lg'>
					<Check className='wdt:w-5 wdt:h-5 wdt:text-green-600 wdt:dark:text-green-400' />
				</div>
			</CardHeader>
			<CardContent className='wdt:relative'>
				<div className='wdt:text-3xl wdt:font-bold wdt:text-green-900 wdt:dark:text-green-100 wdt:mb-1'>
					Healthy
				</div>
				<p className='wdt:text-sm wdt:text-green-600/70 wdt:dark:text-green-400/70 wdt:font-medium'>
					All systems operational
				</p>
				<div className='wdt:mt-3'>
					<div className='wdt:flex wdt:items-center wdt:gap-2'>
						<div className='wdt:w-2 wdt:h-2 wdt:bg-green-500 wdt:rounded-full wdt:animate-pulse'></div>
						<span className='wdt:text-xs wdt:text-green-600/70 wdt:dark:text-green-400/70 wdt:font-medium'>
							Live monitoring
						</span>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card className='wdt:relative wdt:overflow-hidden wdt:hover:shadow-lg wdt:transition-all wdt:duration-300 wdt:border-0 wdt:bg-gradient-to-br wdt:from-purple-50 wdt:to-purple-100/50 wdt:dark:from-purple-950/20 wdt:dark:to-purple-900/10'>
			<div className='wdt:absolute wdt:top-0 wdt:right-0 wdt:w-20 wdt:h-20 wdt:bg-purple-500/10 wdt:rounded-full wdt:-translate-y-6 wdt:translate-x-6'></div>
			<CardHeader className='wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-3 wdt:relative'>
				<CardTitle className='wdt:text-sm wdt:font-semibold wdt:text-purple-700 wdt:dark:text-purple-300'>
					WordPress
				</CardTitle>
				<div className='wdt:p-2 wdt:bg-purple-500/10 wdt:rounded-lg'>
					<Target className='wdt:w-5 wdt:h-5 wdt:text-purple-600 wdt:dark:text-purple-400' />
				</div>
			</CardHeader>
			<CardContent className='wdt:relative'>
				<div className='wdt:text-3xl wdt:font-bold wdt:text-purple-900 wdt:dark:text-purple-100 wdt:mb-1'>
					6.4+
				</div>
				<p className='wdt:text-sm wdt:text-purple-600/70 wdt:dark:text-purple-400/70 wdt:font-medium'>
					Compatible version
				</p>
				<div className='wdt:mt-3'>
					<Badge
						variant='outline'
						className='wdt:border-purple-200 wdt:text-purple-700 wdt:hover:bg-purple-50 wdt:dark:border-purple-800 wdt:dark:text-purple-300'
	        >
						<Zap className='wdt:w-3 wdt:h-3 wdt:mr-1' />
						Latest
					</Badge>
				</div>
			</CardContent>
		</Card>
	</div>
);

export default StatsCards;
