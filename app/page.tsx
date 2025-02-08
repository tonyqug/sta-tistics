'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative pt-[15vh] space-y-6 text-center">
        <h1 className="text-7xl font-outfit font-bold text-green-800 tracking-tight">
          PEARDECK <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">AI</span>
        </h1>
        <p className="text-xl text-green-600 text-center max-w-md mx-auto font-light">
          Jake Pajerski
        </p>
      </div>
      
      <div className="relative flex space-x-8 justify-center mt-20">
        <Link 
          href="/student" 
          className="group px-16 py-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-green-100"
        >
          <div className="text-2xl font-medium text-green-800 group-hover:transform group-hover:translate-y-[-2px] transition-transform">
            Student Portal
          </div>
          <div className="text-sm text-green-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Start Learning →
          </div>
        </Link>
        <Link 
          href="/teacher" 
          className="group px-16 py-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-green-100"
        >
          <div className="text-2xl font-medium text-green-800 group-hover:transform group-hover:translate-y-[-2px] transition-transform">
            Teacher Portal
          </div>
          <div className="text-sm text-green-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Start Teaching →
          </div>
        </Link>
      </div>

      <div className="relative mt-24 text-center text-green-600/50 text-sm">
        Built by students, Made for students
      </div>
    </div>
  )
}
