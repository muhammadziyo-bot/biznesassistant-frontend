import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronDown, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap, 
  Star, 
  Check, 
  Plus, 
  Minus, 
  Mail, 
  Phone, 
  MapPin,
  Building2,
  Globe,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DarkModeToggle from '../components/DarkModeToggle';
import { t } from '../utils/i18n';
import { getCurrentLanguage } from '../types/language';

const useRef: <T>(initialValue: T) => { current: T } = (React as any).useRef;

// Typing Effect Component
const TypingText: React.FC<{ text: string; className?: string; delay?: number }> = ({ 
  text, 
  className = "", 
  delay = 0 
}) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayedText(displayedText + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }
    }, 50 + Math.random() * 50); // Random typing speed

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
};

// Counter Animation Component
const AnimatedCounter: React.FC<{ 
  value: string; 
  className?: string; 
  delay?: number 
}> = ({ value, className = "", delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = parseInt(value.replace(/[^\d]/g, '')) || 0;
  const suffix = value.replace(/[\d]/g, '');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;

      const counter = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [numericValue, delay]);

  return (
    <span className={className}>
      {displayValue}{suffix}
    </span>
  );
};

// Optimized Magnetic Button Hook
const useOptimizedMagneticButton = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | undefined>(undefined);

  const handleMouseMove = (e: any) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      const button = e.currentTarget;
      if (!button) return;
      
      const rect = button.getBoundingClientRect();
      if (!rect) return;
      
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / 15; // Reduced sensitivity
      const y = (e.clientY - centerY) / 15;
      
      setPosition({ 
        x: Math.max(-8, Math.min(8, x)), 
        y: Math.max(-8, Math.min(8, y)) 
      });
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPosition({ x: 0, y: 0 });
  };

  return { position, handleMouseMove, handleMouseLeave };
};

// Magnetic CTA Button Component
interface MagneticCTAProps {
  children: JSX.Element | JSX.Element[] | string | number;
  onClick?: () => void;
  className?: string;
}

function MagneticCTA({ children, onClick, className = "" }: MagneticCTAProps): JSX.Element {
  const { position, handleMouseMove, handleMouseLeave } = useOptimizedMagneticButton();

  return (
    <motion.button
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }} // Softer spring
      whileHover={{ scale: 1.03 }} // Reduced scale
      whileTap={{ scale: 0.98 }}
      className={`px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full font-semibold text-lg text-white hover:shadow-xl hover:shadow-primary-500/20 dark:hover:shadow-primary-400/20 transition-all duration-300 relative overflow-hidden group ${className}`}
      onClick={onClick}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-secondary-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Scroll Reveal Component
interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "left" | "right" | "up" | "down";
}

function ScrollReveal({ children, delay = 0, direction = "up" }: ScrollRevealProps): JSX.Element {
  const getInitialPosition = () => {
    switch (direction) {
      case "left": return { x: -50, opacity: 0 };
      case "right": return { x: 50, opacity: 0 };
      case "down": return { y: 50, opacity: 0 };
      default: return { y: -50, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay, duration: 0.6, type: "spring" }}
    >
      {children}
    </motion.div>
  );
};

// Optimized mouse tracking with throttling
const useOptimizedMouseTracking = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTimeRef.current < 16) return; // Throttle to ~60fps
      
      lastTimeRef.current = now;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      rafRef.current = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return mousePosition;
};

// Performance monitoring
const usePerformanceSettings = () => {
  const [settings, setSettings] = useState({
    reducedParticles: false,
    reducedAnimations: false,
    particleCount: 8
  });

  React.useEffect(() => {
    const checkPerformance = () => {
      const isMobile = window.innerWidth < 768;
      const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      const connection = (navigator as any).connection;
      const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
      
      const reducedAnimations = isMobile || isLowEnd || isSlowConnection;
      const reducedParticles = isMobile;
      const particleCount = reducedParticles ? 3 : 8;
      
      setSettings({ reducedParticles, reducedAnimations, particleCount });
    };

    checkPerformance();
    window.addEventListener('resize', checkPerformance);
    return () => window.removeEventListener('resize', checkPerformance);
  }, []);

  return settings;
};

