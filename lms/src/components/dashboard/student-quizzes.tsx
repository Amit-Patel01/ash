"use client";

import { useState, useEffect } from "react";
import { Award, Timer, ChevronRight, BarChart3, Play, HelpCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { http } from "@/services/http";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  course: string;
  duration: number; // minutes
  questionsCount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  questions: Question[];
}

export function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [takingQuiz, setTakingQuiz] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch quizzes from backend MongoDB on mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const res: any = await http.get("/quizzes");
        const items = res?.items || [];
        const mapped = items.map((q: any) => ({
          id: q._id,
          title: q.title,
          course: q.courseId?.title || "Full Stack Web Development",
          duration: q.durationMinutes || 10,
          questionsCount: q.questions?.length || 0,
          difficulty: q.questions?.[0]?.difficulty 
            ? (q.questions[0].difficulty.charAt(0).toUpperCase() + q.questions[0].difficulty.slice(1)) 
            : "Intermediate",
          questions: (q.questions || []).map((qu: any) => ({
            id: qu._id,
            text: qu.prompt,
            options: (qu.options || []).map((o: any) => o.label),
            correctAnswer: (qu.options || []).findIndex((o: any) => o.isCorrect) >= 0 
              ? (qu.options || []).findIndex((o: any) => o.isCorrect) 
              : 0
          }))
        }));
        setQuizzes(mapped);
      } catch (err) {
        console.error("Failed to load quizzes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!takingQuiz || timeLeft <= 0) {
      if (takingQuiz && timeLeft === 0) {
        handleSubmitQuiz();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [takingQuiz, timeLeft]);

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setTakingQuiz(true);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setTimeLeft(quiz.duration * 60);
    setResult(null);
  };

  const handleSelectOption = (optionIdx: number) => {
    setAnswers({
      ...answers,
      [currentQuestionIdx]: optionIdx
    });
  };

  const handleNext = () => {
    if (!selectedQuiz) return;
    if (currentQuestionIdx < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    if (!selectedQuiz) return;
    setTakingQuiz(false);

    let correctCount = 0;
    selectedQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const total = selectedQuiz.questions.length;
    const scoreResult = {
      score: correctCount,
      total,
      percentage: total > 0 ? Math.round((correctCount / total) * 100) : 0
    };

    setResult(scoreResult);

    // Post quiz result to backend API
    http.post("/results", {
      quizId: selectedQuiz.id,
      score: correctCount,
      totalQuestions: total,
      percentage: scoreResult.percentage
    }).catch((err) => {
      console.error("Failed to post quiz result to DB", err);
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-xs text-slate-500 font-medium">Fetching assessments catalog...</span>
      </div>
    );
  }

  if (takingQuiz && selectedQuiz) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIdx];
    const progressPercent = selectedQuiz.questions.length > 0 
      ? Math.round(((currentQuestionIdx + 1) / selectedQuiz.questions.length) * 100) 
      : 100;

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-center bg-card border p-4 rounded-lg shadow-sm">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">{selectedQuiz.title}</h3>
            <div className="w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-rose-500 font-mono font-bold text-sm bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
            <Timer className="h-4 w-4 animate-pulse" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {currentQuestion ? (
          <Card className="border border-slate-200 dark:border-slate-800 shadow">
            <CardHeader className="p-6 border-b">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Question {currentQuestionIdx + 1} of {selectedQuiz.questions.length}</span>
                <span className="flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> MCQ</span>
              </div>
              <CardTitle className="text-base font-bold mt-2 leading-relaxed">
                {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 text-left text-xs font-medium rounded-lg border transition ${
                    answers[currentQuestionIdx] === idx
                      ? "bg-primary/5 border-primary text-primary font-semibold shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
                      answers[currentQuestionIdx] === idx
                        ? "bg-primary text-primary-foreground"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="p-8 text-center text-slate-400">No questions seeded in this quiz.</div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Select an option to enable proceeding.</p>
          <Button
            disabled={answers[currentQuestionIdx] === undefined}
            onClick={handleNext}
            className="text-xs font-semibold"
          >
            {currentQuestionIdx === selectedQuiz.questions.length - 1 ? "Submit Exam" : "Next Question"}
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  if (result && selectedQuiz) {
    return (
      <Card className="max-w-md mx-auto border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden bg-card">
        <CardHeader className="bg-primary/10 border-b p-6 text-center">
          <Award className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-lg font-bold">Quiz Results Submitted</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{selectedQuiz.title}</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/40">
              <p className="text-xs text-muted-foreground">Final Score</p>
              <p className="text-2xl font-bold mt-1 text-primary">{result.score} / {result.total}</p>
            </div>
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/40">
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold mt-1 text-emerald-500">{result.percentage}%</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider">Exam Summary Details</h4>
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Passing Mark</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">70%</span>
              </div>
              <div className="flex justify-between">
                <span>Attempt Status</span>
                <span className={`font-semibold ${result.percentage >= 70 ? "text-emerald-500" : "text-rose-500"}`}>
                  {result.percentage >= 70 ? "PASSED (Completed)" : "FAILED (Retake Allowed)"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setResult(null)} className="w-full text-xs font-semibold">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Quiz Catalog
            </Button>
            {result.percentage < 70 && (
              <Button onClick={() => handleStartQuiz(selectedQuiz)} className="w-full text-xs font-semibold">
                Retry Attempt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="border border-slate-200 dark:border-slate-800 bg-card hover:shadow transition">
            <CardHeader className="p-5">
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{quiz.difficulty}</span>
              <CardTitle className="text-base font-bold mt-1.5">{quiz.title}</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">{quiz.course}</p>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border">
                <div className="flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5 text-slate-400" /> {quiz.duration} mins
                </div>
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" /> {quiz.questionsCount} MCQs
                </div>
              </div>
              <Button onClick={() => handleStartQuiz(quiz)} className="w-full text-xs font-semibold" disabled={quiz.questionsCount === 0}>
                <Play className="h-3.5 w-3.5 mr-1.5 fill-primary-foreground" /> Begin Assessment
              </Button>
            </CardContent>
          </Card>
        ))}

        {quizzes.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 border border-dashed rounded-lg bg-card">
            <Award className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            No quizzes found in database. Seed the database to load live quizzes.
          </div>
        )}
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-5 bg-card">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" /> Global Performance Leaderboard
        </h3>
        <div className="space-y-2.5">
          {[
            { rank: "🏆 #1", name: "Rohan Gupta", score: "100%", time: "3m 42s" },
            { rank: "🥈 #2", name: "Simran Kaur", score: "100%", time: "4m 12s" },
            { rank: "🥉 #3", name: "Anish Dev", score: "92%", time: "5m 01s" }
          ].map((leader, i) => (
            <div key={i} className="flex justify-between items-center border-b pb-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-600 w-8">{leader.rank}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{leader.name}</span>
              </div>
              <div className="flex gap-4 text-slate-400 font-mono">
                <span>{leader.score}</span>
                <span>{leader.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default StudentQuizzes;
