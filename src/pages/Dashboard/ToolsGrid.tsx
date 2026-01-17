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
	<div className="wdt:space-y-4">
		<h2 className="wdt:text-xl wdt:font-semibold">Available Tools</h2>
		<div className="wdt:grid wdt:gap-4 md:wdt:grid-cols-2 lg:wdt:grid-cols-3">
			{ tools.map( ( tool ) => (
				<ToolCard key={ tool.id } tool={ tool } />
			) ) }
		</div>
	</div>
);

export default ToolsGrid;
