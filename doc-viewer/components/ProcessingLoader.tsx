"use client";

import { motion } from 'framer-motion';
import { Brain, Cpu, Zap, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';

const processingSteps = [
  { icon: FileText, label: 'Extracting text content', duration: 1000 },
  { icon: Brain, label: 'Analyzing document structure', duration: 1500 },
  { icon: Cpu, label: 'Running AI classification', duration: 2000 },
  { icon: Zap, label: 'Generating insights', duration: 1000 },
];

export function ProcessingLoader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    const startProgress = () => {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return Math.min(newProgress, 100);
        });
      }, 200);
    };

    const nextStep = () => {
      if (currentStep < processingSteps.length - 1) {
        stepTimeout = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setProgress(0);
        }, processingSteps[currentStep].duration);
      }
    };

    startProgress();
    nextStep();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [currentStep]);

  return (
    <Card className="p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
        </motion.div>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold">Processing Documents</h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-4">
          Our AI is analyzing your documents and generating insights...
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {processingSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800' 
                  : isCompleted
                  ? 'bg-green-50 dark:bg-green-950/20'
                  : 'bg-slate-50 dark:bg-slate-800'
              }`}
            >
              <div className={`p-1.5 sm:p-2 rounded-full ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
              }`}>
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <span className={`flex-1 text-left text-sm sm:text-base ${
                isActive ? 'font-medium' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
              {isActive && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100px' }}
                  className="w-16 sm:w-24"
                >
                  <Progress value={progress} className="h-2" />
                </motion.div>
              )}
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <motion.svg
                    className="sm:w-3 sm:h-3"
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.path
                      d="M2 6L5 9L10 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}