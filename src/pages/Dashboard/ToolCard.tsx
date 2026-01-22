import { ArrowRight, ExternalLink } from 'lucide-react';
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

const ToolCard: React.FC<ToolCardProps> = ( { tool } ) => {
	const getStatusColor = ( status: string ) => {
	  switch ( status ) {
	    case 'active':
	      return 'wdt:bg-green-100 wdt:text-green-700 wdt:border-green-200 wdt:dark:bg-green-900/30 wdt:dark:text-green-300 wdt:dark:border-green-800';
	    case 'available':
	      return 'wdt:bg-blue-100 wdt:text-blue-700 wdt:border-blue-200 wdt:dark:bg-blue-900/30 wdt:dark:text-blue-300 wdt:dark:border-blue-800';
	    default:
	      return 'wdt:bg-gray-100 wdt:text-gray-700 wdt:border-gray-200 wdt:dark:bg-gray-800 wdt:dark:text-gray-300';
	  }
	};

	const getCardGradient = ( status: string ) => {
	  switch ( status ) {
	    case 'active':
	      return 'wdt:hover:shadow-green-100/50 wdt:dark:hover:shadow-green-900/20';
	    case 'available':
	      return 'wdt:hover:shadow-blue-100/50 wdt:dark:hover:shadow-blue-900/20';
	    default:
	      return 'wdt:hover:shadow-gray-100/50 wdt:dark:hover:shadow-gray-800/20';
	  }
	};

	return (
		<Card
			className={ `wdt:group wdt:relative wdt:overflow-hidden wdt:hover:shadow-xl wdt:transition-all wdt:duration-300 wdt:border-0 wdt:bg-gradient-to-br wdt:from-card wdt:to-card/80 wdt:backdrop-blur-sm ${ getCardGradient( tool.status ) }` }
	  >
			<div className='wdt:absolute wdt:top-0 wdt:right-0 wdt:w-24 wdt:h-24 wdt:bg-gradient-to-bl wdt:from-primary/5 wdt:to-transparent wdt:rounded-full wdt:translate-x-8 wdt:-translate-y-8 wdt:group-hover:scale-110 wdt:transition-transform wdt:duration-500'></div>

			<CardHeader className='wdt:relative'>
				<div className='wdt:flex wdt:items-start wdt:justify-between wdt:mb-3'>
					<div className='wdt:p-3 wdt:bg-primary/10 wdt:rounded-xl wdt:group-hover:bg-primary/20 wdt:transition-colors wdt:duration-300'>
						<tool.icon className='wdt:w-6 wdt:h-6 wdt:text-primary' />
					</div>
					<Badge
						className={ `wdt:text-xs wdt:font-medium wdt:border ${ getStatusColor( tool.status ) }` }
	        >
						{ tool.status }
					</Badge>
				</div>
				<CardTitle className='wdt:text-xl wdt:font-bold wdt:group-hover:text-primary wdt:transition-colors wdt:duration-300'>
					{ tool.name }
				</CardTitle>
			</CardHeader>

			<CardContent className='wdt:relative'>
				<p className='wdt:text-sm wdt:text-muted-foreground wdt:leading-relaxed wdt:mb-6'>
					{ tool.description }
				</p>

				<Link to={ `/${ tool.id }` } className='wdt:block'>
					<Button className='wdt:w-full wdt:group/btn wdt:justify-between wdt:hover:scale-[1.02] wdt:transition-all wdt:duration-300'>
						<span>Open { tool.name }</span>
						<ArrowRight className='wdt:w-4 wdt:h-4 wdt:group-hover/btn:translate-x-1 wdt:transition-transform wdt:duration-300' />
					</Button>
				</Link>
			</CardContent>

			<div className='wdt:absolute wdt:bottom-0 wdt:left-0 wdt:w-full wdt:h-1 wdt:bg-gradient-to-r wdt:from-primary/20 wdt:to-primary/5 wdt:scale-x-0 wdt:group-hover:scale-x-100 wdt:transition-transform wdt:duration-500 wdt:origin-left'></div>
		</Card>
	);
};

export default ToolCard;
