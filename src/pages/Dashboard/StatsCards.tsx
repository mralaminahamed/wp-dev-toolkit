import { BarChart, Check, Target } from 'lucide-react';
import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  activeToolsCount: number;
}

const StatsCards: React.FC<StatsCardsProps> = ( { activeToolsCount } ) => (
	<div className="wdt:grid wdt:gap-4 md:wdt:grid-cols-3">
		<Card>
			<CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
				<CardTitle className="wdt:text-sm wdt:font-medium">
					Active Tools
				</CardTitle>
				<BarChart className="wdt:text-2xl" />
			</CardHeader>
			<CardContent>
				<div className="wdt:text-2xl wdt:font-bold">{ activeToolsCount }</div>
				<p className="wdt:text-xs wdt:text-muted-foreground">
					Development tools enabled
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
				<CardTitle className="wdt:text-sm wdt:font-medium">
					System Status
				</CardTitle>
				<Check className="wdt:text-2xl" />
			</CardHeader>
			<CardContent>
				<div className="wdt:text-2xl wdt:font-bold">Healthy</div>
				<p className="wdt:text-xs wdt:text-muted-foreground">
					All systems operational
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader className="wdt:flex wdt:flex-row wdt:items-center wdt:justify-between wdt:space-y-0 wdt:pb-2">
				<CardTitle className="wdt:text-sm wdt:font-medium">WordPress</CardTitle>
				<Target className="wdt:text-2xl" />
			</CardHeader>
			<CardContent>
				<div className="wdt:text-2xl wdt:font-bold">6.4+</div>
				<p className="wdt:text-xs wdt:text-muted-foreground">
					Compatible version
				</p>
			</CardContent>
		</Card>
	</div>
);

export default StatsCards;
