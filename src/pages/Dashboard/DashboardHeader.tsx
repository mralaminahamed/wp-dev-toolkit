import { Sparkles } from 'lucide-react';
import React from 'react';

const DashboardHeader: React.FC = () => (
	<div className='wdt:space-y-4 wdt:text-center md:wdt:text-left'>
		<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-3'>
			<div className='wdt:p-3 wdt:bg-gradient-to-br wdt:from-primary/20 wdt:to-primary/5 wdt:rounded-2xl wdt:border wdt:border-primary/20'>
				<Sparkles className='wdt:w-8 wdt:h-8 wdt:text-primary' />
			</div>
			<div>
				<h1 className='wdt:text-4xl wdt:font-bold wdt:bg-gradient-to-r wdt:from-foreground wdt:to-foreground/70 wdt:bg-clip-text wdt:text-transparent'>
					WP Dev Toolkit
				</h1>
				<p className='wdt:text-lg wdt:text-muted-foreground wdt:mt-1'>
					Dashboard
				</p>
			</div>
		</div>
		<p className='wdt:text-lg wdt:text-muted-foreground wdt:max-w-2xl wdt:mx-auto md:wdt:mx-0 wdt:leading-relaxed'>
			Monitor and manage your WordPress development tools with comprehensive
			insights and real-time monitoring
		</p>
	</div>
);

export default DashboardHeader;
