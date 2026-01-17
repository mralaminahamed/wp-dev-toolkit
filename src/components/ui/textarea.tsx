import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea( { className, ...props }: React.ComponentProps<'textarea'> ) {
	return (
		<textarea
			data-slot="textarea"
			className={ cn(
				'wdt:border-input wdt:placeholder:text-muted-foreground wdt:focus-visible:border-ring wdt:focus-visible:ring-ring/50 wdt:aria-invalid:ring-destructive/20 wdt:dark:aria-invalid:ring-destructive/40 wdt:aria-invalid:border-destructive wdt:dark:bg-input/30 wdt:flex wdt:field-sizing-content wdt:min-h-16 wdt:w-full wdt:rounded-md wdt:border wdt:bg-transparent wdt:px-3 wdt:py-2 wdt:text-base wdt:shadow-xs wdt:transition-[color,box-shadow] wdt:outline-none wdt:focus-visible:ring-[3px] wdt:disabled:cursor-not-allowed wdt:disabled:opacity-50 wdt:md:text-sm',
				className,
			) }
			{ ...props }
		/>
	);
}

export { Textarea };
