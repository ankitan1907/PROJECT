"use client";

import { useState, useCallback, useRef } from 'react';
import { Upload, File, X, AlertCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { DocumentInsight } from '@/app/page';
import { generateMockInsights } from '@/lib/mockAI';

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface DocumentUploadProps {
  onDocumentsProcessed: (insights: DocumentInsight[]) => void;
  onProcessingStart: () => void;
}

export function DocumentUpload({ onDocumentsProcessed, onProcessingStart }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<string>('All');

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-excel',
    ];

    if (file.size > maxSize) return 'File size must be less than 10MB';
    if (!allowedTypes.includes(file.type)) return 'Only PDF, DOCX, and XLSX files are supported';
    return null;
  };

  const handleFiles = useCallback((fileList: FileList) => {
    setError(null);
    const newFiles: UploadedFile[] = [];

    Array.from(fileList).forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      newFiles.push({
        file,
        id: `${Date.now()}-${Math.random()}`,
        progress: 0,
        status: 'uploading',
      });
    });

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      simulateUpload(newFiles);
    }
  }, []);

  const simulateUpload = (filesToUpload: UploadedFile[]) => {
    filesToUpload.forEach((file) => {
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id === file.id) {
              const newProgress = Math.min(f.progress + Math.random() * 30, 100);
              const status = newProgress >= 100 ? 'completed' : 'uploading';
              return { ...f, progress: newProgress, status };
            }
            return f;
          })
        );
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress: 100, status: 'completed' } : f))
        );
      }, 1500 + Math.random() * 1000);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === fileId);
      if (removed) toast.success(`Removed ${removed.file.name}`);
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const processDocuments = async () => {
    const completed = files.filter((f) => f.status === 'completed');
    if (completed.length === 0) return;

    onProcessingStart();
    await new Promise((res) => setTimeout(res, 3000 + Math.random() * 2000));
    const insights = completed.map((f) => generateMockInsights(f.file));
    onDocumentsProcessed(insights);
    setFiles([]);
  };

  const completedFiles = files.filter((f) => f.status === 'completed');

  return (
    <Card className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-slate-300 dark:border-slate-700'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 px-2">
          Drop files here or click to browse. Supports PDF, DOCX, XLSX (max 10MB)
        </p>
        <Button onClick={() => fileInputRef.current?.click()} variant="outline">
          Select Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.doc,.xls"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Uploaded Files</h4>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  className="bg-transparent text-sm text-slate-700 dark:text-slate-300 border rounded px-2 py-1"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>PDF</option>
                  <option>DOCX</option>
                  <option>XLSX</option>
                </select>
              </div>
            </div>

            {files
              .filter((file) => {
                if (filter === 'All') return true;
                return file.file.name.toLowerCase().includes(filter.toLowerCase());
              })
              .map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <File className="h-5 w-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress value={file.progress} className="flex-1 h-2" />
                      <span className="text-xs text-slate-500">{Math.round(file.progress)}%</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {completedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-2"
        >
          <Button
            onClick={processDocuments}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            Process Documents ({completedFiles.length})
          </Button>
        </motion.div>
      )}
    </Card>
  );
}
