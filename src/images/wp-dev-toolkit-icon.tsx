import React from 'react';

import { cn } from '@/lib/utils';

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default ( { className = '', ...props }: LogoIconProps ) => (
	<svg
		className={ cn( '', className ) }
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...props }
	>
		<path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
		<circle cx="12" cy="12" r="10" />
		<line x1="2" y1="2" x2="22" y2="22" />
	</svg>
);
