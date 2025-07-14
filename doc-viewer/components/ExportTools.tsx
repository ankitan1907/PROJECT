"use client";

import { useState } from 'react';
import { DocumentInsight } from '@/app/page';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Code } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExportToolsProps {
  insights: DocumentInsight[];
}

export function ExportTools({ insights }: ExportToolsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToTXT = () => {
    setIsExporting(true);
    
    const content = insights.map(insight => {
      return `
Document: ${insight.fileName}
Classification: ${insight.classification}
Confidence: ${insight.confidence}%
Summary: ${insight.summary}

Key Points:
${insight.keyPoints.map(point => `• ${point}`).join('\n')}

Risks:
${insight.risks.map(risk => `• ${risk}`).join('\n')}

Trends:
${insight.trends.map(trend => `• ${trend.label}: ${trend.value}% (${trend.change > 0 ? '+' : ''}${trend.change}%)`).join('\n')}

Processed: ${insight.processedAt.toLocaleString()}
${'='.repeat(80)}
      `;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-insights-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const exportToJSON = () => {
    setIsExporting(true);
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalDocuments: insights.length,
      insights: insights.map(insight => ({
        id: insight.id,
        fileName: insight.fileName,
        classification: insight.classification,
        confidence: insight.confidence,
        summary: insight.summary,
        keyPoints: insight.keyPoints,
        risks: insight.risks,
        trends: insight.trends,
        processedAt: insight.processedAt.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-insights-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={exportToTXT}>
            <FileText className="h-4 w-4 mr-2" />
            Export as TXT
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToJSON}>
            <Code className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}