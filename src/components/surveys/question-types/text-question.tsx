// src/components/surveys/question-types/text-question.tsx
import { Input } from '@/components/ui/input';
import { Database } from '@/types/database.types';

type Question = Database['public']['Tables']['questions']['Row'];

interface TextQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  multiline?: boolean;
}

export function TextQuestion({
  question,
  value,
  onChange,
  error,
  multiline = false
}: TextQuestionProps) {
  return (
    <div className="space-y-2">
      {multiline ? (
        <textarea
          id={`question-${question.id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-md border ${
            error ? 'border-red-500' : 'border-slate-200'
          } bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950`}
          rows={4}
        />
      ) : (
        <Input
          id={`question-${question.id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={error ? 'border-red-500' : ''}
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}