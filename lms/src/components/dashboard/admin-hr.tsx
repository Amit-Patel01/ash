"use client";

import { useState, useEffect } from "react";
import { BriefcaseBusiness, Search, Plus, Edit2, Trash2, Mail, Phone, Check, X, Loader2, Building, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { http } from "@/services/http";

interface HrRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  designation: string;
  hiringDomains: string[];
  isPartner: boolean;
  status: "Active" | "Inactive";
  createdAt: string;
}

export function AdminHr() {
  const [hrRecords, setHrRecords] = useState<HrRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [currentId, setCurrentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [hiringDomains, setHiringDomains] = useState("");
  const [isPartner, setIsPartner] = useState(false);
  const [status, setStatus] = useState<HrRecord["status"]>("Active");
  const [message, setMessage] = useState<string | null>(null);

  const fetchHr = async () => {
    setLoading(true);
    try {
      const res: any = await http.get("/hr");
      if (res && res.items) {
        const dbHr = res.items.map((item: any) => ({
          id: item._id,
          name: item.userId?.name || "HR Name",
          email: item.userId?.email || "hr@example.com",
          phone: item.userId?.phone || "",
          companyName: item.companyName || "N/A",
          designation: item.designation || "HR Executive",
          hiringDomains: item.hiringDomains || [],
          isPartner: item.isPartner || false,
          status: item.userId?.isActive ? "Active" : "Inactive",
          createdAt: new Date(item.createdAt || Date.now()).toISOString().slice(0, 10)
        }));
        setHrRecords(dbHr);
      }
    } catch (err) {
      console.error("Failed to load HR partners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHr();
  }, []);

  const filteredHr = hrRecords.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase()) ||
      h.companyName.toLowerCase().includes(search.toLowerCase()) ||
      h.hiringDomains.some((dom) => dom.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = (hr: HrRecord) => {
    setCurrentId(hr.id);
    setName(hr.name);
    setEmail(hr.email);
    setPhone(hr.phone);
    setCompanyName(hr.companyName);
    setDesignation(hr.designation);
    setHiringDomains(hr.hiringDomains.join(", "));
    setIsPartner(hr.isPartner);
    setStatus(hr.status);
    setIsEditing(true);
    setIsCreating(false);
    setMessage(null);
  };

  const handleCreateNew = () => {
    setCurrentId("");
    setName("");
    setEmail("");
    setPhone("");
    setCompanyName("");
    setDesignation("HR Manager");
    setHiringDomains("Software Engineering, Web Development");
    setIsPartner(true);
    setStatus("Active");
    setIsCreating(true);
    setIsEditing(false);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this HR partner record?")) return;
    try {
      await http.delete(`/hr/${id}`);
      setHrRecords(hrRecords.filter((h) => h.id !== id));
    } catch (err: any) {
      alert("Error deleting HR: " + (err.message || "Failed"));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const domainsList = hiringDomains.split(",").map((s) => s.trim()).filter(Boolean);

    if (isEditing) {
      setHrRecords(
        hrRecords.map((h) =>
          h.id === currentId
            ? { ...h, name, email, phone, companyName, designation, hiringDomains: domainsList, isPartner, status }
            : h
        )
      );
      try {
        await http.patch(`/hr/${currentId}`, {
          name,
          email,
          phone,
          companyName,
          designation,
          hiringDomains: domainsList,
          isPartner,
          status
        });
        setMessage("HR record updated successfully!");
      } catch (err: any) {
        setMessage("Error updating HR: " + (err.message || "Failed"));
      }
      setTimeout(() => {
        setIsEditing(false);
        setMessage(null);
        fetchHr();
      }, 1200);
    } else {
      try {
        const res: any = await http.post("/hr", {
          name,
          email,
          phone,
          companyName,
          designation,
          hiringDomains: domainsList,
          isPartner,
          status
        });
        const newHr: HrRecord = {
          id: res._id || "hr-" + (hrRecords.length + 1),
          name: res.userId?.name || name,
          email: res.userId?.email || email,
          phone: res.userId?.phone || phone,
          companyName: res.companyName || companyName,
          designation: res.designation || designation,
          hiringDomains: res.hiringDomains || domainsList,
          isPartner: res.isPartner || isPartner,
          status: res.userId?.isActive ? "Active" : "Inactive",
          createdAt: new Date(res.createdAt || Date.now()).toISOString().slice(0, 10)
        };
        setHrRecords([newHr, ...hrRecords]);
        setMessage("HR registered successfully!");
      } catch (err: any) {
        setMessage("Error registering HR: " + (err.message || "Failed"));
      }
      setTimeout(() => {
        setIsCreating(false);
        setMessage(null);
        fetchHr();
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {isEditing || isCreating ? (
        <Card className="max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 shadow">
          <CardHeader className="p-6 border-b flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-bold">{isEditing ? "Edit HR Details" : "Register Corporate HR Partner"}</CardTitle>
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
                  <label className="text-xs font-semibold text-slate-500 uppercase">HR Manager Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 99999 88888" className="text-xs" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="jane@company.com" className="text-xs" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Company Name</label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Google Inc." className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Designation</label>
                  <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Talent Acquisition Partner" className="text-xs" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Hiring Domains (comma separated)</label>
                <Input value={hiringDomains} onChange={(e) => setHiringDomains(e.target.value)} placeholder="Frontend React, Backend Java, UI/UX" className="text-xs" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Corporate Partner Status</label>
                  <div className="flex gap-2 h-10 items-center">
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPartner}
                        onChange={(e) => setIsPartner(e.target.checked)}
                        className="accent-primary h-4 w-4"
                      />
                      Mark as Official Hiring Partner
                    </label>
                  </div>
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
                  Save HR Partner
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
                placeholder="Search HR by name, company, email or domain..."
              />
            </div>
            <Button onClick={handleCreateNew} className="text-xs h-9 px-3 font-semibold shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Add New HR Partner
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
                    <th className="p-4 font-semibold text-slate-500">HR Info</th>
                    <th className="p-4 font-semibold text-slate-500">Company & Role</th>
                    <th className="p-4 font-semibold text-slate-500">Hiring Domains</th>
                    <th className="p-4 font-semibold text-slate-500">Partner Status</th>
                    <th className="p-4 font-semibold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHr.map((h) => (
                    <tr key={h.id} className="border-b hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center font-bold">
                            {h.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{h.name}</p>
                            <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                              <Mail className="h-3 w-3" /> <span className="text-[10px]">{h.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{h.companyName}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{h.designation}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {h.hiringDomains.map((dom, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded px-1.5 py-0.5 text-[9px] font-semibold">
                              {dom}
                            </span>
                          ))}
                          {h.hiringDomains.length === 0 && <span className="text-slate-400 italic">None</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        {h.isPartner ? (
                          <span className="inline-flex items-center gap-1 font-semibold rounded text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="h-3.5 w-3.5" /> Hiring Partner
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold rounded text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Regular HR
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-2">
                          <Button onClick={() => handleEdit(h)} variant="outline" className="h-7 w-7 p-0 text-slate-400 hover:text-primary">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button onClick={() => handleDelete(h.id)} variant="outline" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredHr.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        <BriefcaseBusiness className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        No HR partner records found matching search filters.
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
export default AdminHr;
