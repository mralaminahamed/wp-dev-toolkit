import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
	'wdt:inline-flex wdt:items-center wdt:justify-center wdt:rounded-full wdt:border wdt:px-2 wdt:py-0.5 wdt:text-xs wdt:font-medium wdt:w-fit ' +
    'wdt:whitespace-nowrap wdt:shrink-0 wdt:[&>svg]:size-3 wdt:gap-1 wdt:[&>svg]:pointer-events-none wdt:focus-visible:border-ring ' +
    'wdt:focus-visible:ring-ring/50 wdt:focus-visible:ring-[3px] wdt:aria-invalid:ring-destructive/20 wdt:dark:aria-invalid:ring-destructive/40 ' +
    'wdt:aria-invalid:border-destructive wdt:transition-[color,box-shadow] wdt:overflow-hidden',
	{
		variants: {
			variant: {
				default:
          'wdt:border-transparent wdt:bg-primary wdt:text-primary-foreground wdt:[a&]:hover:bg-primary/90',
				secondary:
          'wdt:border-transparent wdt:bg-secondary wdt:text-secondary-foreground wdt:[a&]:hover:bg-secondary/90',
				destructive:
          'wdt:border-transparent wdt:bg-destructive wdt:text-white wdt:[a&]:hover:bg-destructive/90 ' +
          'wdt:focus-visible:ring-destructive/20 wdt:dark:focus-visible:ring-destructive/40 wdt:dark:bg-destructive/60',
				outline:
          'wdt:text-foreground wdt:[a&]:hover:bg-accent wdt:[a&]:hover:text-accent-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

function Badge( {
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean } ) {
	const Comp = asChild ? Slot : 'span';

	return (
		<Comp
			data-slot="badge"
			className={ cn( badgeVariants( { variant } ), className ) }
			{ ...props }
		/>
	);
}

export { Badge, badgeVariants };
