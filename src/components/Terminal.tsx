import { TextareaControl, Button, Spinner, Dashicon } from '@wordpress/components';
import React, { useState, useRef, useEffect } from 'react';
import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { TerminalCommand } from '@/types/index';

const Terminal: React.FC = () => {
  const { terminal, isLoading } = useWPDevToolkit();
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('WordPress Development Toolkit Terminal\nType a command and press Enter...\n');
  const [history, setHistory] = useState<TerminalCommand[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    fetchCommandHistory();
  }, []);

  const fetchCommandHistory = async () => {
    try {
      const cmdHistory = await terminal.getHistory(20) as TerminalCommand[];
      setHistory(cmdHistory);
    } catch (error) {
      console.error('Error fetching command history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input;
    setInput('');
    setOutput(prev => `${prev}\n> ${command}`);

    try {
      const response = await terminal.execute(command);
      setOutput(prev => `${prev}\n${response.output}`);

      // Refresh history after command execution
      await fetchCommandHistory();
      setHistoryIndex(-1);
    } catch (error) {
      console.error('Error executing command:', error);
      setOutput(prev => `${prev}\nError: Command execution failed.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;

      const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIndex);
      if (newIndex >= 0 && newIndex < history.length) {
        setInput(history[newIndex].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0) return;

      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
      setHistoryIndex(newIndex);
      if (newIndex >= 0) {
        setInput(history[newIndex].command);
      } else {
        setInput('');
      }
    }
  };

  return (
    <div className="wp-dev-toolkit-terminal">
      <div className="wp-dev-toolkit-page-header">
        <h1>Terminal</h1>
        <p>Execute WordPress CLI and system commands</p>
      </div>

      <div className="wp-dev-toolkit-card">
        <div className="wp-dev-toolkit-card-header">
          <div className="flex justify-between items-center">
            <h2>Command Line Interface</h2>
            <Button 
              className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
              onClick={() => setOutput('WordPress Development Toolkit Terminal\nType a command and press Enter...\n')}
              icon="trash"
            >
              Clear Terminal
            </Button>
          </div>
        </div>
        <div className="wp-dev-toolkit-card-body p-0">
          <div className="wp-dev-toolkit-terminal-container">
            <div
              ref={outputRef}
              className="wp-dev-toolkit-terminal-output bg-gray-900 text-green-400 font-mono p-5 h-96 overflow-auto whitespace-pre-wrap rounded-t-lg"
            >
              {output}
              {isLoading && (
                <div className="flex items-center text-white mt-2">
                  <Spinner /> <span className="ml-2">Executing command...</span>
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center border-t border-gray-700 bg-gray-800 rounded-b-lg p-2">
              <div className="text-green-400 px-2 flex items-center">
                <Dashicon icon="arrow-right-alt2" />
              </div>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow bg-transparent border-0 text-white px-2 py-2 focus:outline-none font-mono"
                onKeyDown={handleKeyDown}
                placeholder="Enter command..."
              />
              <Button 
                className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
                icon="editor-code"
                type="submit" 
                disabled={isLoading}
              >
                Execute
              </Button>
            </form>
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex items-center text-sm text-gray-500">
              <Dashicon icon="info-outline" className="mr-2" />
              <span>Use the up/down arrow keys to navigate command history.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wp-dev-toolkit-card mt-6">
        <div className="wp-dev-toolkit-card-header">
          <h2>Command History</h2>
        </div>
        <div className="wp-dev-toolkit-card-body p-0">
          {history.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Command
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Executed At
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((cmd, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-sm">
                      {cmd.command}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {cmd.executed_at}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        isSmall
                        className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
                        onClick={() => setInput(cmd.command)}
                        icon="editor-paste-text"
                      >
                        Use
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 px-4 text-center text-gray-500">
              No command history available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
