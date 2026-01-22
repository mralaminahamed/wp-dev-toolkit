import { AlertTriangle } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ErrorBoundaryProps {
	error?: Error;
	resetError?: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ( { error, resetError } ) => {
	return (
		<div className='wdt:min-h-screen wdt:flex wdt:items-center wdt:justify-center wdt:bg-background wdt:p-4'>
			<div className='wdt:max-w-md wdt:w-full'>
				<Card className='wdt:border-destructive/20 wdt:bg-destructive/5'>
					<CardHeader>
						<CardTitle className='wdt:text-destructive wdt:flex wdt:items-center wdt:gap-2'>
							<AlertTriangle className='wdt:text-2xl' />
							Something went wrong
						</CardTitle>
					</CardHeader>
					<CardContent className='wdt:space-y-4'>
						<p className='wdt:text-destructive/90'>
							We encountered an unexpected error. Please try refreshing the page
							or contact support if the problem persists.
						</p>

						{ error && (
							<details className='wdt:mt-4'>
								<summary className='wdt:cursor-pointer wdt:text-sm wdt:text-destructive wdt:hover:text-destructive/80'>
									Technical Details
								</summary>
								<pre className='wdt:mt-2 wdt:p-2 wdt:bg-destructive/10 wdt:rounded wdt:text-xs wdt:text-destructive wdt:overflow-auto wdt:max-h-32'>
									{ error.message }
									{ error.stack && (
										<>
											{ '\n\n' }
											{ error.stack }
										</>
									) }
								</pre>
							</details>
						) }

						<div className='wdt:flex wdt:gap-2 wdt:mt-6'>
							{ resetError && (
								<Button
									onClick={ resetError }
									variant='outline'
									className='wdt:border-destructive/30 wdt:text-destructive wdt:hover:bg-destructive/10'
								>
									Try Again
								</Button>
							) }
							<Button
								onClick={ () => window.location.reload() }
								variant='destructive'
							>
								Reload Page
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default ErrorBoundary;
