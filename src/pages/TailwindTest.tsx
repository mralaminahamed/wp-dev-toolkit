import React from 'react';

const TailwindTest: React.FC = () => {
	return (
		<div className="wdt:space-y-2">
			<h1>Tailwind Test Component</h1>
			<p>This component demonstrates the wdt prefix in action</p>

			<div className="wdt:mt-6 wdt:grid wdt:grid-cols-1 md:wdt:grid-cols-3 wdt:gap-6">
				<div className="wdt:bg-primary-500 wdt:text-white wdt:p-6 wdt:rounded-lg wdt:shadow-md">
					<h2 className="wdt:text-xl wdt:font-bold wdt:mb-2">Primary Color</h2>
					<p className="wdt:text-primary-100">This uses our primary color palette</p>
					<button className="wdt:mt-4 wdt:bg-white wdt:text-primary-600 wdt:px-4 wdt:py-2 wdt:rounded wdt:shadow hover:wdt:bg-primary-50">Primary Button</button>
				</div>

				<div className="wdt:bg-secondary-100 wdt:text-secondary-800 wdt:p-6 wdt:rounded-lg wdt:shadow-md">
					<h2 className="wdt:text-xl wdt:font-bold wdt:mb-2">Secondary Color</h2>
					<p className="wdt:text-secondary-600">This uses our secondary color palette</p>
					<button className="wdt:mt-4 wdt:bg-secondary-500 wdt:text-white wdt:px-4 wdt:py-2 wdt:rounded wdt:shadow hover:wdt:bg-secondary-600">Secondary Button</button>
				</div>

				<div className="wdt:bg-white wdt:p-6 wdt:rounded-lg wdt:shadow-md wdt:border wdt:border-gray-200">
					<h2 className="wdt:text-xl wdt:font-bold wdt:mb-2">Status Colors</h2>
					<div className="wdt:space-y-2">
						<div className="wdt:flex wdt:items-center wdt:gap-2">
							<span className="wdt:w-4 wdt:h-4 wdt:rounded-full wdt:bg-success-500"></span>
							<span className="wdt:text-success-500 wdt:font-medium">Success</span>
						</div>
						<div className="wdt:flex wdt:items-center wdt:gap-2">
							<span className="wdt:w-4 wdt:h-4 wdt:rounded-full wdt:bg-danger-500"></span>
							<span className="wdt:text-danger-500 wdt:font-medium">Danger</span>
						</div>
						<div className="wdt:flex wdt:items-center wdt:gap-2">
							<span className="wdt:w-4 wdt:h-4 wdt:rounded-full wdt:bg-warning-500"></span>
							<span className="wdt:text-warning-500 wdt:font-medium">Warning</span>
						</div>
						<div className="wdt:flex wdt:items-center wdt:gap-2">
							<span className="wdt:w-4 wdt:h-4 wdt:rounded-full wdt:bg-info-500"></span>
							<span className="wdt:text-info-500 wdt:font-medium">Info</span>
						</div>
					</div>
				</div>
			</div>

			<div className="wdt:mt-8 wdt:p-6 wdt:bg-white wdt:rounded-lg wdt:shadow-md">
				<h2 className="wdt:text-xl wdt:font-bold wdt:mb-4">Tailwind Features with Prefix</h2>

				<div className="wdt:space-y-6">
					<div>
						<h3 className="wdt:text-lg wdt:font-semibold wdt:mb-2">Flexbox & Grid</h3>
						<div className="wdt:flex wdt:flex-wrap wdt:gap-2 wdt:mb-4">
							<div className="wdt:bg-blue-100 wdt:p-2 wdt:rounded">Item 1</div>
							<div className="wdt:bg-blue-100 wdt:p-2 wdt:rounded">Item 2</div>
							<div className="wdt:bg-blue-100 wdt:p-2 wdt:rounded">Item 3</div>
						</div>
						<div className="wdt:grid wdt:grid-cols-4 wdt:gap-2">
							<div className="wdt:bg-green-100 wdt:p-2 wdt:rounded wdt:text-center">1</div>
							<div className="wdt:bg-green-100 wdt:p-2 wdt:rounded wdt:text-center">2</div>
							<div className="wdt:bg-green-100 wdt:p-2 wdt:rounded wdt:text-center">3</div>
							<div className="wdt:bg-green-100 wdt:p-2 wdt:rounded wdt:text-center">4</div>
						</div>
					</div>

					<div>
						<h3 className="wdt:text-lg wdt:font-semibold wdt:mb-2">Spacing & Sizing</h3>
						<div className="wdt:flex wdt:items-end wdt:gap-2">
							<div className="wdt:h-4 wdt:w-4 wdt:bg-purple-300"></div>
							<div className="wdt:h-8 wdt:w-8 wdt:bg-purple-400"></div>
							<div className="wdt:h-12 wdt:w-12 wdt:bg-purple-500"></div>
							<div className="wdt:h-16 wdt:w-16 wdt:bg-purple-600"></div>
						</div>
					</div>

					<div>
						<h3 className="wdt:text-lg wdt:font-semibold wdt:mb-2">Typography</h3>
						<p className="wdt:text-xs wdt:mb-1">Extra Small Text</p>
						<p className="wdt:text-sm wdt:mb-1">Small Text</p>
						<p className="wdt:text-base wdt:mb-1">Base Text</p>
						<p className="wdt:text-lg wdt:mb-1">Large Text</p>
						<p className="wdt:text-xl wdt:mb-1">Extra Large Text</p>
						<p className="wdt:font-bold wdt:mb-1">Bold Text</p>
						<p className="wdt:italic wdt:mb-1">Italic Text</p>
						<p className="wdt:font-mono">Monospace Text</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TailwindTest;
