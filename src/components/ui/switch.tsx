import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Switch( {
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> ) {
	return (
		<SwitchPrimitive.Root
			data-slot='switch'
			className={ cn(
				'wdt:peer wdt:data-[state=checked]:bg-primary wdt:data-[state=unchecked]:bg-input wdt:focus-visible:border-ring wdt:focus-visible:ring-ring/50 wdt:dark:data-[state=unchecked]:bg-input/80 wdt:inline-flex wdt:h-[1.15rem] wdt:w-8 wdt:shrink-0 wdt:items-center wdt:rounded-full wdt:border wdt:border-transparent wdt:shadow-xs wdt:transition-all wdt:outline-none wdt:focus-visible:ring-[3px] wdt:disabled:cursor-not-allowed wdt:disabled:opacity-50',
				className,
			) }
			{ ...props }
		>
			<SwitchPrimitive.Thumb
				data-slot='switch-thumb'
				className={ cn(
					'wdt:bg-background wdt:dark:data-[state=unchecked]:bg-foreground wdt:dark:data-[state=checked]:bg-primary-foreground wdt:pointer-events-none wdt:block wdt:size-4 wdt:rounded-full wdt:ring-0 wdt:transition-transform wdt:data-[state=checked]:translate-x-[calc(100%-2px)] wdt:data-[state=unchecked]:translate-x-0',
				) }
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
