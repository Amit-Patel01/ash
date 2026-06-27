"use client";

import { useState, useEffect } from "react";
import { UsersRound, Search, Plus, Edit2, Trash2, Mail, Phone, Check, X, Loader2, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { http } from "@/services/http";

interface MentorRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string[];
  bio: string;
  availability: "available" | "limited" | "unavailable";
  rating: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export function AdminMentors() {
  const [mentors, setMentors] = useState<MentorRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [currentId, setCurrentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState<MentorRecord["availability"]>("available");
  const [status, setStatus] = useState<MentorRecord["status"]>("Active");
  const [message, setMessage] = useState<string | null>(null);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res: any = await http.get("/mentors");
      if (res && res.items) {
        const dbMentors = res.items.map((mt: any) => ({
          id: mt._id,
          name: mt.userId?.name || "Mentor Name",
          email: mt.userId?.email || "mentor@example.com",
          phone: mt.userId?.phone || "",
          expertise: mt.expertise || [],
          bio: mt.bio || "",
          availability: mt.availability || "available",
          rating: mt.rating || 5,
          status: mt.userId?.isActive ? "Active" : "Inactive",
          createdAt: new Date(mt.createdAt || Date.now()).toISOString().slice(0, 10)
        }));
        setMentors(dbMentors);
      }
    } catch (err) {
      console.error("Failed to load mentors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.expertise.some((exp) => exp.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = (mentor: MentorRecord) => {
    setCurrentId(mentor.id);
    setName(mentor.name);
    setEmail(mentor.email);
    setPhone(mentor.phone);
    setExpertise(mentor.expertise.join(", "));
    setBio(mentor.bio);
    setAvailability(mentor.availability);
    setStatus(mentor.status);
    setIsEditing(true);
    setIsCreating(false);
    setMessage(null);
  };

  const handleCreateNew = () => {
    setCurrentId("");
    setName("");
    setEmail("");
    setPhone("");
    setExpertise("React, Node.js, System Design");
    setBio("");
    setAvailability("available");
    setStatus("Active");
    setIsCreating(true);
    setIsEditing(false);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mentor record?")) return;
    try {
      await http.delete(`/mentors/${id}`);
      setMentors(mentors.filter((m) => m.id !== id));
    } catch (err: any) {
      alert("Error deleting mentor: " + (err.message || "Failed"));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const expertiseList = expertise.split(",").map((s) => s.trim()).filter(Boolean);

    if (isEditing) {
      setMentors(
        mentors.map((m) =>
          m.id === currentId
            ? { ...m, name, email, phone, expertise: expertiseList, bio, availability, status }
            : m
        )
      );
      try {
        await http.patch(`/mentors/${currentId}`, {
          name,
          email,
          phone,
          expertise: expertiseList,
          bio,
          availability,
          status
        });
        setMessage("Mentor record updated successfully!");
      } catch (err: any) {
        setMessage("Error updating mentor: " + (err.message || "Failed"));
      }
      setTimeout(() => {
        setIsEditing(false);
        setMessage(null);
        fetchMentors();
      }, 1200);
    } else {
      try {
        const res: any = await http.post("/mentors", {
          name,
          email,
          phone,
          expertise: expertiseList,
          bio,
          availability,
          status
        });
        const newMentor: MentorRecord = {
          id: res._id || "mt-" + (mentors.length + 1),
          name: res.userId?.name || name,
          email: res.userId?.email || email,
          phone: res.userId?.phone || phone,
          expertise: res.expertise || expertiseList,
          bio: res.bio || bio,
          availability: res.availability || availability,
          rating: res.rating || 5,
          status: res.userId?.isActive ? "Active" : "Inactive",
          createdAt: new Date(res.createdAt || Date.now()).toISOString().slice(0, 10)
        };
        setMentors([newMentor, ...mentors]);
        setMessage("Mentor registered successfully!");
      } catch (err: any) {
        setMessage("Error registering mentor: " + (err.message || "Failed"));
      }
      setTimeout(() => {
        setIsCreating(false);
        setMessage(null);
        fetchMentors();
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {isEditing || isCreating ? (
        <Card className="max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 shadow">
          <CardHeader className="p-6 border-b flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-bold">{isEditing ? "Edit Mentor Details" : "Register New Mentor"}</CardTitle>
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
                  <label className="text-xs font-semibold text-slate-500 uppercase">Mentor Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 99999 88888" className="text-xs" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="jane@example.com" className="text-xs" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Expertise Areas (comma separated)</label>
                <Input value={expertise} onChange={(e) => setExpertise(e.target.value)} placeholder="React, Next.js, TypeScript" className="text-xs" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Mentor Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about their background..."
                  rows={3}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 p-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as any)}
                    className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 px-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="available">Available (Full)</option>
                    <option value="limited">Limited</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Account Status</label>
                  <div className="flex gap-4 h-10 items-center">
                    {(["Active", "Inactive"] as const).map((s) => (
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
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setIsCreating(false); }} className="text-xs h-9 px-4">
                  Cancel
                </Button>
                <Button type="submit" className="text-xs h-9 px-4 font-semibold">
                  Save Mentor
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
                placeholder="Search mentors by name, email or expertise..."
              />
            </div>
            <Button onClick={handleCreateNew} className="text-xs h-9 px-3 font-semibold shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Add New Mentor
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
                    <th className="p-4 font-semibold text-slate-500">Mentor Info</th>
                    <th className="p-4 font-semibold text-slate-500">Contact Details</th>
                    <th className="p-4 font-semibold text-slate-500">Expertise</th>
                    <th className="p-4 font-semibold text-slate-500">Availability</th>
                    <th className="p-4 font-semibold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMentors.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center font-bold">
                            {m.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{m.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] font-semibold text-slate-500">{m.rating}/5 rating</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="h-3.5 w-3.5" /> {m.email}
                        </div>
                        {m.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="h-3.5 w-3.5" /> {m.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {m.expertise.map((exp, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded px-1.5 py-0.5 text-[9px] font-semibold">
                              {exp}
                            </span>
                          ))}
                          {m.expertise.length === 0 && <span className="text-slate-400 italic">None</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-semibold rounded text-[9px] px-2 py-0.5 ${
                          m.availability === "available"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : m.availability === "limited"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}>
                          {m.availability.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-2">
                          <Button onClick={() => handleEdit(m)} variant="outline" className="h-7 w-7 p-0 text-slate-400 hover:text-primary">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button onClick={() => handleDelete(m.id)} variant="outline" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredMentors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        <UsersRound className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        No mentor records found matching search filters.
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
export default AdminMentors;
