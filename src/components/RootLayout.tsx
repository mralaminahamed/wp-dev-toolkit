import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

import MainNavigation from '@/components/MainNavigation';

const RootLayout: React.FC = () => {
	return (
		<div className="wdt:flex wdt:h-screen wdt:bg-background">
			<MainNavigation />
			<main className="wdt:flex-1 wdt:overflow-auto wdt:p-6">
				<div className="wdt:max-w-6xl wdt:mx-auto">
					<Outlet />
				</div>
			</main>
		</div>
	);
};

export default RootLayout;
