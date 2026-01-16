import React, { useState, useRef, useEffect } from 'react';

import {
	TextareaControl,
	Button,
	Spinner,
	Dashicon,
	SelectControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import { STORE_NAME as TERMINAL_STORE } from '@/stores/terminal/constants';

import { TerminalCommand } from '@/types';

const Terminal: React.FC = () => {
	const { commands } = useSelect(
		( select: any ) => ( {
			commands: select( TERMINAL_STORE ).getCommands(),
		} ),
		[],
	);
	const [ input, setInput ] = useState<string>( '' );
	const [ output, setOutput ] = useState<string>(
		'WordPress Development Toolkit Terminal\nType a command and press Enter...\n',
	);
	const [ history, setHistory ] = useState<TerminalCommand[]>( [] );
	const [ historyIndex, setHistoryIndex ] = useState<number>( -1 );
	const outputRef = useRef<HTMLDivElement>( null );
	const [ commonCommands, setCommonCommands ] = useState<string>( '' );
	const [ terminalTheme, setTerminalTheme ] = useState<string>( 'dark' );
	const inputRef = useRef<HTMLInputElement>( null );

	useEffect( () => {
		if ( outputRef.current ) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight;
		}
	}, [ output ] );

	useEffect( () => {
		fetchCommandHistory();
	}, [] );

	const fetchCommandHistory = async () => {
		try {
			const cmdHistory = ( await terminal.getHistory( 20 ) ) as TerminalCommand[];
			setHistory( cmdHistory );
		} catch ( error ) {
			console.error( 'Error fetching command history:', error );
		}
	};

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( ! input.trim() ) {
			return;
		}

		const command = input;
		setInput( '' );
		setOutput( ( prev ) => `${ prev }\n> ${ command }` );

		try {
			const response = await terminal.execute( command );
			setOutput( ( prev ) => `${ prev }\n${ response.output }` );

			// Refresh history after command execution
			await fetchCommandHistory();
			setHistoryIndex( -1 );
		} catch ( error ) {
			console.error( 'Error executing command:', error );
			setOutput( ( prev ) => `${ prev }\nError: Command execution failed.` );
		}
	};

	const handleKeyDown = ( e: React.KeyboardEvent<HTMLInputElement> ) => {
		if ( e.key === 'ArrowUp' ) {
			e.preventDefault();
			if ( history.length === 0 ) {
				return;
			}

			const newIndex =
        historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
			setHistoryIndex( newIndex );
			if ( newIndex >= 0 && newIndex < history.length && history[ newIndex ] ) {
				setInput( history[ newIndex ].command || '' );
			}
		} else if ( e.key === 'ArrowDown' ) {
			e.preventDefault();
			if ( history.length === 0 ) {
				return;
			}

			const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
			setHistoryIndex( newIndex );
			if ( newIndex >= 0 && history[ newIndex ] ) {
				setInput( history[ newIndex ].command || '' );
			} else {
				setInput( '' );
			}
		} else if ( e.key === 'Tab' ) {
			e.preventDefault();
			// Simple tab completion for WordPress CLI commands
			if ( input.startsWith( 'wp ' ) ) {
				const wpCommands = [
					'wp plugin',
					'wp theme',
					'wp user',
					'wp post',
					'wp option',
					'wp core',
					'wp db',
					'wp cache',
					'wp site',
					'wp config',
				];

				const matchingCommand = wpCommands.find( ( cmd ) => cmd.startsWith( input ) );
				if ( matchingCommand ) {
					setInput( `${ matchingCommand } ` );
				}
			}
		}
	};

	const handleCommonCommandSelect = ( value: string ) => {
		if ( value ) {
			setInput( value );
			setCommonCommands( '' );
			if ( inputRef.current ) {
				inputRef.current.focus();
			}
		}
	};

	const changeTerminalTheme = () => {
		setTerminalTheme( terminalTheme === 'dark' ? 'light' : 'dark' );
	};

	const clearTerminal = () => {
		setOutput(
			'WordPress Development Toolkit Terminal\nType a command and press Enter...\n',
		);
	};

	const wpCommonCommands = [
		{ label: 'Select a common command...', value: '' },
		{ label: 'List installed plugins', value: 'wp plugin list' },
		{ label: 'Update all plugins', value: 'wp plugin update --all' },
		{ label: 'Check WordPress version', value: 'wp core version' },
		{ label: 'Show site info', value: 'wp site info' },
		{ label: 'List users', value: 'wp user list' },
		{ label: 'Database export', value: 'wp db export' },
		{ label: 'Flush cache', value: 'wp cache flush' },
	];

	// Terminal theme classes
	const terminalClasses =
    terminalTheme === 'dark'
    	? 'wdt-bg-gray-900 wdt-text-green-400'
    	: 'wdt-bg-white wdt-text-gray-800 wdt-border wdt-border-gray-300';

	const terminalInputClasses =
    terminalTheme === 'dark'
    	? 'wdt-bg-gray-800 wdt-text-white wdt-border-t wdt-border-gray-700'
    	: 'wdt-bg-gray-100 wdt-text-gray-800 wdt-border-t wdt-border-gray-300';

	return (
		<div className="wp-dev-toolkit-terminal">
			<div className="wp-dev-toolkit-page-header">
				<h1>Terminal</h1>
				<p>Execute WordPress CLI and system commands</p>
			</div>

			<div className="wp-dev-toolkit-card wdt-mb-6">
				<div className="wp-dev-toolkit-card-header">
					<div className="wdt-flex wdt-justify-between wdt-items-center">
						<div className="wdt-flex wdt-items-center wdt-gap-2">
							<Dashicon icon="editor-code" />
							<h2>Command Line Interface</h2>
						</div>
						<div className="wdt-flex wdt-gap-2">
							<Button
								className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
								onClick={ changeTerminalTheme }
								icon={ terminalTheme === 'dark' ? 'lightbulb' : 'visibility' }
							>
								{ terminalTheme === 'dark' ? 'Light Theme' : 'Dark Theme' }
							</Button>
							<Button
								className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
								onClick={ clearTerminal }
								icon="trash"
							>
								Clear Terminal
							</Button>
						</div>
					</div>
				</div>
				<div className="wp-dev-toolkit-card-body wdt-p-0">
					<div className="wdt-p-4 wdt-bg-gray-50 wdt-border-b wdt-border-gray-200">
						<div className="wdt-flex wdt-flex-wrap wdt-items-center wdt-gap-4">
							<div className="wdt-w-64">
								<SelectControl
									label="Common Commands"
									value={ commonCommands }
									options={ wpCommonCommands }
									onChange={ handleCommonCommandSelect }
								/>
							</div>
							<div className="wdt-flex wdt-items-center wdt-text-sm wdt-text-gray-500 wdt-ml-auto">
								<Dashicon icon="info-outline" className="wdt-mr-2" />
								<span>Press Tab for command completion</span>
							</div>
						</div>
					</div>
					<div className="wp-dev-toolkit-terminal-container">
						<div
							ref={ outputRef }
							className={ `wp-dev-toolkit-terminal-output ${ terminalClasses } wdt-font-mono wdt-p-5 wdt-h-96 wdt-overflow-auto wdt-whitespace-pre-wrap wdt-rounded-t-lg` }
						>
							{ output }
							{ isLoading && (
								<div className="wdt-flex wdt-items-center wdt-text-white wdt-mt-2">
									<Spinner />{ ' ' }
									<span className="wdt-ml-2">Executing command...</span>
								</div>
							) }
						</div>
						<form
							onSubmit={ handleSubmit }
							className={ `wdt-flex wdt-items-center ${ terminalInputClasses } wdt-rounded-b-lg wdt-p-2` }
						>
							<div
								className={ `${ terminalTheme === 'dark' ? 'wdt-text-green-400' : 'wdt-text-gray-600' } wdt-px-2 wdt-flex wdt-items-center` }
							>
								<Dashicon icon="arrow-right-alt2" />
							</div>
							<input
								ref={ inputRef }
								value={ input }
								onChange={ ( e ) => setInput( e.target.value ) }
								className={ `wdt-flex-grow wdt-bg-transparent wdt-border-0 ${ terminalTheme === 'dark' ? 'wdt-text-white' : 'wdt-text-gray-800' } wdt-px-2 wdt-py-2 focus:wdt-outline-none wdt-font-mono` }
								onKeyDown={ handleKeyDown }
								placeholder="Enter command..."
							/>
							<Button
								className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
								icon="editor-code"
								type="submit"
								disabled={ isLoading }
							>
								Execute
							</Button>
						</form>
					</div>
					<div className="wdt-p-4 wdt-border-t wdt-border-gray-200 wdt-bg-gray-50 wdt-rounded-b-lg">
						<div className="wdt-flex wdt-items-center wdt-text-sm wdt-text-gray-500">
							<Dashicon icon="info-outline" className="wdt-mr-2" />
							<span>
								Use the up/down arrow keys to navigate command history.
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="wp-dev-toolkit-card wdt-mt-6">
				<div className="wp-dev-toolkit-card-header">
					<div className="wdt-flex wdt-items-center wdt-gap-2">
						<Dashicon icon="list-view" />
						<h2>Command History</h2>
					</div>
				</div>
				<div className="wp-dev-toolkit-card-body wdt-p-0">
					{ history.length > 0 ? (
						<table className="wdt-w-full">
							<thead className="wdt-bg-gray-50 wdt-border-b wdt-border-gray-200">
								<tr>
									<th className="wdt-py-3 wdt-px-4 wdt-text-left wdt-text-xs wdt-font-medium wdt-text-gray-500 wdt-uppercase wdt-tracking-wider">
										Command
									</th>
									<th className="wdt-py-3 wdt-px-4 wdt-text-left wdt-text-xs wdt-font-medium wdt-text-gray-500 wdt-uppercase wdt-tracking-wider wdt-w-32">
										Executed At
									</th>
									<th className="wdt-py-3 wdt-px-4 wdt-text-left wdt-text-xs wdt-font-medium wdt-text-gray-500 wdt-uppercase wdt-tracking-wider wdt-w-24">
										Action
									</th>
								</tr>
							</thead>
							<tbody className="wdt-bg-white wdt-divide-y wdt-divide-gray-200">
								{ history.map( ( cmd, index ) => (
									<tr
										key={ index }
										className="hover:wdt-bg-gray-50 wdt-transition-colors"
									>
										<td className="wdt-py-3 wdt-px-4 wdt-font-mono wdt-text-sm">
											{ cmd.command }
										</td>
										<td className="wdt-py-3 wdt-px-4 wdt-text-sm wdt-text-gray-500">
											{ cmd.executed_at }
										</td>
										<td className="wdt-py-3 wdt-px-4">
											<Button
												isSmall
												className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
												onClick={ () => setInput( cmd.command ) }
												icon="editor-paste-text"
											>
												Use
											</Button>
										</td>
									</tr>
								) ) }
							</tbody>
						</table>
					) : (
						<div className="wdt-py-8 wdt-px-4 wdt-text-center wdt-text-gray-500">
							No command history available.
						</div>
					) }
				</div>
			</div>
		</div>
	);
};

export default Terminal;
