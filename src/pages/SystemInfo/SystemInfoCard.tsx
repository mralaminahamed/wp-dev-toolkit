import {
	Monitor,
	Database,
	Settings as SettingsIcon,
	Lock,
} from 'lucide-react';
import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SystemInfo {
	wordpress: {
	  version: string;
	  home_url: string;
	  site_url: string;
	  is_multisite: boolean;
	  debug_mode: boolean;
	  memory_limit: string;
	  permalink_structure: string;
	  theme: string;
	  theme_version: string;
	  active_plugins: number;
	  language: string;
	};
	server: {
	  php_version: string;
	  mysql_version: string;
	  web_server: string;
	  user_agent: string;
	  php_memory_limit: string;
	  php_max_execution_time: string;
	  php_post_max_size: string;
	  php_upload_max_filesize: string;
	  php_max_input_vars: string;
	  php_extensions: string;
	};
	constants: Record<string, any>;
	permissions: Record<string, boolean>;
}

interface SystemInfoCardProps {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	data: Record<string, any>;
	formatValue?: ( key: string, value: any ) => string;
}

const SystemInfoCard: React.FC<SystemInfoCardProps> = ( {
	title,
	icon: Icon,
	data,
	formatValue,
} ) => (
	<Card className='wdt:mb-6'>
		<CardHeader>
			<CardTitle className='wdt:flex wdt:items-center wdt:gap-2'>
				<Icon className='wdt:text-2xl' />
				{ title }
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div className='wdt:grid wdt:grid-cols-1 md:wdt:grid-cols-2 wdt:gap-4'>
				{ Object.entries( data ).map( ( [ key, value ] ) => (
					<div
						key={ key }
						className='wdt:flex wdt:justify-between wdt:items-center wdt:p-3 wdt:bg-muted/50 wdt:rounded-lg'
	        >
						<span className='wdt:font-medium wdt:text-sm wdt:capitalize wdt:mr-4'>
							{ key.replace( /_/g, ' ' ) }:
						</span>
						<span className='wdt:text-sm wdt:font-mono wdt:bg-background wdt:px-2 wdt:py-1 wdt:rounded wdt:border'>
							{ formatValue ? formatValue( key, value ) : String( value ) }
						</span>
					</div>
	      ) ) }
			</div>
		</CardContent>
	</Card>
);

interface PermissionsCardProps {
	permissions: Record<string, boolean>;
}

const PermissionsCard: React.FC<PermissionsCardProps> = ( { permissions } ) => (
	<Card className='wdt:mb-6'>
		<CardHeader>
			<CardTitle className='wdt:flex wdt:items-center wdt:gap-2'>
				<Lock className='wdt:text-2xl' />
				File Permissions
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div className='wdt:grid wdt:grid-cols-1 md:wdt:grid-cols-2 wdt:gap-4'>
				{ Object.entries( permissions ).map( ( [ path, writable ] ) => (
					<div
						key={ path }
						className='wdt:flex wdt:justify-between wdt:items-center wdt:p-3 wdt:rounded-lg wdt:border'
	        >
						<span className='wdt:font-medium wdt:text-sm wdt:mr-4'>
							{ path }:
						</span>
						<span
							className={ `wdt:text-sm wdt:font-medium wdt:px-2 wdt:py-1 wdt:rounded ${
	              writable
	                ? 'wdt:bg-green-100 wdt:text-green-800 wdt:border-green-200'
	                : 'wdt:bg-red-100 wdt:text-red-800 wdt:border-red-200'
	            }` }
	          >
							{ writable ? 'Writable' : 'Not Writable' }
						</span>
					</div>
	      ) ) }
			</div>
		</CardContent>
	</Card>
);

export { SystemInfoCard, PermissionsCard };
export type { SystemInfo };
