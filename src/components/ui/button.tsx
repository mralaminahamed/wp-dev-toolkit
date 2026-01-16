import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	// eslint-disable-next-line max-len
	'wdt:inline-flex wdt:items-center wdt:justify-center wdt:gap-2 wdt:whitespace-nowrap wdt:rounded-md wdt:text-sm wdt:font-medium wdt:transition-all wdt:disabled:pointer-events-none wdt:disabled:opacity-50 wdt:[&_svg]:pointer-events-none wdt:[&_svg:not([class*=size-])]:size-4 wdt:shrink-0 wdt:[&_svg]:shrink-0 wdt:outline-none wdt:focus-visible:border-ring wdt:focus-visible:ring-ring/50 wdt:focus-visible:ring-[3px] wdt:aria-invalid:ring-destructive/20 wdt:dark:aria-invalid:ring-destructive/40 wdt:aria-invalid:border-destructive',
	{
		variants: {
			variant: {
				default:
          'wdt:bg-primary wdt:text-primary-foreground wdt:hover:bg-primary/90',
				destructive:
          'wdt:bg-destructive wdt:text-white wdt:hover:bg-destructive/90 wdt:focus-visible:ring-destructive/20 wdt:dark:focus-visible:ring-destructive/40 wdt:dark:bg-destructive/60',
				outline:
          'wdt:border wdt:bg-background wdt:shadow-xs wdt:hover:bg-accent wdt:hover:text-accent-foreground wdt:dark:bg-input/30 wdt:dark:border-input wdt:dark:hover:bg-input/50',
				secondary:
          'wdt:bg-secondary wdt:text-secondary-foreground wdt:hover:bg-secondary/80',
				ghost:
          'wdt:hover:bg-accent wdt:hover:text-accent-foreground wdt:dark:hover:bg-accent/50',
				link: 'wdt:text-primary wdt:underline-offset-4 wdt:hover:underline',
			},
			size: {
				default: 'wdt:h-9 wdt:px-4 wdt:py-2 wdt:has-[>svg]:px-3',
				sm: 'wdt:h-8 wdt:rounded-md wdt:gap-1.5 wdt:px-3 wdt:has-[>svg]:px-2.5',
				lg: 'wdt:h-10 wdt:rounded-md wdt:px-6 wdt:has-[>svg]:px-4',
				icon: 'wdt:size-9',
				'icon-sm': 'wdt:size-8',
				'icon-lg': 'wdt:size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button( { className, variant = 'default', size = 'default', asChild = false, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean; } ) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			data-slot="button"
			data-variant={ variant }
			data-size={ size }
			className={ cn( buttonVariants( { variant, size, className } ) ) }
			{ ...props }
		/>
	);
}

export { Button, buttonVariants };
