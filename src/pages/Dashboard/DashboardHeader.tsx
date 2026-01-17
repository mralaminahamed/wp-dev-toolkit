import React from 'react';

const DashboardHeader: React.FC = () => (
	<div className="wdt:space-y-2">
		<h1 className="wdt:text-3xl wdt:font-bold">WP Dev Toolkit Dashboard</h1>
		<p className="wdt:text-muted-foreground">
			Monitor and manage your WordPress development tools
		</p>
	</div>
);

export default DashboardHeader;
