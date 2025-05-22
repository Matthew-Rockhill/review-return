// src/components/surveys/question-types/rating-question.tsx
import { Database } from '@/types/database.types';

type Question = Database['public']['Tables']['questions']['Row'];

interface RatingQuestionProps {
  question: Question;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export function RatingQuestion({
  question,
  value,
  onChange,
  error
}: RatingQuestionProps) {
  const options = question.options as { min: number; max: number; step: number } || { min: 1, max: 5, step: 1 };
  const { min, max, step } = options;

  // Generate rating options based on min, max, and step
  const ratingOptions = [];
  for (let i = min; i <= max; i += step) {
    ratingOptions.push(i);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ratingOptions.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`h-12 w-12 rounded-md border text-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 ${
              value === rating
                ? 'border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600'
                : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}