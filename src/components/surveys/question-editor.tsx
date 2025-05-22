// src/components/surveys/question-editor.tsx
'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash, PlusCircle } from 'lucide-react';
import { Database } from '@/types/database.types';
import { QuestionType } from '@/types/survey.types';

type Question = Database['public']['Tables']['questions']['Row'];

interface QuestionEditorProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}

export function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
  // Local state for options to avoid too many database calls
  const [options, setOptions] = useState<any>(question.options || {});
  const [localText, setLocalText] = useState(question.text);
  const [choices, setChoices] = useState<string[]>(
    question.type === 'multiple_choice' || question.type === 'checkbox' || question.type === 'dropdown'
      ? (question.options as any)?.choices || []
      : []
  );

  // Update text with debounce
  const handleTextChange = (value: string) => {
    setLocalText(value);
    
    // Use setTimeout to debounce updates
    const timeoutId = setTimeout(() => {
      onUpdate({ text: value });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  // Update question type
  const handleTypeChange = (type: QuestionType) => {
    let newOptions = {};
    
    // Set default options based on question type
    switch (type) {
      case 'rating':
        newOptions = { min: 1, max: 5, step: 1 };
        break;
      case 'multiple_choice':
      case 'checkbox':
      case 'dropdown':
        newOptions = { choices: choices.length ? choices : ['Option 1', 'Option 2'] };
        setChoices(choices.length ? choices : ['Option 1', 'Option 2']);
        break;
      default:
        newOptions = {};
    }
    
    setOptions(newOptions);
    onUpdate({ type, options: newOptions });
  };

  // Update required flag
  const handleRequiredChange = (required: boolean) => {
    onUpdate({ required });
  };

  // Update rating options
  const handleRatingOptionChange = (field: string, value: number) => {
    const newOptions = { ...options, [field]: value };
    setOptions(newOptions);
    onUpdate({ options: newOptions });
  };

  // Add a choice option
  const handleAddChoice = () => {
    const newChoices = [...choices, `Option ${choices.length + 1}`];
    setChoices(newChoices);
    const newOptions = { ...options, choices: newChoices };
    setOptions(newOptions);
    onUpdate({ options: newOptions });
  };

  // Update a choice option
  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
    const newOptions = { ...options, choices: newChoices };
    setOptions(newOptions);
    onUpdate({ options: newOptions });
  };

  // Remove a choice option
  const handleRemoveChoice = (index: number) => {
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
    const newOptions = { ...options, choices: newChoices };
    setOptions(newOptions);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div>
        <Label htmlFor={`question-${question.id}-text`}>Question Text</Label>
        <Input
          id={`question-${question.id}-text`}
          value={localText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Question Type */}
      <div>
        <Label htmlFor={`question-${question.id}-type`}>Question Type</Label>
        <select
          id={`question-${question.id}-type`}
          value={question.type}
          onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="text">Short Text</option>
          <option value="textarea">Long Text</option>
          <option value="rating">Rating Scale</option>
          <option value="multiple_choice">Multiple Choice (Radio)</option>
          <option value="checkbox">Checkboxes (Multiple Answers)</option>
          <option value="dropdown">Dropdown</option>
        </select>
      </div>

      {/* Question Options based on type */}
      <div className="pt-4">
        {question.type === 'rating' && (
          <div className="bg-white p-4 rounded-md border">
            <h4 className="text-sm font-medium mb-3">Rating Options</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`question-${question.id}-min`}>Min Value</Label>
                <Input
                  id={`question-${question.id}-min`}
                  type="number"
                  value={(options as any).min || 1}
                  onChange={(e) => handleRatingOptionChange('min', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`question-${question.id}-max`}>Max Value</Label>
                <Input
                  id={`question-${question.id}-max`}
                  type="number"
                  value={(options as any).max || 5}
                  onChange={(e) => handleRatingOptionChange('max', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`question-${question.id}-step`}>Step</Label>
                <Input
                  id={`question-${question.id}-step`}
                  type="number"
                  value={(options as any).step || 1}
                  onChange={(e) => handleRatingOptionChange('step', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {(question.type === 'multiple_choice' || question.type === 'checkbox' || question.type === 'dropdown') && (
          <div className="bg-white p-4 rounded-md border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Answer Choices</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddChoice}
              >
                <PlusCircle className="h-3 w-3 mr-2" />
                Add Choice
              </Button>
            </div>
            <div className="space-y-3">
              {choices.map((choice, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveChoice(index)}
                    disabled={choices.length <= 1}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Required Toggle */}
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id={`question-${question.id}-required`}
          checked={question.required}
          onCheckedChange={handleRequiredChange}
        />
        <Label htmlFor={`question-${question.id}-required`}>Required Question</Label>
      </div>
    </div>
  );
}