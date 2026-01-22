import { Wrench, ArrowRight } from 'lucide-react';
import React from 'react';

import ToolCard from './ToolCard';

interface ToolsGridProps {
	tools: Array<{
	  id: string;
	  name: string;
	  description: string;
	  icon: React.ComponentType<{ className?: string }>;
	  status: string;
	}>;
}

const ToolsGrid: React.FC<ToolsGridProps> = ( { tools } ) => (
	<div className='wdt:space-y-6'>
		<div className='wdt:flex wdt:items-center wdt:justify-between'>
			<div className='wdt:flex wdt:items-center wdt:gap-3'>
				<div className='wdt:p-2 wdt:bg-primary/10 wdt:rounded-lg'>
					<Wrench className='wdt:w-6 wdt:h-6 wdt:text-primary' />
				</div>
				<div>
					<h2 className='wdt:text-2xl wdt:font-bold'>Available Tools</h2>
					<p className='wdt:text-sm wdt:text-muted-foreground'>
						Explore and manage your development toolkit
					</p>
				</div>
			</div>
			<div className='wdt:flex wdt:items-center wdt:gap-2 wdt:text-sm wdt:text-muted-foreground'>
				<span>{ tools.length } tools available</span>
				<ArrowRight className='wdt:w-4 wdt:h-4' />
			</div>
		</div>
		<div className='wdt:grid wdt:gap-6 md:wdt:grid-cols-2 xl:wdt:grid-cols-3'>
			{ tools.map( ( tool, index ) => (
				<div
					key={ tool.id }
					className='wdt:animate-in wdt:slide-in-from-bottom-4'
					style={ { animationDelay: `${ index * 100 }ms` } }
	      >
					<ToolCard tool={ tool } />
				</div>
	    ) ) }
		</div>
	</div>
);

export default ToolsGrid;
