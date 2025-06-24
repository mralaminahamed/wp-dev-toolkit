import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Spinner, TabPanel } from '@wordpress/components';

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
        <div className="flex flex-wrap border-b border-gray-200 py-2">
            <div className="w-1/3 font-medium text-gray-700">{label}</div>
            <div className="w-2/3">
                {typeof value === 'boolean'
                    ? (value ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Yes</span>
                    ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">No</span>
                    ))
                    : value}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="wp-dev-toolkit-system-info">
                <h2 className="text-xl font-semibold mb-4">System Information</h2>
                <div className="flex justify-center items-center h-64">
                    <Spinner /> <span className="ml-2">Loading system information...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="wp-dev-toolkit-system-info">
                <h2 className="text-xl font-semibold mb-4">System Information</h2>
                <Card className="bg-red-50 border border-red-100">
                    <CardBody>
                        <p className="text-red-800">{error}</p>
                        <Button isPrimary onClick={fetchSystemInfo} className="mt-4">
                            Retry
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (!systemInfo) {
        return (
            <div className="wp-dev-toolkit-system-info">
                <h2 className="text-xl font-semibold mb-4">System Information</h2>
                <Card>
                    <CardBody>
                        <p>No system information available.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="wp-dev-toolkit-system-info">
            <h2 className="text-xl font-semibold mb-4">System Information</h2>

            <div className="mb-4 flex justify-end">
                <Button isPrimary onClick={fetchSystemInfo}>
                    Refresh Info
                </Button>
            </div>

            <TabPanel
                className="wp-dev-toolkit-tabs"
                tabs={[
                    { name: 'wordpress', title: 'WordPress' },
                    { name: 'server', title: 'Server' },
                    { name: 'constants', title: 'Constants' },
                    { name: 'permissions', title: 'Permissions' },
                ]}
            >
                {(tab) => {
                    if (tab.name === 'wordpress') {
                        return (
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium">WordPress Environment</h3>
                                </CardHeader>
                                <CardBody>
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
                                </CardBody>
                            </Card>
                        );
                    }

                    if (tab.name === 'server') {
                        return (
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium">Server Environment</h3>
                                </CardHeader>
                                <CardBody>
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
                                </CardBody>
                            </Card>
                        );
                    }

                    if (tab.name === 'constants') {
                        return (
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium">WordPress Constants</h3>
                                </CardHeader>
                                <CardBody>
                                    {Object.entries(systemInfo.constants).map(([key, value]) => (
                                        <InfoRow key={key} label={key} value={value} />
                                    ))}
                                </CardBody>
                            </Card>
                        );
                    }

                    if (tab.name === 'permissions') {
                        return (
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-medium">File Permissions</h3>
                                </CardHeader>
                                <CardBody>
                                    {Object.entries(systemInfo.permissions).map(([key, value]) => (
                                        <InfoRow
                                            key={key}
                                            label={key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            value={value}
                                        />
                                    ))}
                                </CardBody>
                            </Card>
                        );
                    }

                    return null;
                }}
            </TabPanel>
        </div>
    );
};

export default SystemInfo;
