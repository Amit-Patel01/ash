import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { api } from "../config/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    github: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      // 1. Save to Firebase (Database)
      await addDoc(collection(db, "messages"), {
        ...formData,
        createdAt: serverTimestamp(),
        status: "unread",
      });

      // 2. Call Backend API (Send Email)
      const response = await fetch(api.contact, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send email notification");
      }

      setStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        github: "",
        message: "",
      });

      // Auto clear success after 5s
      setTimeout(() => setStatus(""), 5000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <section className="relative w-full min-h-screen pt-[140px] md:pt-[180px] pb-20 flex items-center justify-center px-4">

      <div className={`w-full max-w-4xl relative z-20 transition-all duration-1000 ease-out ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}>


        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl p-8 md:p-14 shadow-2xl border border-white/60 relative overflow-hidden group">

          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl z-0 transition-opacity duration-500 opacity-50 group-hover:opacity-100 pointer-events-none"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-800 tracking-tight">
                Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Connect</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto font-medium mix-blend-multiply">
                Have a project in mind? Fill out the form below and let’s start building something amazing together.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className="w-full rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm px-5 py-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:bg-white/80 focus:border-blue-400 transition-all shadow-sm font-medium"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className="w-full rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm px-5 py-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:bg-white/80 focus:border-blue-400 transition-all shadow-sm font-medium"
                />
              </div>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm px-5 py-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:bg-white/80 focus:border-blue-400 transition-all shadow-sm font-medium"
              />

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile Number (+91 1234567890)"
                required
                className="w-full rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm px-5 py-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:bg-white/80 focus:border-blue-400 transition-all shadow-sm font-medium"
              />

              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="github.com/yourusername"
                required
                className="w-full rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm px-5 py-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:bg-white/80 focus:border-blue-400 transition-all shadow-sm font-medium"
              />

              <textarea
                rows="5"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                required
                className="w-full rounded-2xl border border-white/40 bg-white/50 backdrop-blur-sm px-5 py-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:bg-white/80 focus:border-blue-400 transition-all shadow-sm resize-none font-medium"
              ></textarea>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full inline-flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending securely...
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.96 14.96 0 01-5.96 5.96m5.96-5.96L9.63 8.41m0 0a14.98 14.98 0 01-6.16 12.12A14.98 14.98 0 019.63 8.41m0 0L3.47 14.57" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Status Messages */}
              {status === "success" && (
                <div className="mt-6 p-5 rounded-2xl bg-green-500/10 border border-green-500/30 shadow-lg animate-[bounce_1s_ease-in-out] group backdrop-blur-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse"></div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 transform group-hover:scale-105 transition-transform">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-green-500/40">✓</div>
                    <span className="text-xl font-bold text-green-700 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Message sent successfully!
                    </span>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="mt-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 shadow-lg group backdrop-blur-md relative overflow-hidden">
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-red-500/40">!</div>
                    <span className="text-xl font-medium text-red-600">Failed to send message. Please try again later.</span>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;