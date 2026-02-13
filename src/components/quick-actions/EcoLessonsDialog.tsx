import { useState } from 'react';
import { GraduationCap, BookOpen, CheckCircle2, Lock, ChevronRight, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  duration: string;
  content: string[];
  quiz: { question: string; options: string[]; correct: number }[];
}

const LESSONS: Lesson[] = [
  {
    id: 'pm25',
    title: '📖 Что такое PM2.5?',
    description: 'Узнайте о мелкодисперсных частицах и их влиянии на здоровье',
    xpReward: 20,
    duration: '5 мин',
    content: [
      'PM2.5 — это мелкодисперсные частицы диаметром менее 2.5 микрометра (в 30 раз тоньше человеческого волоса).',
      'Эти частицы настолько малы, что проникают глубоко в легкие и даже в кровоток.',
      'Основные источники: транспорт, промышленность, сжигание топлива, пыльные бури.',
      'Длительное воздействие PM2.5 увеличивает риск респираторных и сердечно-сосудистых заболеваний.'
    ],
    quiz: [
      {
        question: 'Какого размера частицы PM2.5?',
        options: ['Менее 10 микрометров', 'Менее 2.5 микрометра', 'Менее 1 миллиметра'],
        correct: 1
      }
    ]
  },
  {
    id: 'sources',
    title: '🏭 Источники загрязнения',
    description: 'Изучите основные источники загрязнения воздуха в городах',
    xpReward: 30,
    duration: '7 мин',
    content: [
      'Транспорт: выхлопные газы автомобилей — главный источник загрязнения в городах.',
      'Промышленность: заводы и ТЭЦ выбрасывают оксиды серы, азота и твердые частицы.',
      'Отопление: сжигание угля и дров в частном секторе особенно опасно зимой.',
      'Строительство: пыль от стройплощадок может распространяться на сотни метров.',
      'Природные источники: пыльные бури, лесные пожары, вулканы.'
    ],
    quiz: [
      {
        question: 'Что является главным источником загрязнения в городах?',
        options: ['Промышленность', 'Транспорт', 'Строительство'],
        correct: 1
      }
    ]
  },
  {
    id: 'protection',
    title: '🛡️ Как защитить себя',
    description: 'Практические советы по защите от загрязненного воздуха',
    xpReward: 25,
    duration: '6 мин',
    content: [
      'Следите за индексом качества воздуха (AQI) и планируйте активности на свежем воздухе.',
      'При высоком AQI (>100) используйте маски N95/KN95 — они фильтруют 95% частиц.',
      'Проветривайте помещения рано утром, когда уровень загрязнения обычно ниже.',
      'Используйте очистители воздуха с HEPA-фильтрами в помещениях.',
      'Избегайте физических нагрузок на улице при плохом качестве воздуха.'
    ],
    quiz: [
      {
        question: 'Какие маски эффективны против PM2.5?',
        options: ['Тканевые маски', 'Медицинские маски', 'Маски N95/KN95'],
        correct: 2
      }
    ]
  },
  {
    id: 'aqi',
    title: '📊 Понимание индекса AQI',
    description: 'Научитесь читать и интерпретировать индекс качества воздуха',
    xpReward: 35,
    duration: '8 мин',
    content: [
      'AQI (Air Quality Index) — универсальная шкала от 0 до 500+ для оценки качества воздуха.',
      '0-50 (Хорошо): Воздух чистый, можно заниматься любой активностью.',
      '51-100 (Умеренно): Чувствительные люди могут ощущать дискомфорт.',
      '101-150 (Нездорово для чувствительных): Ограничьте длительные нагрузки на улице.',
      '151-200 (Нездорово): Всем рекомендуется сократить активность на улице.',
      '201-300 (Очень нездорово): Избегайте выхода на улицу без необходимости.',
      '300+ (Опасно): Оставайтесь дома, используйте очистители воздуха.'
    ],
    quiz: [
      {
        question: 'При каком AQI следует ограничить активность на улице?',
        options: ['0-50', '51-100', '101-150 и выше'],
        correct: 2
      }
    ]
  }
];

