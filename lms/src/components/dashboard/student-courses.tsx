"use client";

import { useState, useEffect } from "react";
import { BookOpen, Video, FileText, CheckCircle2, Play, Award, MessageCircle, Star, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { http } from "@/services/http";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl: string;
  notes: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface DetailedCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  enrolled: number;
  modules: Module[];
}

export function StudentCourses({ courseId }: { courseId?: string }) {
  const [courses, setCourses] = useState<DetailedCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<DetailedCourse | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [rated, setRated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syllabusLoading, setSyllabusLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res: any = await http.get("/courses");
        const items = res?.items || [];
        const mapped = items.map((c: any) => ({
          id: c._id,
          title: c.title,
          description: c.description,
          instructor: c.mentorIds?.[0]?.userId?.name || "Rohan Gupta (Mentor)",
          rating: c.ratingAverage || 5,
          enrolled: c.ratingCount || 10,
          modules: []
        }));
        setCourses(mapped);
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseSelect = async (course: DetailedCourse) => {
    setSyllabusLoading(true);
    try {
      const res: any = await http.get(`/courses/${course.id}`);
      if (res) {
        const fullCourse: DetailedCourse = {
          id: res._id,
          title: res.title,
          description: res.description,
          instructor: res.mentorIds?.[0]?.userId?.name || "Rohan Gupta (Mentor)",
          rating: res.ratingAverage || 5,
          enrolled: res.ratingCount || 10,
          modules: (res.modules || []).map((m: any) => ({
            id: m._id,
            title: m.title,
            lessons: (m.lessons || []).map((l: any) => ({
              id: l._id,
              title: l.title,
              duration: `${l.durationMinutes || 0} mins`,
              completed: false,
              videoUrl: l.videoUrl || "",
              notes: l.content || ""
            }))
          }))
        };
        setSelectedCourse(fullCourse);
        setActiveLesson(fullCourse.modules[0]?.lessons[0] || null);
      }
    } catch (err) {
      console.error("Failed to load syllabus", err);
    } finally {
      setSyllabusLoading(false);
    }
    setComments([]);
    setRated(false);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, newComment]);
    setNewComment("");
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-xs text-slate-500 font-medium">Fetching courses catalog...</span>
      </div>
    );
  }

  if (syllabusLoading) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-xs text-slate-500 font-medium">Loading syllabus, modules and lessons...</span>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
          const completedLessons = course.modules.reduce(
            (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
            0
          );
          const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          return (
            <Card key={course.id} className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-card shadow hover:shadow-md transition">
              <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 p-5">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Rating {course.rating} ★
                  </span>
                  <span className="text-xs text-muted-foreground">{course.enrolled} Reviews</span>
                </div>
                <CardTitle className="mt-3 text-lg font-bold line-clamp-1">{course.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Instructor: {course.instructor}</p>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Course Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
                <Button onClick={() => handleCourseSelect(course)} className="w-full text-xs font-semibold">
                  <Play className="h-3 w-3 mr-1" /> Continue Learning
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {courses.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400">
            <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            No courses found in database. Seed the database to view live courses.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setSelectedCourse(null)} className="h-8 text-xs px-3">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
        </Button>
        <h2 className="text-xl font-bold tracking-tight">{selectedCourse.title}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main Work Area: Video Player & Tabs */}
        <div className="space-y-6">
          <Card className="overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-lg relative group">
            {activeLesson && activeLesson.videoUrl ? (
              <video
                key={activeLesson.id}
                src={activeLesson.videoUrl}
                controls
                className="w-full h-full object-cover"
                poster="/images/ash-lms-hero.png"
              />
            ) : (
              <div className="text-center text-slate-400 p-6">
                <Video className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                <p>Select a lesson from the syllabus to begin learning.</p>
              </div>
            )}
          </Card>

          {activeLesson && (
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardHeader className="border-b p-5">
                <CardTitle className="text-lg font-bold">{activeLesson.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Lesson Resource Materials & Study Notes</p>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-2.5 p-3.5 bg-slate-100 dark:bg-slate-900 rounded-lg">
                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Study Notes:</p>
                    <p className="text-xs leading-relaxed text-slate-500">{activeLesson.notes}</p>
                  </div>
                </div>

                {/* Rating & Review */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold mb-2">Rate this Course</h3>
                  {rated ? (
                    <p className="text-xs text-emerald-500 font-medium">Thank you for rating this course!</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setRating(star)}>
                            <Star className={`h-5 w-5 ${star <= rating ? "fill-primary text-primary" : "text-slate-300"}`} />
                          </button>
                        ))}
                      </div>
                      <Button onClick={() => setRated(true)} className="text-xs h-8 px-3">Submit Rating</Button>
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-slate-500" /> Discussion Panel
                  </h3>
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question or add a note..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 h-9 rounded-md border border-slate-200 dark:border-slate-800 px-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button type="submit" className="h-9 px-4 text-xs font-semibold">Post</Button>
                  </form>
                  <div className="space-y-2">
                    {comments.map((comment, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded border text-xs">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">You (Student)</p>
                        <p className="text-slate-500 mt-1 leading-relaxed">{comment}</p>
                      </div>
                    ))}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded border text-xs">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Amit Patel (Instructor)</p>
                      <p className="text-slate-500 mt-1 leading-relaxed">
                        Welcome to the cohort! Let me know if you run into any dependency issues during registration.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Modules & Lessons */}
        <div className="space-y-4">
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Syllabus Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedCourse.modules.map((mod) => (
                <div key={mod.id} className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{mod.title}</h4>
                  <div className="grid gap-1">
                    {mod.lessons.map((les) => (
                      <button
                        key={les.id}
                        onClick={() => setActiveLesson(les)}
                        className={`flex items-center justify-between text-left p-2.5 rounded-lg border text-xs transition ${
                          activeLesson?.id === les.id
                            ? "bg-primary/5 border-primary/40 text-primary font-medium"
                            : "border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {les.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Video className="h-4 w-4 text-slate-400 shrink-0" />
                          )}
                          <span className="line-clamp-1">{les.title}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{les.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
