// src/components/surveys/question-types/multiple-choice-question.tsx
import { Database } from '@/types/database.types';

type Question = Database['public']['Tables']['questions']['Row'];

interface MultipleChoiceQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  error
}: MultipleChoiceQuestionProps) {
  const options = (question.options as { choices: string[] })?.choices || [];

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`question-${question.id}-option-${index}`}
            name={`question-${question.id}`}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label
            htmlFor={`question-${question.id}-option-${index}`}
            className="text-sm font-medium text-slate-900"
          >
            {option}
          </label>
        </div>
      ))}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}