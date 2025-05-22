// src/components/surveys/question-types/checkbox-question.tsx
import { Database } from '@/types/database.types';

type Question = Database['public']['Tables']['questions']['Row'];

interface CheckboxQuestionProps {
  question: Question;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function CheckboxQuestion({
  question,
  value,
  onChange,
  error
}: CheckboxQuestionProps) {
  const options = (question.options as { choices: string[] })?.choices || [];

  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...value, option]);
    } else {
      onChange(value.filter(item => item !== option));
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`question-${question.id}-option-${index}`}
            value={option}
            checked={value.includes(option)}
            onChange={(e) => handleCheckboxChange(option, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
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