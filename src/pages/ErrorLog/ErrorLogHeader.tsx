import { FileText, AlertTriangle } from 'lucide-react';
import React from 'react';

interface ErrorLogHeaderProps {
	title: string;
	description: string;
}

const ErrorLogHeader: React.FC<ErrorLogHeaderProps> = ( {
	title,
	description,
} ) => (
	<div className='wdt:space-y-4 wdt:text-center md:wdt:text-left'>
		<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-4'>
			<div className='wdt:relative'>
				<div className='wdt:p-4 wdt:bg-gradient-to-br wdt:from-red-50 wdt:to-red-100/50 wdt:dark:from-red-950/20 wdt:dark:to-red-900/10 wdt:rounded-2xl wdt:border wdt:border-red-200/50 wdt:dark:border-red-800/30'>
					<FileText className='wdt:w-8 wdt:h-8 wdt:text-red-600 wdt:dark:text-red-400' />
				</div>
				<div className='wdt:absolute wdt:-top-1 wdt:-right-1 wdt:w-3 wdt:h-3 wdt:bg-red-500 wdt:rounded-full wdt:animate-pulse'></div>
			</div>
			<div>
				<h1 className='wdt:text-4xl wdt:font-bold wdt:bg-gradient-to-r wdt:from-foreground wdt:to-foreground/70 wdt:bg-clip-text wdt:text-transparent'>
					{ title }
				</h1>
				<p className='wdt:text-lg wdt:text-muted-foreground wdt:mt-1'>
					Error Monitoring
				</p>
			</div>
		</div>
		<p className='wdt:text-lg wdt:text-muted-foreground wdt:max-w-3xl wdt:mx-auto md:wdt:mx-0 wdt:leading-relaxed'>
			{ description }
		</p>
		<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-2 wdt:mt-4'>
			<AlertTriangle className='wdt:w-4 wdt:h-4 wdt:text-amber-500' />
			<span className='wdt:text-sm wdt:text-amber-600 wdt:dark:text-amber-400'>
				Monitor PHP errors, warnings, and notices in real-time
			</span>
		</div>
	</div>
);

export default ErrorLogHeader;
