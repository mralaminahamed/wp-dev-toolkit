import React, { useState, useEffect } from 'react';
import { Button, Spinner, TabPanel, Dashicon } from '@wordpress/components';

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

const SystemInfo: React.FC = () => {
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('wordpress');

    useEffect(() => {
        fetchSystemInfo();
    }, []);

    const fetchSystemInfo = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${window.wpDevToolkit.apiUrl}/system-info`, {
                headers: {
                    'X-WP-Nonce': window.wpDevToolkit.nonce
                }
            });
            const data = await response.json();

            if (data.success) {
                setSystemInfo(data.data);
            } else {
                setError('Failed to load system information.');
            }
        } catch (error) {
            console.error('Error fetching system info:', error);
            setError('Error connecting to the API.');
        }
        setIsLoading(false);
    };

    const InfoRow = ({ label, value }: { label: string; value: any }) => (
        <tr className="border-b border-gray-200">
            <td className="py-3 px-4 font-medium text-gray-700">{label}</td>
            <td className="py-3 px-4">
                {typeof value === 'boolean'
                    ? (value ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Dashicon icon="yes" size={14} className="mr-1" /> Yes
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Dashicon icon="no-alt" size={14} className="mr-1" /> No
                        </span>
                    ))
                    : value}
            </td>
        </tr>
    );

    if (isLoading) {
        return (
            <div className="wp-dev-toolkit-system-info">
                <div className="wp-dev-toolkit-page-header">
                    <h1>System Information</h1>
                    <p>View details about your WordPress environment</p>
                </div>
                
                <div className="flex justify-center items-center p-16 bg-white rounded-lg shadow-sm">
                    <Spinner /> <span className="ml-2">Loading system information...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="wp-dev-toolkit-system-info">
                <div className="wp-dev-toolkit-page-header">
                    <h1>System Information</h1>
                    <p>View details about your WordPress environment</p>
                </div>
                
                <div className="wp-dev-toolkit-card bg-red-50 border border-red-200">
                    <div className="wp-dev-toolkit-card-body">
                        <div className="flex items-start">
                            <Dashicon icon="warning" className="text-red-500 mr-3 mt-1" />
                            <div>
                                <h3 className="text-red-800 font-medium mb-2">Error Loading System Information</h3>
                                <p className="text-red-700 mb-4">{error}</p>
                                <Button 
                                    className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
                                    onClick={fetchSystemInfo}
                                    icon="update"
                                >
                                    Retry
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!systemInfo) {
        return (
            <div className="wp-dev-toolkit-system-info">
                <div className="wp-dev-toolkit-page-header">
                    <h1>System Information</h1>
                    <p>View details about your WordPress environment</p>
                </div>
                
                <div className="wp-dev-toolkit-card">
                    <div className="wp-dev-toolkit-card-body">
                        <p>No system information available.</p>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { name: 'wordpress', title: 'WordPress', icon: 'wordpress' },
        { name: 'server', title: 'Server', icon: 'desktop' },
        { name: 'constants', title: 'Constants', icon: 'admin-settings' },
        { name: 'permissions', title: 'Permissions', icon: 'lock' },
    ];

    return (
        <div className="wp-dev-toolkit-system-info">
            <div className="wp-dev-toolkit-page-header">
                <h1>System Information</h1>
                <p>View details about your WordPress environment</p>
            </div>
            
            <div className="wp-dev-toolkit-card mb-6">
                <div className="wp-dev-toolkit-card-header">
                    <div className="flex justify-between items-center">
                        <h2>System Overview</h2>
                        <Button 
                            className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
                            onClick={fetchSystemInfo}
                            icon="update"
                        >
                            Refresh Info
                        </Button>
                    </div>
                </div>
                <div className="wp-dev-toolkit-card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center mb-2">
                                <Dashicon icon="wordpress" className="text-blue-600 mr-2" />
                                <h3 className="text-lg font-medium">WordPress</h3>
                            </div>
                            <div className="text-xl font-bold">{systemInfo.wordpress.version}</div>
                            <div className="text-sm text-gray-500 mt-1">
                                {systemInfo.wordpress.debug_mode ? 'Debug Mode Enabled' : 'Debug Mode Disabled'}
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center mb-2">
                                <Dashicon icon="admin-site-alt3" className="text-purple-600 mr-2" />
                                <h3 className="text-lg font-medium">PHP</h3>
                            </div>
                            <div className="text-xl font-bold">{systemInfo.server.php_version}</div>
                            <div className="text-sm text-gray-500 mt-1">
                                Memory: {systemInfo.server.php_memory_limit}
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center mb-2">
                                <Dashicon icon="database" className="text-green-600 mr-2" />
                                <h3 className="text-lg font-medium">MySQL</h3>
                            </div>
                            <div className="text-xl font-bold">{systemInfo.server.mysql_version}</div>
                            <div className="text-sm text-gray-500 mt-1">
                                {systemInfo.server.web_server}
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center mb-2">
                                <Dashicon icon="admin-appearance" className="text-amber-600 mr-2" />
                                <h3 className="text-lg font-medium">Theme</h3>
                            </div>
                            <div className="text-xl font-bold">{systemInfo.wordpress.theme}</div>
                            <div className="text-sm text-gray-500 mt-1">
                                Version: {systemInfo.wordpress.theme_version}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="wp-dev-toolkit-card">
                <div className="wp-dev-toolkit-card-header">
                    <h2>Detailed Information</h2>
                </div>
                <div className="wp-dev-toolkit-card-body p-0">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    className={`px-6 py-3 font-medium flex items-center ${
                                        activeTab === tab.name
                                            ? 'border-b-2 border-blue-500 text-blue-600'
                                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setActiveTab(tab.name)}
                                >
                                    <Dashicon icon={tab.icon as any} className="mr-2" />
                                    {tab.title}
                                </button>
                            ))}
                        </nav>
                    </div>
                    
                    <div className="p-6">
                        {activeTab === 'wordpress' && (
                            <div>
                                <h3 className="text-lg font-medium mb-4">WordPress Environment</h3>
                                <table className="wp-dev-toolkit-system-info-table">
                                    <tbody>
                                        <InfoRow label="WordPress Version" value={systemInfo.wordpress.version} />
                                        <InfoRow label="Home URL" value={systemInfo.wordpress.home_url} />
                                        <InfoRow label="Site URL" value={systemInfo.wordpress.site_url} />
                                        <InfoRow label="Multisite" value={systemInfo.wordpress.is_multisite} />
                                        <InfoRow label="Debug Mode" value={systemInfo.wordpress.debug_mode} />
                                        <InfoRow label="Memory Limit" value={systemInfo.wordpress.memory_limit} />
                                        <InfoRow label="Permalink Structure" value={systemInfo.wordpress.permalink_structure || 'Default'} />
                                        <InfoRow label="Active Theme" value={`${systemInfo.wordpress.theme} ${systemInfo.wordpress.theme_version}`} />
                                        <InfoRow label="Active Plugins" value={systemInfo.wordpress.active_plugins} />
                                        <InfoRow label="Site Language" value={systemInfo.wordpress.language} />
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {activeTab === 'server' && (
                            <div>
                                <h3 className="text-lg font-medium mb-4">Server Environment</h3>
                                <table className="wp-dev-toolkit-system-info-table">
                                    <tbody>
                                        <InfoRow label="PHP Version" value={systemInfo.server.php_version} />
                                        <InfoRow label="MySQL Version" value={systemInfo.server.mysql_version} />
                                        <InfoRow label="Web Server" value={systemInfo.server.web_server} />
                                        <InfoRow label="PHP Memory Limit" value={systemInfo.server.php_memory_limit} />
                                        <InfoRow label="PHP Execution Time" value={`${systemInfo.server.php_max_execution_time} seconds`} />
                                        <InfoRow label="PHP Post Max Size" value={systemInfo.server.php_post_max_size} />
                                        <InfoRow label="PHP Upload Max Size" value={systemInfo.server.php_upload_max_filesize} />
                                        <InfoRow label="PHP Max Input Vars" value={systemInfo.server.php_max_input_vars} />
                                        <InfoRow
                                            label="PHP Extensions"
                                            value={
                                                <div className="max-h-32 overflow-y-auto text-xs">
                                                    {systemInfo.server.php_extensions}
                                                </div>
                                            }
                                        />
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {activeTab === 'constants' && (
                            <div>
                                <h3 className="text-lg font-medium mb-4">WordPress Constants</h3>
                                <table className="wp-dev-toolkit-system-info-table">
                                    <tbody>
                                        {Object.entries(systemInfo.constants).map(([key, value]) => (
                                            <InfoRow key={key} label={key} value={value} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {activeTab === 'permissions' && (
                            <div>
                                <h3 className="text-lg font-medium mb-4">File Permissions</h3>
                                <table className="wp-dev-toolkit-system-info-table">
                                    <tbody>
                                        {Object.entries(systemInfo.permissions).map(([key, value]) => (
                                            <InfoRow
                                                key={key}
                                                label={key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                value={value}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemInfo;
