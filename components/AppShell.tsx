'use client';
import { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import { storage } from '@/lib/storage';

export default function AppShell({ children }: { children: ReactNode }) {
  const [name, setName] = useState('Athlete');

  useEffect(() => {
    const p = storage.getProfile();
    setName(p.name);
  }, []);

  return (
    <div className="app-shell">
      <Navbar name={name} />
      <main className="main-content">{children}</main>
    </div>
  );
}
