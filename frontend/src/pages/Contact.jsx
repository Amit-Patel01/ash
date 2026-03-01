import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Sent Successfully 🚀");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      message: "",
    });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">

        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
            Get in Touch
          </h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Let's build something amazing together.
          </p>
        </div>

        {/* Centered Form */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10 lg:p-12 hover:shadow-2xl transition-shadow">

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 md:py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all placeholder-gray-400"
                    placeholder="John"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 md:py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all placeholder-gray-400"
                    placeholder="Doe"
                    required
                  />
                </div>

              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 md:py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base transition-all placeholder-gray-400"
                  placeholder="john@example.com"
                  required
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2">
                  Message
                </label>
                <textarea
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 md:py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base resize-none transition-all placeholder-gray-400"
                  placeholder="Tell us about your project..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 md:py-3.5 text-sm md:text-base font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
              >
                Let’s Talk 🚀
              </button>

            </form>

          </div>
        </div>

      </div>

    </section>
  );
};

export default Contact;