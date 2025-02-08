
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  return (
    <div>
      <div className="text-xl font-bold">Sta-tistics</div>
      <div className="flex space-x-4">
   
        <Link href="/student" >Student</Link>
        <Link href="/teacher">Teacher</Link>
      </div>
    </div>
  )
}
