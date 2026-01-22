import React from 'react';

const LoadingState: React.FC = () => (
	<div className='wdt:flex wdt:justify-center wdt:items-center wdt:p-16 wdt:bg-card wdt:rounded-lg wdt:shadow-sm wdt:border-border wdt:border'>
		<div className='wdt:animate-spin wdt:rounded-full wdt:h-8 wdt:w-8 wdt:border-b-2 wdt:border-primary'></div>
	</div>
);

export default LoadingState;
