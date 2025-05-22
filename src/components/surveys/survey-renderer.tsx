// src/components/surveys/survey-renderer.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/database.types';
import { RatingQuestion } from './question-types/rating-question';
import { TextQuestion } from './question-types/text-question';
import { MultipleChoiceQuestion } from './question-types/multiple-choice-question';
import { CheckboxQuestion } from './question-types/checkbox-question';
import { DropdownQuestion } from './question-types/dropdown-question';

type Survey = Database['public']['Tables']['surveys']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type Campaign = Database['public']['Tables']['campaigns']['Row'];

interface SurveyRendererProps {
  survey: Survey;
  questions: Question[];
  campaign: Campaign;
  isPreview?: boolean;
  onSubmit: (responses: Record<string, any>) => void;
}

export function SurveyRenderer({
  survey,
  questions,
  campaign,
  isPreview = false,
  onSubmit
}: SurveyRendererProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Calculate total score for rating questions
  const calculateScore = () => {
    let totalScore = 0;
    let ratingCount = 0;

    for (const questionId in responses) {
      const question = questions.find(q => q.id === questionId);
      if (question && question.type === 'rating') {
        totalScore += responses[questionId];
        ratingCount++;
      }
    }

    return ratingCount > 0 ? totalScore / ratingCount : 0;
  };

  // Handle response changes
  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error when value is provided
    if (value !== '' && errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Handle next step
  const handleNext = () => {
    // Validate current step questions
    const currentQuestion = questions[currentStep];
    let hasError = false;

    if (currentQuestion.required && 
      (responses[currentQuestion.id] === undefined || 
       responses[currentQuestion.id] === '' || 
       (Array.isArray(responses[currentQuestion.id]) && responses[currentQuestion.id].length === 0))) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.id]: 'This question is required'
      }));
      hasError = true;
    }

    if (!hasError) {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last question, submit the survey
        handleSubmit();
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate all required questions
    const newErrors: Record<string, string> = {};
    let hasError = false;

    questions.forEach(question => {
      if (question.required && 
        (responses[question.id] === undefined || 
         responses[question.id] === '' || 
         (Array.isArray(responses[question.id]) && responses[question.id].length === 0))) {
        newErrors[question.id] = 'This question is required';
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      // Find the first question with error and go to that step
      for (let i = 0; i < questions.length; i++) {
        if (newErrors[questions[i].id]) {
          setCurrentStep(i);
          break;
        }
      }
      return;
    }

    // Calculate score
    const score = calculateScore();
    
    // Prepare submission data
    const submissionData = {
      responses,
      score,
      promptForReview: score >= campaign.review_threshold
    };

    setSubmitted(true);
    onSubmit(submissionData);
  };

  // If no questions, show a message
  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900">{survey.title}</h2>
        <p className="mt-4 text-gray-500">No questions have been added to this survey yet.</p>
      </div>
    );
  }

  // If submitted, show thank you message
  if (submitted) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
        <p className="mt-4 text-gray-500">{survey.thank_you_message || 'Your feedback has been submitted successfully.'}</p>
        {isPreview && (
          <Button
            className="mt-6"
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(0);
              setResponses({});
            }}
          >
            Start Over (Preview Mode)
          </Button>
        )}
      </div>
    );
  }

  // Current question to display
  const currentQuestion = questions[currentStep];

  return (
    <div className="space-y-6">
      {/* Survey Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{survey.title}</h2>
        {survey.description && (
          <p className="mt-2 text-gray-600">{survey.description}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
        ></div>
        <p className="text-sm text-gray-500 mt-1 text-right">
          Question {currentStep + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {currentQuestion.text}
          {currentQuestion.required && <span className="text-red-500">*</span>}
        </h3>

        {/* Render question based on type */}
        <div className="mt-2">
          {currentQuestion.type === 'text' && (
            <TextQuestion
              question={currentQuestion}
              value={responses[currentQuestion.id] || ''}
              onChange={(value) => handleResponseChange(currentQuestion.id, value)}
              error={errors[currentQuestion.id]}
              multiline={false}
            />
          )}
          {currentQuestion.type === 'textarea' && (
            <TextQuestion
              question={currentQuestion}
              value={responses[currentQuestion.id] || ''}
              onChange={(value) => handleResponseChange(currentQuestion.id, value)}
              error={errors[currentQuestion.id]}
              multiline={true}
            />
          )}
          {currentQuestion.type === 'rating' && (
            <RatingQuestion
              question={currentQuestion}
              value={responses[currentQuestion.id] || 0}
              onChange={(value) => handleResponseChange(currentQuestion.id, value)}
              error={errors[currentQuestion.id]}
            />
          )}
          {currentQuestion.type === 'multiple_choice' && (
            <MultipleChoiceQuestion
              question={currentQuestion}
              value={responses[currentQuestion.id] || ''}
              onChange={(value) => handleResponseChange(currentQuestion.id, value)}
              error={errors[currentQuestion.id]}
            />
          )}
          {currentQuestion.type === 'checkbox' && (
            <CheckboxQuestion
              question={currentQuestion}
              value={responses[currentQuestion.id] || []}
              onChange={(value) => handleResponseChange(currentQuestion.id, value)}
              error={errors[currentQuestion.id]}
            />
          )}
          {currentQuestion.type === 'dropdown' && (
            <DropdownQuestion
              question={currentQuestion}
              value={responses[currentQuestion.id] || ''}
              onChange={(value) => handleResponseChange(currentQuestion.id, value)}
              error={errors[currentQuestion.id]}
            />
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentStep < questions.length - 1 ? 'Next' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}