interface EcoLessonsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EcoLessonsDialog({ open, onOpenChange }: EcoLessonsDialogProps) {
  const { user } = useAuthContext();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentStep(0);
    setQuizAnswer(null);
  };

  const handleNextStep = () => {
    if (!selectedLesson) return;
    
    if (currentStep < selectedLesson.content.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleQuizAnswer = async (answerIndex: number) => {
    if (!selectedLesson || !user) return;
    
    setQuizAnswer(answerIndex);
    const isCorrect = answerIndex === selectedLesson.quiz[0].correct;
    
    if (isCorrect) {
      setIsSubmitting(true);
      try {
        // Award XP for completing the lesson
        await supabase.rpc('add_user_xp', {
          _user_id: user.id,
          _xp: selectedLesson.xpReward,
          _coins: Math.floor(selectedLesson.xpReward / 2),
          _action_type: 'eco_lesson',
          _description: `Урок: ${selectedLesson.title}`
        });
        
        setCompletedLessons([...completedLessons, selectedLesson.id]);
        toast.success(`Урок пройден! +${selectedLesson.xpReward} XP`);
      } catch (error) {
        console.error('Error awarding XP:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedLesson(null);
    setCurrentStep(0);
    setQuizAnswer(null);
  };

  const progress = selectedLesson 
    ? ((currentStep + 1) / (selectedLesson.content.length + 1)) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-secondary" />
            {selectedLesson ? selectedLesson.title : 'Эко-обучение'}
          </DialogTitle>
          <DialogDescription>
            {selectedLesson 
              ? `Шаг ${currentStep + 1} из ${selectedLesson.content.length + 1}` 
              : 'Изучайте экологию и зарабатывайте XP'
            }
          </DialogDescription>
        </DialogHeader>

        {selectedLesson ? (
          <div className="space-y-4 mt-4">
            <Progress value={progress} className="h-2" />
            
            {currentStep < selectedLesson.content.length ? (
              // Content step
              <div className="space-y-4">
                <div className="p-4 bg-secondary/10 rounded-xl">
                  <p className="text-sm leading-relaxed">
                    {selectedLesson.content[currentStep]}
                  </p>
                </div>
                
                <Button onClick={handleNextStep} className="w-full">
                  Далее
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              // Quiz step
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-xl">
                  <p className="font-medium mb-4">{selectedLesson.quiz[0].question}</p>
                  
                  <div className="space-y-2">
                    {selectedLesson.quiz[0].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuizAnswer(index)}
                        disabled={quizAnswer !== null || isSubmitting}
                        className={`w-full p-3 rounded-lg text-left text-sm transition-all ${
                          quizAnswer === null
                            ? 'bg-muted hover:bg-muted/80'
                            : index === selectedLesson.quiz[0].correct
                            ? 'bg-aqi-good/20 text-aqi-good border border-aqi-good'
                            : quizAnswer === index
                            ? 'bg-destructive/20 text-destructive border border-destructive'
                            : 'bg-muted opacity-50'
                        }`}
                      >
                        {option}
                        {quizAnswer !== null && index === selectedLesson.quiz[0].correct && (
                          <CheckCircle2 className="w-4 h-4 inline ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {quizAnswer !== null && (
                  <div className={`p-4 rounded-xl ${
                    quizAnswer === selectedLesson.quiz[0].correct 
                      ? 'bg-aqi-good/10 text-aqi-good' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {quizAnswer === selectedLesson.quiz[0].correct ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        <span>Правильно! +{selectedLesson.xpReward} XP</span>
                      </div>
                    ) : (
                      <span>Неправильно. Попробуйте ещё раз!</span>
                    )}
                  </div>
                )}

                <Button onClick={handleBackToList} variant="outline" className="w-full">
                  К списку уроков
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Lesson list
          <div className="space-y-3 mt-4">
            {LESSONS.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleStartLesson(lesson)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    isCompleted 
                      ? 'bg-aqi-good/10 border border-aqi-good/30' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium flex items-center gap-2">
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-aqi-good" />}
                      {lesson.title}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-aqi-good/20 text-aqi-good' : 'bg-primary/20 text-primary'
                    }`}>
                      {isCompleted ? 'Пройден' : `+${lesson.xpReward} XP`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">⏱️ {lesson.duration}</p>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
