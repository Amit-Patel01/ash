import { useState, useEffect } from "react";

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
      const response = await fetch(
"https://solutionhub-as43.onrender.com/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          github: "",
          message: "",
        });
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }

    setLoading(false);
    
    // Auto clear success after 5s
    if (status === "success") {
      setTimeout(() => setStatus(""), 5000);
    }
  };

  return (
    <section className="relative w-full min-h-screen pt-[80px] flex items-center justify-center overflow-hidden px-4">

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-20 blur-3xl rounded-full animate-blob animation-delay-2000"></div>
      </div>

      <div className={`w-full max-w-4xl transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>

        <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">
              Let's <span className="gradient-text">Connect</span>
            </h2>
            <p className="text-gray-600">
              Have a project in mind? Let’s build something amazing together.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-5">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 focus:ring-2 focus:ring-blue-500 transition"
            />

            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile Number (e.g. +91 1234567890)"
              required
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 focus:ring-2 focus:ring-blue-500 transition"
            />

            <input
              type="url"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="github.com/yourusername"
              required
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 focus:ring-2 focus:ring-blue-500 transition"
            />

            <textarea
              rows="5"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message..."
              required
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 focus:ring-2 focus:ring-blue-500 transition resize-none"
            ></textarea>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60"
            >
{loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </span>
              ) : "Send Message 🚀"}
            </button>

            {/* Status Message */}
{status === "success" && (
              <div className="mt-4 p-4 rounded-2xl bg-green-50/80 border border-green-200 shadow-lg animate-bounce-in group overflow-hidden">
                <div className="flex items-center justify-center gap-3 transform group-hover:scale-110 transition-transform">
                  <div className="text-3xl animate-ping">✅</div>
                  <span className="text-lg font-bold text-green-700 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent animate-pulse">
                    Message sent successfully! 🎉
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 blur animate-pulse"></div>
              </div>
            )}

{status === "error" && (
              <div className="mt-4 p-4 rounded-2xl bg-red-50/80 border border-red-200 shadow-lg animate-shake group">
                <div className="flex items-center justify-center gap-3">
                  <div className="text-3xl animate-wiggle">❌</div>
                  <span className="text-lg font-bold text-red-700">Something went wrong. Try again.</span>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;