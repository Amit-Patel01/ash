import Navbar from './components/Navbar'
import launchVideo from './assets/launchinsoon.mp4'

function App() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        {/* Hero Section with Video */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src={launchVideo} type="video/mp4" />
          </video>
          
          {/* Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>
          
          {/* Content */}
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Something Amazing is Coming
            </h1>
  
            <div className="flex gap-4 justify-center">

            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default App
