import { useState, useEffect } from "react";

const Contact = () => {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [loaded, setLoaded] = useState(false);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ CONNECTED TO BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://solutionhub-as43.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Message Sent Successfully 🚀");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          message: "",
        });
      } else {
        alert("Error sending message ❌");
      }

    } catch (error) {
      console.error(error);
      alert("Server error ❌");
    }
  };

  return (
    <section className="relative w-full min-h-screen pt-[80px] py-16 overflow-hidden flex items-center justify-center">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 blur-3xl opacity-20"></div>
      </div>

      <div className={`w-full max-w-6xl mx-auto px-4 relative z-10 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Let's Connect
          </h1>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="glass-card rounded-3xl p-8">

              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3"
                    placeholder="First Name"
                    required
                  />

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-xl border px-4 py-3"
                    placeholder="Last Name"
                    required
                  />
                </div>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border px-4 py-3"
                  placeholder="Email Address"
                  required
                />

                <textarea
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border px-4 py-3"
                  placeholder="Your Message..."
                  required
                ></textarea>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold"
                >
                  Send Message 🚀
                </button>

              </form>

            </div>
          </div>
        </div>

      </div>

    </section>
  );
};

export default Contact;