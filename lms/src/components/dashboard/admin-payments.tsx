"use client";

import { useState, useEffect } from "react";
import { BadgeIndianRupee, Search, Plus, Download, Landmark, CreditCard, Check, RefreshCw, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { http } from "@/services/http";

interface PaymentRecord {
  id: string;
  orderId: string;
  studentName: string;
  amount: string;
  method: "UPI" | "Net Banking" | "Credit Card" | "Debit Card";
  status: "Captured" | "Pending" | "Refunded";
  timestamp: string;
}

const initialPayments: PaymentRecord[] = [];

export function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [loading, setLoading] = useState(false);

  // Invoice Form states
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentRecord["method"]>("UPI");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch payments on mount
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res: any = await http.get("/payments");
        if (res && res.items) {
          const dbPayments = res.items.map((p: any) => ({
            id: p._id,
            orderId: p.providerOrderId || "order_manual_" + p._id.slice(-8),
            studentName: p.studentId?.userId?.name || "Student Name",
            amount: "₹" + Number(p.amount || 0).toLocaleString("en-IN"),
            method: p.provider === "manual" ? "Net Banking" : "UPI",
            status: p.status === "paid" ? "Captured" : p.status === "refunded" ? "Refunded" : "Pending",
            timestamp: new Date(p.createdAt || Date.now()).toLocaleString()
          }));
          setPayments(dbPayments);
        } else {
          setPayments([]);
        }
      } catch (err) {
        console.error("Failed to fetch payments", err);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Fetch students for dropdown when invoice modal is opened
  useEffect(() => {
    if (!isCreatingInvoice) return;
    const fetchStudentsForInvoice = async () => {
      try {
        const res: any = await http.get("/students");
        if (res && res.items) {
          setStudentsList(res.items);
          if (res.items.length > 0) {
            setSelectedStudentId(res.items[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load students", err);
      }
    };
    fetchStudentsForInvoice();
  }, [isCreatingInvoice]);

  const filteredPayments = payments.filter(
    (p) =>
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.orderId.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefund = async (id: string) => {
    if (!confirm("Are you sure you want to trigger a refund for this transaction?")) return;
    try {
      await http.patch(`/payments/${id}`, { status: "refunded" });
      setPayments(
        payments.map((p) => (p.id === id ? { ...p, status: "Refunded" as const } : p))
      );
    } catch (err: any) {
      alert("Failed to refund: " + (err.message || "Error"));
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !amount) return;

    try {
      const priceNum = Number(amount) || 0;
      const res: any = await http.post("/payments", {
        studentId: selectedStudentId,
        amount: priceNum,
        currency: "INR",
        provider: "manual",
        status: "paid",
        paidAt: new Date()
      });

      const selectedStudent = studentsList.find((s) => s._id === selectedStudentId);

      const newPayment: PaymentRecord = {
        id: res._id || "pay-" + (payments.length + 1),
        orderId: res.providerOrderId || "order_manual_" + (res._id ? res._id.slice(-8) : "GEN"),
        studentName: selectedStudent?.userId?.name || "Student Name",
        amount: "₹" + priceNum.toLocaleString("en-IN"),
        method: "Net Banking",
        status: "Captured",
        timestamp: new Date().toLocaleString()
      };

      setPayments([newPayment, ...payments]);
      setSuccessMsg("Invoice and manual order generated successfully!");
    } catch (err: any) {
      setSuccessMsg("Error creating payment: " + (err.message || "Failed"));
    }

    setTimeout(() => {
      setIsCreatingInvoice(false);
      setSuccessMsg(null);
      setAmount("");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {isCreatingInvoice ? (
        <Card className="max-w-md mx-auto border border-slate-200 dark:border-slate-800 shadow">
          <CardHeader className="p-6 border-b flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-bold">Generate Manual Order & Invoice</CardTitle>
            <Button variant="outline" onClick={() => setIsCreatingInvoice(false)} className="h-8 px-2">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {successMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 px-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  {studentsList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.userId?.name || "Student"} ({s.userId?.email})
                    </option>
                  ))}
                  {studentsList.length === 0 && (
                    <option value="">No students in database (create one first)</option>
                  )}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Amount (INR)</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="19999" className="text-xs" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Preferred Gateway Option</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 px-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreatingInvoice(false)} className="text-xs h-9 px-4">
                  Cancel
                </Button>
                <Button type="submit" className="text-xs h-9 px-4 font-semibold" disabled={studentsList.length === 0}>
                  Generate Order
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
                placeholder="Search transaction order IDs or student name..."
              />
            </div>
            <Button onClick={() => setIsCreatingInvoice(true)} className="text-xs h-9 px-3 font-semibold shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Create Invoice
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
                    <th className="p-4 font-semibold text-slate-500">Order ID & Date</th>
                    <th className="p-4 font-semibold text-slate-500">Student Name</th>
                    <th className="p-4 font-semibold text-slate-500">Gateway Method</th>
                    <th className="p-4 font-semibold text-slate-500">Amount</th>
                    <th className="p-4 font-semibold text-slate-500">Status</th>
                    <th className="p-4 font-semibold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{p.orderId}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.timestamp}</p>
                      </td>
                      <td className="p-4 font-semibold">{p.studentName}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1">
                          {p.method === "UPI" && <Landmark className="h-3.5 w-3.5 text-primary" />}
                          {p.method !== "UPI" && <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />}
                          {p.method}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">{p.amount}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-semibold rounded text-[9px] px-2 py-0.5 ${
                          p.status === "Captured"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : p.status === "Pending"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button onClick={() => alert("Downloading PDF Invoice...")} variant="outline" className="h-7 w-7 p-0 text-slate-400 hover:text-primary">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          {p.status === "Captured" && (
                            <Button onClick={() => handleRefund(p.id)} variant="outline" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500" title="Issue Refund">
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <BadgeIndianRupee className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        No transaction records found matching search filters.
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
