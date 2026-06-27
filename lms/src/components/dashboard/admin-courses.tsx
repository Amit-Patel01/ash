"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search, Plus, Edit2, Trash2, Video, ChevronDown, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { http } from "@/services/http";

interface CourseRecord {
  id: string;
  title: string;
  category: string;
  price: string;
  status: "Published" | "Draft";
  modulesCount: number;
  lessonsCount: number;
}

const initialCourses: CourseRecord[] = [];

export function AdminCourses() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [currentId, setCurrentId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Software Development");
  const [price, setPrice] = useState("₹19,999");
  const [status, setStatus] = useState<CourseRecord["status"]>("Published");
  const [modulesCount, setModulesCount] = useState(2);
  const [lessonsCount, setLessonsCount] = useState(10);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res: any = await http.get("/courses");
        if (res && res.items) {
          const dbCourses = res.items.map((c: any) => ({
            id: c._id,
            title: c.title,
            category: c.category || "Software Development",
            price: "₹" + Number(c.price || 0).toLocaleString("en-IN"),
            status: c.status === "published" ? "Published" : "Draft",
            modulesCount: c.modules?.length || 0,
            lessonsCount: c.lessons?.length || 0
          }));
          setCourses(dbCourses);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Failed to load courses", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (course: CourseRecord) => {
    setCurrentId(course.id);
    setTitle(course.title);
    setCategory(course.category);
    setPrice(course.price);
    setStatus(course.status);
    setModulesCount(course.modulesCount);
    setLessonsCount(course.lessonsCount);
    setIsEditing(true);
    setIsCreating(false);
    setMessage(null);
  };

  const handleCreateNew = () => {
    setCurrentId("");
    setTitle("");
    setCategory("Software Development");
    setPrice("19999");
    setStatus("Published");
    setModulesCount(2);
    setLessonsCount(10);
    setIsCreating(true);
    setIsEditing(false);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    
    // If it is a dummy course ID (not a valid 24-char ObjectId), delete it locally only
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      setCourses(courses.filter((c) => c.id !== id));
      return;
    }

    try {
      await http.delete(`/courses/${id}`);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err: any) {
      alert("Error deleting course: " + (err.message || "Failed"));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const priceNum = Number(price.replace(/[^0-9]/g, "")) || 0;
    const courseStatus = status === "Published" ? "published" : "draft";

    if (isEditing) {
      setCourses(
        courses.map((c) =>
          c.id === currentId
            ? { ...c, title, category, price: "₹" + priceNum.toLocaleString("en-IN"), status, modulesCount, lessonsCount }
            : c
        )
      );

      // If it is a dummy course ID, update locally only without backend API call
      if (!/^[0-9a-fA-F]{24}$/.test(currentId)) {
        setMessage("Course updated successfully!");
        setTimeout(() => {
          setIsEditing(false);
          setMessage(null);
        }, 1200);
        return;
      }

      try {
        await http.patch(`/courses/${currentId}`, { title, category, price: priceNum, status: courseStatus });
        setMessage("Course updated successfully!");
      } catch (err: any) {
        setMessage("Error updating course: " + (err.message || "Failed"));
      }
      setTimeout(() => {
        setIsEditing(false);
        setMessage(null);
      }, 1200);
    } else {
      try {
        const res: any = await http.post("/courses", {
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: "Course built from Admin Dashboard",
          category,
          price: priceNum,
          status: courseStatus
        });
        const newCourse: CourseRecord = {
          id: res._id || "c-" + (courses.length + 1),
          title: res.title || title,
          category: res.category || category,
          price: "₹" + Number(res.price || 0).toLocaleString("en-IN"),
          status: res.status === "published" ? "Published" : "Draft",
          modulesCount: 0,
          lessonsCount: 0
        };
        setCourses([newCourse, ...courses]);
        setMessage("Course created successfully!");
      } catch (err: any) {
        setMessage("Error creating course: " + (err.message || "Failed"));
      }
      setTimeout(() => {
        setIsCreating(false);
        setMessage(null);
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {isEditing || isCreating ? (
        <Card className="max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 shadow">
          <CardHeader className="p-6 border-b flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-bold">{isEditing ? "Edit Course Syllabus" : "Build New Course"}</CardTitle>
            <Button variant="outline" onClick={() => { setIsEditing(false); setIsCreating(false); }} className="h-8 px-2">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {message && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <X className="h-4 w-4 text-emerald-500" />
                <span>{message}</span>
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Course Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="React 19 Complete Masterclass" className="text-xs" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 px-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="AI & Career">AI & Career</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Pricing Option (INR)</label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="19999" className="text-xs" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Modules Count</label>
                  <Input type="number" value={modulesCount} onChange={(e) => setModulesCount(Number(e.target.value))} className="text-xs" required disabled={!isCreating} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Lessons Count</label>
                  <Input type="number" value={lessonsCount} onChange={(e) => setLessonsCount(Number(e.target.value))} className="text-xs" required disabled={!isCreating} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Publish State</label>
                <div className="flex gap-4">
                  {(["Published", "Draft"] as const).map((s) => (
                    <label key={s} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="course-status"
                        checked={status === s}
                        onChange={() => setStatus(s)}
                        className="accent-primary h-3.5 w-3.5"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setIsCreating(false); }} className="text-xs h-9 px-4">
                  Cancel
                </Button>
                <Button type="submit" className="text-xs h-9 px-4 font-semibold">
                  Save Course
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-slate-200 dark:border-slate-800 shadow">
          <CardHeader className="p-5 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
                placeholder="Search courses..."
              />
            </div>
            <Button onClick={handleCreateNew} className="text-xs h-9 px-3 font-semibold shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Add New Course
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {loading && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-xs text-slate-500">Syncing with database...</span>
              </div>
            )}
            {!loading && (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b">
                    <th className="p-4 font-semibold text-slate-500">Course Syllabus Info</th>
                    <th className="p-4 font-semibold text-slate-500">Category</th>
                    <th className="p-4 font-semibold text-slate-500">Price</th>
                    <th className="p-4 font-semibold text-slate-500">Syllabus Details</th>
                    <th className="p-4 font-semibold text-slate-500">Status</th>
                    <th className="p-4 font-semibold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center font-bold">
                            C
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{c.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">ID: {c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{c.category}</td>
                      <td className="p-4 font-mono font-semibold">{c.price}</td>
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400 rotate-270" /> {c.modulesCount} Modules
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Video className="h-3.5 w-3.5 text-slate-400" /> {c.lessonsCount} Video Lessons
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-semibold rounded text-[9px] px-2 py-0.5 ${
                          c.status === "Published"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-2">
                          <Button onClick={() => handleEdit(c)} variant="outline" className="h-7 w-7 p-0 text-slate-400 hover:text-primary">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button onClick={() => handleDelete(c.id)} variant="outline" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <BookOpen className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        No course records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