const Landing: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const performanceSettings = usePerformanceSettings();
  const mousePosition = useOptimizedMouseTracking();
  
  // Optimized background transforms with reduced calculations
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 100]); // Reduced movement
  const backgroundX = useTransform(scrollYProgress, [0, 1], [0, -50]);  // Reduced movement
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]); // Reduced scale
  
  const pricingPlans = [
    {
      name: t('landing.pricing.starter.name'),
      price: '$29',
      period: t('landing.pricing.starter.period'),
      description: t('landing.pricing.starter.description'),
      features: [
        t('landing.pricing.starter.features.0'),
        t('landing.pricing.starter.features.1'),
        t('landing.pricing.starter.features.2'),
        t('landing.pricing.starter.features.3'),
        t('landing.pricing.starter.features.4')
      ],
      popular: false,
      color: 'from-gray-600 to-gray-700'
    },
    {
      name: t('landing.pricing.professional.name'),
      price: '$79',
      period: t('landing.pricing.professional.period'),
      description: t('landing.pricing.professional.description'),
      features: [
        t('landing.pricing.professional.features.0'),
        t('landing.pricing.professional.features.1'),
        t('landing.pricing.professional.features.2'),
        t('landing.pricing.professional.features.3'),
        t('landing.pricing.professional.features.4'),
        t('landing.pricing.professional.features.5')
      ],
      popular: true,
      color: 'from-blue-600 to-purple-600'
    },
    {
      name: t('landing.pricing.enterprise.name'),
      price: '$199',
      period: t('landing.pricing.enterprise.period'),
      description: t('landing.pricing.enterprise.description'),
      features: [
        t('landing.pricing.enterprise.features.0'),
        t('landing.pricing.enterprise.features.1'),
        t('landing.pricing.enterprise.features.2'),
        t('landing.pricing.enterprise.features.3'),
        t('landing.pricing.enterprise.features.4'),
        t('landing.pricing.enterprise.features.5')
      ],
      popular: false,
      color: 'from-purple-600 to-pink-600'
    }
  ];

  const faqs = [
    {
      question: t('landing.faq.questions.0.question'),
      answer: t('landing.faq.questions.0.answer')
    },
    {
      question: t('landing.faq.questions.1.question'),
      answer: t('landing.faq.questions.1.answer')
    },
    {
      question: t('landing.faq.questions.2.question'),
      answer: t('landing.faq.questions.2.answer')
    },
    {
      question: t('landing.faq.questions.3.question'),
      answer: t('landing.faq.questions.3.answer')
    },
    {
      question: t('landing.faq.questions.4.question'),
      answer: t('landing.faq.questions.4.answer')
    }
  ];

  const businessStats = [
    { 
      value: '87%',
      label: t('landing.stats.costReduction'),
      description: t('landing.stats.avgOperationalSavings')
    },
    { 
      value: '3.2x',
      label: t('landing.stats.roiIncrease'),
      description: t('landing.stats.withinFirst6Months')
    },
    { 
      value: '42%',
      label: t('landing.stats.timeSaved'),
      description: t('landing.stats.onAdministrativeTasks')
    },
    { 
      value: '15K+',
      label: t('landing.stats.businessesTransformed'),
      description: t('landing.stats.acrossUzbekistan')
    }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-gray-900">
      <DarkModeToggle />
      {/* Interactive Background */}
      <div className="fixed inset-0 bg-white dark:bg-gray-900">
        {/* Optimized background with subtle gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(234, 88, 12, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: `translate(${backgroundX.get()}px, ${backgroundY.get()}px) scale(${backgroundScale.get()})`,
          }}
        />
        </div>
      </div>

      {/* Header with Language Switcher */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.img
                src="/logo.png"
                alt="BizCore SaaS"
                className="w-8 h-8"
                whileHover={{ scale: 1.1 }}
              />
              <motion.span 
                className="text-xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                BizCore SaaS
              </motion.span>
            </motion.div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-6xl mx-auto z-10"
        >
          {/* Static Hero Content - No Animations */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {t('landing.title')}
            </h1>
            <div className="text-xl md:text-2xl mb-8 text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              {t('landing.subtitle')}
            </div>
          </div>
          
          {/* Business Transformation Stats - Moved Above Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {businessStats.map((stat, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6, type: "spring" }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transition: { duration: 0.2 }
                }}
                className="text-center bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-xl transition-all duration-200 cursor-default"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4, type: "spring" }}
                  className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text mb-2"
                >
                  {stat.value}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 + index * 0.1, duration: 0.4 }}
                  className="text-lg font-semibold text-neutral-900 dark:text-white mb-1"
                >
                  {stat.label}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                  className="text-sm text-neutral-600 dark:text-neutral-400"
                >
                  {stat.description}
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          {/* Reorganized Button Layout */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-16">
            <button
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full font-semibold text-lg text-white hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300"
              onClick={() => window.location.href = '/register'}
            >
              <span className="flex items-center gap-2">
              {t('landing.getStartedFree')}
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
            
            <button
              className="px-10 py-4 bg-gradient-to-r from-secondary-600 to-primary-600 rounded-full font-semibold text-lg text-white hover:shadow-2xl hover:shadow-secondary-500/25 transition-all duration-300"
              onClick={() => window.location.href = '/register-business'}
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {t('landing.businessRegistration')}
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
            
            <button
              className="px-8 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-full font-semibold text-lg text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
              onClick={() => window.location.href = '/login'}
            >
              {t('landing.signIn')}
            </button>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal delay={0}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {t('landing.features.title')}
            </h2>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.1} direction="up">
                <motion.div
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                  }}
                  className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    {index === 0 && <TrendingUp className="w-12 h-12 text-primary-600" />}
                    {index === 1 && <Users className="w-12 h-12 text-primary-600" />}
                    {index === 2 && <Shield className="w-12 h-12 text-primary-600" />}
                    {index === 3 && <Zap className="w-12 h-12 text-primary-600" />}
                    {index === 4 && <Star className="w-12 h-12 text-primary-600" />}
                    {index === 5 && <Check className="w-12 h-12 text-primary-600" />}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
                    {index === 0 && t('landing.features.smartAnalytics.title')}
                    {index === 1 && t('landing.features.teamCollaboration.title')}
                    {index === 2 && t('landing.features.enterpriseSecurity.title')}
                    {index === 3 && t('landing.features.lightningFast.title')}
                    {index === 4 && t('landing.features.fiveStarSupport.title')}
                    {index === 5 && t('landing.features.provenResults.title')}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {index === 0 && t('landing.features.smartAnalytics.description')}
                    {index === 1 && t('landing.features.teamCollaboration.description')}
                    {index === 2 && t('landing.features.enterpriseSecurity.description')}
                    {index === 3 && t('landing.features.lightningFast.description')}
                    {index === 4 && t('landing.features.fiveStarSupport.description')}
                    {index === 5 && t('landing.features.provenResults.description')}
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('landing.pricing.title')}
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`relative bg-white rounded-2xl p-1 shadow-lg border ${plan.popular ? 'border-secondary-500' : 'border-neutral-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-secondary-600 to-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {t('landing.mostPopular')}
                  </div>
                )}
                <div className="bg-white rounded-2xl p-8 h-full">
                  <h3 className="text-2xl font-bold mb-2 text-neutral-900">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-neutral-900">{plan.price}</span>
                    <span className="text-neutral-600 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-neutral-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-secondary-600 to-primary-600 hover:shadow-2xl hover:shadow-secondary-500/25 text-white' 
                        : 'bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-900'
                    }`}
                    onClick={() => window.location.href = '/register'}
                  >
                    {t('landing.getStarted')}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {t('landing.about.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.about.subtitle')}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <motion.h3 className="text-3xl font-bold mb-6 text-neutral-900">{t('landing.about.mission')}</motion.h3>
              <p className="text-neutral-600 mb-6">
                {t('landing.about.missionText')}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text">50+</div>
                  <div className="text-sm text-neutral-600">{t('landing.about.teamMembers')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text">10K+</div>
                  <div className="text-sm text-neutral-600">{t('landing.about.happyCustomers')}</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">{t('landing.values.customerFirst')}</div>
                      <div className="text-sm text-neutral-600">{t('landing.values.customerFirstDesc')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-secondary-600 to-primary-600 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">{t('landing.values.continuousInnovation')}</div>
                      <div className="text-sm text-neutral-600">{t('landing.values.continuousInnovationDesc')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">{t('landing.values.trustedSecure')}</div>
                      <div className="text-sm text-neutral-600">{t('landing.values.trustedSecureDesc')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('landing.faq.title')}
          </motion.h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-100 transition-colors duration-200"
                >
                  <span className="font-semibold text-lg text-neutral-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <Minus className="w-5 h-5 text-secondary-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-secondary-600" />
                  )}
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: expandedFaq === index ? 'auto' : 0,
                    opacity: expandedFaq === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-neutral-600">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('landing.contact.title')}
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-neutral-900">{t('landing.contact.title')}</h3>
              <p className="text-neutral-600 mb-8">
                {t('landing.contact.subtitle')}
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">Email</div>
                    <div className="text-neutral-600">{t('landing.contact.info.email')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary-600 to-primary-600 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">Phone</div>
                    <div className="text-neutral-600">{t('landing.contact.info.phone')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">Office</div>
                    <div className="text-neutral-600">{t('landing.contact.info.office')}</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleFormSubmit} className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200 shadow-sm">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-neutral-700">{t('landing.contact.form.name')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-neutral-700">{t('landing.contact.form.email')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-neutral-700">{t('landing.contact.form.message')}</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg font-semibold text-white hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300"
                >
                  {t('landing.contact.form.sendButton')}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-neutral-600 mb-4">{t('landing.footer.copyright')}</p>
          <div className="flex justify-center gap-6">
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {t('landing.footer.privacyPolicy')}
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {t('landing.footer.termsOfService')}
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {t('landing.footer.cookiePolicy')}
            </motion.a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
