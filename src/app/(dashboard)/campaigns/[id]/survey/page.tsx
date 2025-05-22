// src/app/(dashboard)/campaigns/[id]/survey/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  PlusCircle, 
  Save, 
  Trash,
  MoveUp,
  MoveDown,
  Grip
} from 'lucide-react';
import { Database } from '@/types/database.types';
import { QuestionType } from '@/types/survey.types';
import { QuestionEditor } from '@/components/surveys/question-editor';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

type Survey = Database['public']['Tables']['surveys']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];

export default function SurveyEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!user || !id) return;

      try {
        setIsLoading(true);

        // Fetch campaign to check if it belongs to user
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .eq('profile_id', user.id)
          .single();

        if (campaignError) {
          throw new Error('Campaign not found or access denied');
        }

        // Fetch survey
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('*')
          .eq('campaign_id', id)
          .single();

        if (surveyError) {
          // If no survey exists for this campaign, create one
          if (surveyError.code === 'PGRST116') {
            const { data: newSurvey, error: createError } = await supabase
              .from('surveys')
              .insert({
                campaign_id: id,
                title: `${campaignData.name} Survey`,
                description: 'Please provide your feedback',
                thank_you_message: 'Thank you for your feedback!'
              })
              .select()
              .single();

            if (createError) throw createError;
            setSurvey(newSurvey);
          } else {
            throw surveyError;
          }
        } else {
          setSurvey(surveyData);
        }

        // Fetch questions if survey exists
        if (surveyData) {
          const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('survey_id', surveyData.id)
            .order('order_index');

          if (questionsError) throw questionsError;
          setQuestions(questionsData || []);
        }

      } catch (error) {
        console.error('Error fetching survey:', error);
        router.push(`/campaigns/${id}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [user, id, supabase, router]);

  const handleSurveyUpdate = async (field: string, value: string) => {
    if (!survey) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('surveys')
        .update({ [field]: value })
        .eq('id', survey.id);

      if (error) throw error;

      setSurvey({ ...survey, [field]: value });
      showSaveMessage();
    } catch (error) {
      console.error('Error updating survey:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!survey) return;

    try {
      setIsSaving(true);
      
      // Create a new question with next order index
      const newIndex = questions.length;
      
      const { data, error } = await supabase
        .from('questions')
        .insert({
          survey_id: survey.id,
          text: 'New Question',
          type: 'rating' as QuestionType,
          options: { min: 1, max: 5, step: 1 },
          required: true,
          order_index: newIndex
        })
        .select();

      if (error) throw error;
      
      // Add new question to state
      setQuestions([...questions, data[0]]);
      showSaveMessage();
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateQuestion = async (questionId: string, updates: Partial<Question>) => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', questionId);

      if (error) throw error;
      
      // Update question in state
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      ));
      
      showSaveMessage();
    } catch (error) {
      console.error('Error updating question:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      
      // Remove question from state
      setQuestions(questions.filter(q => q.id !== questionId));
      
      // Update order_index for remaining questions
      const updatedQuestions = questions
        .filter(q => q.id !== questionId)
        .map((q, index) => ({ ...q, order_index: index }));
      
      // Update order indices in database
      for (const q of updatedQuestions) {
        await supabase
          .from('questions')
          .update({ order_index: q.order_index })
          .eq('id', q.id);
      }
      
      setQuestions(updatedQuestions);
      showSaveMessage();
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update local state first for immediate visual feedback
    setQuestions(items);
    
    try {
      setIsSaving(true);
      
      // Update order_index for all questions
      const updatedQuestions = items.map((item, index) => ({
        ...item,
        order_index: index
      }));
      
      // Update all questions with new order_index
      for (const q of updatedQuestions) {
        await supabase
          .from('questions')
          .update({ order_index: q.order_index })
          .eq('id', q.id);
      }
      
      showSaveMessage();
    } catch (error) {
      console.error('Error reordering questions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const showSaveMessage = () => {
    setSaveMessage('Changes saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        <p className="mt-4 text-lg text-slate-600">Loading survey...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Survey not found</h2>
        <p className="mt-2 text-gray-500">Unable to load the survey for this campaign.</p>
        <Link href={`/campaigns/${id}`}>
          <Button variant="primary" className="mt-6">
            Back to Campaign
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/campaigns/${id}`} className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaign
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Survey Editor</h1>
        </div>
        <div className="flex items-center space-x-2">
          {saveMessage && (
            <span className="text-green-600 bg-green-50 px-3 py-1 rounded-md text-sm">
              {saveMessage}
            </span>
          )}
          <Button
            variant="primary"
            onClick={handleAddQuestion}
            disabled={isSaving}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Survey Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Survey Settings</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Survey Title</Label>
            <Input
              id="title"
              value={survey.title}
              onChange={(e) => handleSurveyUpdate('title', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={survey.description || ''}
              onChange={(e) => handleSurveyUpdate('description', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="thankYouMessage">Thank You Message</Label>
            <textarea
              id="thankYouMessage"
              value={survey.thank_you_message || ''}
              onChange={(e) => handleSurveyUpdate('thank_you_message', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Questions</h2>
        
        {questions.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 mb-4">No questions yet</p>
            <Button
              variant="primary"
              onClick={handleAddQuestion}
              disabled={isSaving}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Question
            </Button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {questions.map((question, index) => (
                    <Draggable key={question.id} draggableId={question.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-lg p-4 bg-slate-50"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div
                                {...provided.dragHandleProps}
                                className="mr-2 p-1 rounded hover:bg-slate-200 cursor-move"
                              >
                                <Grip className="h-5 w-5 text-gray-400" />
                              </div>
                              <span className="bg-slate-200 text-slate-600 text-xs font-medium px-2 py-1 rounded">
                                Question {index + 1}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <QuestionEditor
                            question={question}
                            onUpdate={(updates) => handleUpdateQuestion(question.id, updates)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Preview Button */}
      <div className="flex justify-center">
        <Link href={`/campaigns/${id}/survey/preview`}>
          <Button variant="outline" size="lg">
            Preview Survey
          </Button>
        </Link>
      </div>
    </div>
  );
}