import { useState, useEffect } from "react";
import { emailNotify } from "../utils/emailNotify";
import { api } from "../config/api";

const CustomProject = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
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
      const response = await fetch(`${api.base}/api/db/custom_requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: "pending",
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit custom project request");
      }

      setStatus("success");
      // ✉️ Email admin + user
      emailNotify('service_request_admin', {
        clientName: formData.fullName,
        clientEmail: formData.email,
        clientPhone: formData.mobile,
        serviceType: formData.projectType,
        message: formData.description
      })
      emailNotify('service_request_user', {
        clientName: formData.fullName,
        clientEmail: formData.email,
        serviceType: formData.projectType
      })
      setFormData({
        fullName: "",
        email: "",
        mobile: "",
        company: "",
        projectType: "",
        budget: "",
        timeline: "",
        description: "",
      });
    } catch (error) {
      console.error("Error submitting custom project:", error);
      setStatus("error");
    }

    setLoading(false);
  };

  const projectTypes = [
    "Web Development",
    "Mobile App Development",
    "UI/UX Design",
    "API Integration",
    "E-Commerce Solution",
    "CMS Development",
    "Cloud & DevOps",
    "Other",
  ];

  const budgetRanges = [
    "Under ₹50,000",
    "₹50,000 - ₹1,00,000",
    "₹1,00,000 - ₹3,00,000",
    "₹3,00,000 - ₹5,00,000",
    "₹5,00,000+",
    "Let's Discuss",
  ];

  const timelineOptions = [
    "1 - 2 Weeks",
    "1 Month",
    "2 - 3 Months",
    "3 - 6 Months",
    "6+ Months",
    "Flexible",
  ];

  return (
    <section className="relative w-full min-h-screen pt-10 md:pt-14 pb-20 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      {/* Background */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-20 -right-20 w-[30rem] h-[30rem] bg-blue-500/15 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 -left-20 w-[30rem] h-[30rem] bg-purple-500/15 rounded-full blur-[100px]"></div>
      </div>
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

      <div
        className={`w-full max-w-5xl mx-auto relative z-20 transition-all duration-1000 ease-out ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        }`}
      >
        {/* Top decorative element */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-white/50 backdrop-blur-md rounded-full border border-white/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-slate-700">
              Custom Project Request
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left side - Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-800 tracking-tight leading-tight">
                Build Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Dream Project
                </span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Can't find the right package? Tell us exactly what you need, and
                our expert team will craft a tailored solution for you.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                {
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                      />
                    </svg>
                  ),
                  title: "Free Consultation",
                  desc: "Get expert advice on your project idea",
                },
                {
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Quick Response",
                  desc: "We respond within 24 hours guaranteed",
                },
                {
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                      />
                    </svg>
                  ),
                  title: "Transparent Pricing",
                  desc: "No hidden charges, clear cost breakdown",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-white/60 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-6">
                  Tell us about your project
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                         type="text"
                         name="fullName"
                         value={formData.fullName}
                         onChange={handleChange}
                         placeholder="Your Name"
                         required
                         className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your Email"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile & Company */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Your Mobile Number"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your Company Name"
                        className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
                      />
                    </div>
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Project Type *
                    </label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-white">
                        Select project type
                      </option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type} className="bg-white">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget & Timeline */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Budget Range *
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-white">
                          Select budget
                        </option>
                        {budgetRanges.map((b) => (
                          <option key={b} value={b} className="bg-white">
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Timeline *
                      </label>
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-white">
                          Select timeline
                        </option>
                        {timelineOptions.map((t) => (
                          <option key={t} value={t} className="bg-white">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      rows="4"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your project requirements, features needed, and any specific technologies you prefer..."
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Project Request
                          <svg
                            className="w-5 h-5 ml-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Status Messages */}
                  {status === "success" && (
                     <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg shadow-md shadow-emerald-500/20">
                           <svg
                             className="w-5 h-5"
                             fill="none"
                             viewBox="0 0 24 24"
                             stroke="currentColor"
                             strokeWidth={2.5}
                           >
                             <path
                               strokeLinecap="round"
                               strokeLinejoin="round"
                               d="M4.5 12.75l6 6 9-13.5"
                             />
                           </svg>
                         </div>
                         <div>
                           <p className="text-sm font-bold text-emerald-700">
                             Request Submitted!
                           </p>
                           <p className="text-xs font-medium text-emerald-600">
                             We'll get back to you within 24 hours.
                           </p>
                         </div>
                       </div>
                     </div>
                  )}

                  {status === "error" && (
                    <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-lg shadow-md shadow-red-500/20">
                          !
                        </div>
                        <p className="text-sm font-bold text-red-700">
                          Something went wrong. Please try again.
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomProject;
