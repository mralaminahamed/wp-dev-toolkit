import apiFetch from '@wordpress/api-fetch';
import { TextareaControl, Button } from '@wordpress/components';
import React, { useState, useRef, useEffect } from 'react';

const Terminal: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const response = await apiFetch({
        path: '/wp-dev-toolkit/v1/terminal',
        method: 'POST',
        data: { code: input },
      });

      setOutput(prev => `${prev}\n> ${input}\n${response.output}`);
      setInput('');
    } catch (error) {
      console.error('Error executing code:', error);
      setOutput(prev => `${prev}\nError executing code. Check console for details.`);
    }
  };

  return (
    <div className="wp-dev-toolkit-terminal">
      <h2 className="text-xl font-semibold mb-4">PHP Terminal (PsySH)</h2>
      <div ref={outputRef} className="bg-black text-white p-4 h-64 overflow-y-auto font-mono mb-4">
        {output}
      </div>
      <form onSubmit={handleSubmit}>
        <TextareaControl value={input} onChange={(value: string) => setInput(value)} rows={4} placeholder="Enter PHP code here..." className="mb-2" />
        <Button isPrimary type="submit">
          Execute
        </Button>
      </form>
    </div>
  );
};

export default Terminal;
