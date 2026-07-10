import React, { useEffect, useRef, useState } from 'react';
import { Button, Link } from '@heroui/react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Terminal } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionClick = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useGSAP(() => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed z-50 left-1/2 -translate-x-1/2 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex items-center justify-between px-6 ${
        isScrolled 
          ? 'top-4 w-[95%] max-w-6xl h-[70px] rounded-full border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)]' 
          : 'top-0 w-full h-[80px] rounded-none border-b border-transparent bg-transparent shadow-none'
      }`}
    >
      <div className="flex items-center">
        <div ref={logoRef} className="bg-indigo-600 p-2 rounded-xl mr-3 shadow-lg shadow-indigo-500/30">
          <Terminal className="w-5 h-5 text-white" />
        </div>
        <p className="font-bold text-inherit hidden sm:block">
          Elmo <span className="text-indigo-500">ICG</span>
        </p>
      </div>

      <div className="hidden md:flex gap-8 items-center cursor-pointer">
        <Link onPress={() => handleSectionClick('pipeline')} className={`text-sm transition-colors cursor-pointer ${location.pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500'}`}>
          Pipeline
        </Link>
        <Link onPress={() => handleSectionClick('quads')} className={`text-sm transition-colors cursor-pointer ${location.pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500'}`}>
          Explorer
        </Link>
        <Link onPress={() => handleSectionClick('step-through')} className={`text-sm transition-colors cursor-pointer ${location.pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500'}`}>
          Step-Through
        </Link>
        <Link onPress={() => handleSectionClick('sim')} className={`text-sm transition-colors cursor-pointer ${location.pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500'}`}>
          Simulation
        </Link>
        <Link href="#/playground" className={`text-sm transition-colors cursor-pointer ${location.pathname === '/playground' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500'}`}>
          Playground
        </Link>
        <Link href="#/notes" className={`text-sm transition-colors cursor-pointer ${location.pathname === '/notes' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500'}`}>
          Notes
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button 
          onPress={() => handleSectionClick('step-through')}
          variant="secondary" 
          className="font-bold rounded-full hidden sm:flex cursor-pointer"
        >
          Try Demo
        </Button>
      </div>
    </nav>
  );
};
