import { Code, Info, ArrowRight, List } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { useSelect, useDispatch } from '@wordpress/data';

import actions from '@/stores/terminal/actions';
import { STORE_NAME as TERMINAL_STORE } from '@/stores/terminal/constants';

import { Button } from '@/components/ui/button';

import { TerminalCommand } from '@/types/index';

const Terminal: React.FC = () => {
	const { commands, isLoading, error } = useSelect(
	  ( select: any ) => ( {
	    commands: select( TERMINAL_STORE ).getCommands(),
	    isLoading: select( TERMINAL_STORE ).isResolving( 'execute-command' ),
	    error: select( TERMINAL_STORE ).getError( 'execute-command' ),
	  } ),
	  [],
	);
	const dispatch = useDispatch();

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
	  // Initialize with existing commands from store
	  setHistory(
	    commands.map( ( cmd: any ) => ( {
	      command: cmd.command,
	      executed_at: new Date( cmd.timestamp ).toLocaleString(),
	    } ) ),
	  );
	}, [ commands ] );

	useEffect( () => {
	  // Display errors from the store
	  if ( error ) {
	    setOutput( ( prev ) => `${ prev }\nError: ${ error }` );
	  }
	}, [ error ] );

	const handleSubmit = async ( e: React.FormEvent ) => {
	  e.preventDefault();
	  if ( ! input.trim() ) {
	    return;
	  }

	  const command = input;
	  setInput( '' );
	  setOutput( ( prev ) => `${ prev }\n> ${ command }` );

	  try {
	    // Dispatch the execute command action
	    await dispatch( actions.executeCommand( command ) );

	    // Clear any previous errors
	    setHistoryIndex( -1 );
	  } catch ( error ) {
	    console.error( 'Error dispatching command:', error );
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
	    ? 'wdt:bg-gray-900 wdt:text-green-400 wdt:border wdt:border-gray-700'
	    : 'wdt:bg-card wdt:text-card-foreground wdt:border wdt:border-border';

	const terminalInputClasses =
	  terminalTheme === 'dark'
	    ? 'wdt:bg-gray-800 wdt:text-white wdt:border-t wdt:border-gray-700'
	    : 'wdt:bg-muted wdt:text-card-foreground wdt:border-t wdt:border-border';

	return (
		<div className='wdt:min-h-screen wdt:bg-gradient-to-br wdt:from-background wdt:via-background wdt:to-muted/20 wdt:p-6 lg:wdt:p-8'>
			<div className='wdt:max-w-6xl wdt:mx-auto wdt:space-y-8'>
				<div className='wdt:space-y-4 wdt:text-center md:wdt:text-left'>
					<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-4'>
						<div className='wdt:relative'>
							<div className='wdt:p-4 wdt:bg-gradient-to-br wdt:from-gray-50 wdt:to-gray-100/50 wdt:dark:from-gray-950/20 wdt:dark:to-gray-900/10 wdt:rounded-2xl wdt:border wdt:border-gray-200/50 wdt:dark:border-gray-800/30'>
								<Code className='wdt:w-8 wdt:h-8 wdt:text-gray-600 wdt:dark:text-gray-400' />
							</div>
							<div className='wdt:absolute wdt:-top-1 wdt:-right-1 wdt:w-3 wdt:h-3 wdt:bg-gray-500 wdt:rounded-full wdt:animate-pulse'></div>
						</div>
						<div>
							<h1 className='wdt:text-4xl wdt:font-bold wdt:bg-gradient-to-r wdt:from-foreground wdt:to-foreground/70 wdt:bg-clip-text wdt:text-transparent'>
								Terminal
							</h1>
							<p className='wdt:text-lg wdt:text-muted-foreground wdt:mt-1'>
								Command Line Interface
							</p>
						</div>
					</div>
					<p className='wdt:text-lg wdt:text-muted-foreground wdt:max-w-3xl wdt:mx-auto md:wdt:mx-0 wdt:leading-relaxed'>
						Execute WordPress CLI commands, system operations, and development
						tasks directly from your browser
					</p>
					<div className='wdt:flex wdt:items-center wdt:justify-center md:wdt:justify-start wdt:gap-2 wdt:mt-4'>
						<ArrowRight className='wdt:w-4 wdt:h-4 wdt:text-gray-500' />
						<span className='wdt:text-sm wdt:text-gray-600 wdt:dark:text-gray-400'>
							Interactive command execution with history and tab completion
						</span>
					</div>
				</div>

				<div className='wdt:mb-6'>
					<div className='wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6'>
						<div className='wdt:flex wdt:justify-between wdt:items-center'>
							<div className='wdt:flex wdt:items-center wdt:gap-2'>
								<Code />
								<h2>Command Line Interface</h2>
							</div>
							<div className='wdt:flex wdt:gap-2'>
								<Button variant='secondary' onClick={ changeTerminalTheme }>
									{ terminalTheme === 'dark' ? 'Light Theme' : 'Dark Theme' }
								</Button>
								<Button variant='secondary' onClick={ clearTerminal }>
									Clear Terminal
								</Button>
							</div>
						</div>
					</div>
					<div className='wdt:px-6 wdt:p-0'>
						<div className='wdt:p-4 wdt:bg-muted/50 wdt:border-b wdt:border-border'>
							<div className='wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-4'>
								<div className='wdt:w-64'>
									<label className='wdt:block'>
										<span className='wdt:text-sm wdt:font-medium wdt:text-muted-foreground'>
											Common Commands
										</span>
										<select
											value={ commonCommands }
											onChange={ ( e ) =>
	                      handleCommonCommandSelect( e.target.value )
	                    }
											className='wdt:mt-1 wdt:block wdt:w-full wdt:px-3 wdt:py-2 wdt:border wdt:border-input wdt:rounded-md wdt:bg-background wdt:text-foreground wdt:shadow-sm wdt:focus:outline-none wdt:focus:ring-2 wdt:focus:ring-ring wdt:focus:border-ring'
	                  >
											{ wpCommonCommands.map( ( cmd: any ) => (
												<option key={ cmd.value } value={ cmd.value }>
													{ cmd.label }
												</option>
	                    ) ) }
										</select>
									</label>
								</div>
								<div className='wdt:flex wdt:items-center wdt:text-sm wdt:text-muted-foreground wdt:ml-auto'>
									<Info className='wdt:mr-2' />
									<span>Press Tab for command completion</span>
								</div>
							</div>
						</div>
						<div className='wdt:space-y-6 wdt:p-6-container'>
							<div
								ref={ outputRef }
								className={ `wdt:space-y-6 wdt:p-6-output ${ terminalClasses } wdt:font-mono wdt:p-5 wdt:h-96 wdt:overflow-auto wdt:whitespace-pre-wrap wdt:rounded-t-lg` }
	            >
								{ output }
								{ isLoading && (
									<div className='wdt:flex wdt:items-center wdt:text-white wdt:mt-2'>
										<div className='wdt:animate-spin wdt:rounded-full wdt:h-4 wdt:w-4 wdt:border-b-2 wdt:border-blue-600'></div>{ ' ' }
										<span className='wdt:ml-2'>Executing command...</span>
									</div>
	              ) }
							</div>
							<form
								onSubmit={ handleSubmit }
								className={ `wdt:flex wdt:items-center ${ terminalInputClasses } wdt:rounded-b-lg wdt:p-2` }
	            >
								<div
									className={ `${ terminalTheme === 'dark' ? 'wdt:text-green-400' : 'wdt:text-gray-600' } wdt:px-2 wdt:flex wdt:items-center` }
	              >
									<ArrowRight />
								</div>
								<input
									ref={ inputRef }
									value={ input }
									onChange={ ( e ) => setInput( e.target.value ) }
									className={ `wdt:flex-grow wdt:bg-transparent wdt:border-0 ${ terminalTheme === 'dark' ? 'wdt:text-white' : 'wdt:text-gray-800' } wdt:px-2 wdt:py-2 focus:wdt:outline-none wdt:font-mono` }
									onKeyDown={ handleKeyDown }
									placeholder='Enter command...'
	              />
								<Button className='wdt:mt-2' disabled={ isLoading } type='submit'>
									{ isLoading ? 'Executing...' : 'Execute' }
								</Button>
							</form>
						</div>
						<div className='wdt:p-4 wdt:border-t wdt:border-border wdt:bg-muted/30 wdt:rounded-b-lg'>
							<div className='wdt:flex wdt:items-center wdt:text-sm wdt:text-muted-foreground'>
								<Info className='wdt:mr-2' />
								<span>
									Use the up/down arrow keys to navigate command history.
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className='wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:py-6 wdt:shadow-sm wdt:mt-6'>
					<div className='wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6'>
						<div className='wdt:flex wdt:items-center wdt:gap-2'>
							<List />
							<h2>Command History</h2>
						</div>
					</div>
					<div className='wdt:px-6 wdt:p-0'>
						{ history.length > 0 ? (
							<table className='wdt:w-full'>
								<thead className='wdt:bg-muted/50 wdt:border-b wdt:border-border'>
									<tr>
										<th className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-muted-foreground wdt:uppercase wdt:tracking-wider'>
											Command
										</th>
										<th className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-muted-foreground wdt:uppercase wdt:tracking-wider wdt:w-32'>
											Executed At
										</th>
										<th className='wdt:py-3 wdt:px-4 wdt:text-left wdt:text-xs wdt:font-medium wdt:text-muted-foreground wdt:uppercase wdt:tracking-wider wdt:w-24'>
											Action
										</th>
									</tr>
								</thead>
								<tbody className='wdt:bg-card wdt:divide-y wdt:divide-border'>
									{ history.map( ( cmd, index ) => (
										<tr
											key={ index }
											className='hover:wdt:bg-muted/50 wdt:transition-colors'
	                  >
											<td className='wdt:py-3 wdt:px-4 wdt:font-mono wdt:text-sm'>
												{ cmd.command }
											</td>
											<td className='wdt:py-3 wdt:px-4 wdt:text-sm wdt:text-muted-foreground'>
												{ cmd.executed_at }
											</td>
											<td className='wdt:py-3 wdt:px-4'>
												<Button
													size='sm'
													variant='secondary'
													onClick={ () => setInput( cmd.command ) }
	                      >
													Use
												</Button>
											</td>
										</tr>
	                ) ) }
								</tbody>
							</table>
	          ) : (
							<div className='wdt:py-8 wdt:px-4 wdt:text-center wdt:text-muted-foreground'>
			No command history available.
	            </div>
	          ) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default Terminal;
