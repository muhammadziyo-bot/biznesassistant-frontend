import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <motion.button
      onClick={toggleDarkMode}
      className="fixed top-24 right-6 z-[100] p-3 rounded-full bg-red-500 dark:bg-blue-500 backdrop-blur-sm border-2 border-white dark:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        duration: 0.5, 
        delay: 0.5,
        scale: {
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }
      }}
    >
      <div className="relative w-6 h-6">
        <motion.div
          initial={false}
          animate={{ 
            rotate: isDark ? 180 : 0,
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-5 h-5 text-white" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{ 
            rotate: isDark ? 0 : -180,
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-5 h-5 text-white" />
        </motion.div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-blue-400/20 dark:from-blue-400/20 dark:to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
};

export default DarkModeToggle;
