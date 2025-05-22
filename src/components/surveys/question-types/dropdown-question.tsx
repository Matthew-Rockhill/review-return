// src/components/surveys/question-types/dropdown-question.tsx
import { Database } from '@/types/database.types';

type Question = Database['public']['Tables']['questions']['Row'];

interface DropdownQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DropdownQuestion({
  question,
  value,
  onChange,
  error
}: DropdownQuestionProps) {
  const options = (question.options as { choices: string[] })?.choices || [];

  return (
    <div className="space-y-2">
      <select
        id={`question-${question.id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full rounded-md border ${
          error ? 'border-red-500' : 'border-slate-200'
        } bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950`}
      >
        <option value="">Select an option</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}