import { TextareaControl, Button, Spinner } from '@wordpress/components';
import React, { useState, useRef, useEffect } from 'react';
import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { TerminalCommand } from '@/types';

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
      const cmdHistory = await terminal.getHistory(20);
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
      <h2 className="text-xl font-semibold mb-4">Terminal</h2>
      <div
        ref={outputRef}
        className="bg-black text-green-400 font-mono p-4 rounded-t h-80 overflow-auto whitespace-pre-wrap"
      >
        {output}
        {isLoading && <Spinner />}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center border border-gray-700 rounded-b bg-gray-900">
        <div className="text-gray-400 px-2">{'>'}</div>
        <TextareaControl
          value={input}
          onChange={setInput}
          className="flex-grow text-white bg-transparent border-0"
          rows={1}
          onKeyDown={handleKeyDown}
        />
        <Button isPrimary className="mr-2" type="submit" disabled={isLoading}>
          Execute
        </Button>
      </form>
      <p className="text-sm text-gray-500 mt-2">
        Use the up/down arrow keys to navigate command history.
      </p>
    </div>
  );
};

export default Terminal;
