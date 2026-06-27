import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setInterest("");
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      {submitted ? (
        <div className="sm:col-span-2 p-4 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
          Thank you! We will get back to you shortly.
        </div>
      ) : (
        <>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
          <Input value={interest} onChange={(e) => setInterest(e.target.value)} className="sm:col-span-2" placeholder="Course or internship interest" />
          <Button className="sm:col-span-2" type="submit">
            Request Callback
          </Button>
        </>
      )}
    </form>
  );
}

