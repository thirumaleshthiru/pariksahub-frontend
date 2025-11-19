export default function Loading() {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-b from-[#6366F1] to-transparent rounded-full blur-[100px] opacity-20" />
        
        {/* Main Content */}
        <div className="relative z-10 text-center px-4">
          {/* Spinner */}
          <div className="w-16 h-16 border-4 border-gray-700 border-t-[#6366F1] rounded-full animate-spin mx-auto mb-6" />
          
          {/* Text */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading...
          </h2>
          <p className="text-sm text-gray-400">
            Please wait
          </p>
        </div>
      </div>
    );
  }