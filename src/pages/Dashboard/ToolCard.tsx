import React from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    status: string;
  };
}

const ToolCard: React.FC<ToolCardProps> = ( { tool } ) => (
	<Card className="wdt:hover:shadow-lg wdt:transition-shadow">
		<CardHeader>
			<div className="wdt:flex wdt:items-center wdt:justify-between">
				<div className="wdt:flex wdt:items-center wdt:space-x-2">
					<tool.icon className="wdt:text-2xl" />
					<CardTitle className="wdt:text-lg">{ tool.name }</CardTitle>
				</div>
				<Badge variant={ tool.status === 'active' ? 'default' : 'secondary' }>
					{ tool.status }
				</Badge>
			</div>
		</CardHeader>
		<CardContent>
			<p className="wdt:text-sm wdt:text-muted-foreground wdt:mb-4">
				{ tool.description }
			</p>
			<Link to={ `/${ tool.id }` }>
				<Button className="wdt:w-full">Open { tool.name }</Button>
			</Link>
		</CardContent>
	</Card>
);

export default ToolCard;
