"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Search, Plus, Edit2, Trash2, Mail, Phone, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { http } from "@/services/http";

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  cohort: string;
  course: string;
  status: "Active" | "Inactive" | "Completed";
  enrollmentDate: string;
}

const initialStudents: StudentRecord[] = [];

export function AdminStudents() {
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [currentId, setCurrentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cohort, setCohort] = useState("May 2026");
  const [course, setCourse] = useState("Full Stack Web Development");
  const [status, setStatus] = useState<StudentRecord["status"]>("Active");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res: any = await http.get("/students");
        if (res && res.items) {
          const dbStudents = res.items.map((st: any) => ({
            id: st._id,
            name: st.userId?.name || "Student Name",
            email: st.userId?.email || "student@example.com",
            phone: st.userId?.phone || "+91 98765 43210",
            cohort: st.cohort || "May 2026",
            course: "Full Stack Web Development",
            status: st.userId?.isActive ? "Active" : "Inactive",
            enrollmentDate: new Date(st.createdAt || Date.now()).toISOString().slice(0, 10)
          }));
          setStudents(dbStudents);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error("Failed to load students", err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (student: StudentRecord) => {
    setCurrentId(student.id);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setCohort(student.cohort);
    setCourse(student.course);
    setStatus(student.status);
    setIsEditing(true);
    setIsCreating(false);
    setMessage(null);
  };

  const handleCreateNew = () => {
    setCurrentId("");
    setName("");
    setEmail("");
    setPhone("");
    setCohort("June 2026");
    setCourse("Full Stack Web Development");
    setStatus("Active");
    setIsCreating(true);
    setIsEditing(false);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student record?")) return;
    try {
      await http.delete(`/students/${id}`);
      setStudents(students.filter((s) => s.id !== id));
    } catch (err: any) {
      alert("Error deleting student: " + (err.message || "Failed"));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (isEditing) {
      setStudents(
        students.map((s) =>
          s.id === currentId
            ? { ...s, name, email, phone, cohort, course, status }
            : s
        )
      );
      try {
        await http.patch(`/students/${currentId}`, { name, email, phone, cohort, status });
        setMessage("Student record updated successfully!");
      } catch (err: any) {
        setMessage("Error updating student: " + (err.message || "Failed"));
      }
      setTimeout(() => {
        setIsEditing(false);
        setMessage(null);
      }, 1200);
    } else {
      try {
        const res: any = await http.post("/students", { name, email, phone, cohort, status });
        const newStudent: StudentRecord = {
          id: res._id || "st-" + (students.length + 1),
          name: res.userId?.name || name,
          email: res.userId?.email || email,
          phone: res.userId?.phone || phone,
          cohort: res.cohort || cohort,
          course,
          status: res.userId?.isActive ? "Active" : "Inactive",
          enrollmentDate: new Date(res.createdAt || Date.now()).toISOString().slice(0, 10)
        };
        setStudents([newStudent, ...students]);
        setMessage("Student created successfully!");
      } catch (err: any) {
        setMessage("Error creating student: " + (err.message || "Failed"));
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
            <CardTitle className="text-lg font-bold">{isEditing ? "Edit Student Details" : "Register New Student"}</CardTitle>
            <Button variant="outline" onClick={() => { setIsEditing(false); setIsCreating(false); }} className="h-8 px-2">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {message && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>{message}</span>
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Student Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="text-xs" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="john@example.com" className="text-xs" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Selected Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 px-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Full Stack Web Development">Full Stack Web Development</option>
                    <option value="Data Analytics Internship Track">Data Analytics Internship Track</option>
                    <option value="AI Interview Preparation">AI Interview Preparation</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Cohort Batch</label>
                  <Input value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="June 2026" className="text-xs" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Account Status</label>
                <div className="flex gap-4">
                  {(["Active", "Inactive", "Completed"] as const).map((s) => (
                    <label key={s} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="status"
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
                  Save Student
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
                placeholder="Search students by name, email or course..."
              />
            </div>
            <Button onClick={handleCreateNew} className="text-xs h-9 px-3 font-semibold shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Add New Student
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
                    <th className="p-4 font-semibold text-slate-500">Student Info</th>
                    <th className="p-4 font-semibold text-slate-500">Contact details</th>
                    <th className="p-4 font-semibold text-slate-500">Course & Cohort</th>
                    <th className="p-4 font-semibold text-slate-500">Status</th>
                    <th className="p-4 font-semibold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="border-b hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center font-bold">
                            {st.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{st.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Enrolled: {st.enrollmentDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="h-3.5 w-3.5" /> {st.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="h-3.5 w-3.5" /> {st.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{st.course}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Batch: {st.cohort}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-semibold rounded text-[9px] px-2 py-0.5 ${
                          st.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : st.status === "Inactive"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {st.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-2">
                          <Button onClick={() => handleEdit(st)} variant="outline" className="h-7 w-7 p-0 text-slate-400 hover:text-primary">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button onClick={() => handleDelete(st.id)} variant="outline" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        <GraduationCap className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        No student records found matching search filters.
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
