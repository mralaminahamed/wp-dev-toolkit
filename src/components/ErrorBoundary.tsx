import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ErrorBoundaryProps {
  error?: Error;
  resetError?: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ( { error, resetError } ) => {
	return (
		<div className="wdt:min-h-screen wdt:flex wdt:items-center wdt:justify-center wdt:bg-gray-50 wdt:p-4">
			<div className="wdt:max-w-md wdt:w-full">
				<Card className="wdt:border-red-200 wdt:bg-red-50">
					<CardHeader>
						<CardTitle className="wdt:text-red-800 wdt:flex wdt:items-center wdt:gap-2">
							<span className="wdt:text-2xl">⚠️</span>
							Something went wrong
						</CardTitle>
					</CardHeader>
					<CardContent className="wdt:space-y-4">
						<p className="wdt:text-red-700">We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.</p>

						{ error && (
							<details className="wdt:mt-4">
								<summary className="wdt:cursor-pointer wdt:text-sm wdt:text-red-600 wdt:hover:text-red-800">Technical Details</summary>
								<pre className="wdt:mt-2 wdt:p-2 wdt:bg-red-100 wdt:rounded wdt:text-xs wdt:text-red-800 wdt:overflow-auto wdt:max-h-32">
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

						<div className="wdt:flex wdt:gap-2 wdt:mt-6">
							{ resetError && (
								<Button onClick={ resetError } variant="outline" className="wdt:border-red-300 wdt:text-red-700 wdt:hover:bg-red-100">
									Try Again
								</Button>
							) }
							<Button onClick={ () => window.location.reload() } className="wdt:bg-red-600 wdt:hover:bg-red-700 wdt:text-white">
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
