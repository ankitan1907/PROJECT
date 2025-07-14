import { DocumentInsight } from '@/app/page';

const classifications = ['Resume', 'NDA', 'Annual Report', 'General'] as const;

const mockSummaries = {
  Resume: [
    'Professional software engineer with 5+ years experience in full-stack development.',
    'Marketing specialist with strong background in digital campaigns and analytics.',
    'Senior data scientist with expertise in machine learning and statistical modeling.',
    'Project manager with proven track record in agile methodologies and team leadership.'
  ],
  NDA: [
    'Mutual non-disclosure agreement for protection of confidential business information.',
    'Employee confidentiality agreement covering proprietary technology and trade secrets.',
    'Vendor NDA for software development project with specific IP protection clauses.',
    'Partnership agreement with confidentiality provisions for strategic business discussions.'
  ],
  'Annual Report': [
    'Company achieved 15% revenue growth with strong performance in digital transformation.',
    'Quarterly financial results show improved margins and successful cost optimization.',
    'Annual sustainability report highlighting ESG initiatives and carbon reduction goals.',
    'Financial performance review with detailed analysis of market expansion strategies.'
  ],
  General: [
    'Business proposal outlining strategic partnership opportunities and implementation roadmap.',
    'Technical documentation covering system architecture and integration requirements.',
    'Research report analyzing market trends and competitive landscape insights.',
    'Policy document establishing new operational procedures and compliance guidelines.'
  ]
};

const mockKeyPoints = {
  Resume: [
    'Extensive experience with React, Node.js, and cloud technologies',
    'Led multiple cross-functional teams to successful project delivery',
    'Strong educational background with relevant certifications',
    'Demonstrated leadership skills and mentoring capabilities',
    'Experience with agile development methodologies'
  ],
  NDA: [
    'Comprehensive protection of confidential information',
    'Clear definition of permitted use cases',
    'Specific duration and termination clauses',
    'Mutual obligations for both parties',
    'Jurisdiction and dispute resolution mechanisms'
  ],
  'Annual Report': [
    'Strong financial performance exceeding targets',
    'Successful digital transformation initiatives',
    'Expanded market presence in key regions',
    'Improved operational efficiency metrics',
    'Positive outlook for upcoming fiscal year'
  ],
  General: [
    'Clear objectives and success metrics defined',
    'Comprehensive risk assessment included',
    'Detailed implementation timeline provided',
    'Stakeholder responsibilities clearly outlined',
    'Budget allocations and resource requirements'
  ]
};

const mockRisks = {
  Resume: [
    'Limited experience with specific required technologies',
    'Gap in employment history requiring clarification',
    'Salary expectations may exceed budget constraints'
  ],
  NDA: [
    'Broad definition of confidential information',
    'Extended duration may limit future opportunities',
    'Potential conflicts with existing agreements'
  ],
  'Annual Report': [
    'Market volatility could impact future performance',
    'Increased competition in core business segments',
    'Regulatory changes may affect operations'
  ],
  General: [
    'Timeline constraints may affect quality',
    'Resource availability could impact delivery',
    'External dependencies present execution risks'
  ]
};

const trendLabels = [
  'Market Share', 'Revenue Growth', 'Customer Satisfaction', 'Operational Efficiency',
  'Risk Score', 'Innovation Index', 'Compliance Rating', 'Performance Score'
];

const financialMetrics = [
  { metric: 'Revenue', value: '$2.4M', change: 12 },
  { metric: 'EBITDA', value: '$480K', change: 8 },
  { metric: 'Net Margin', value: '18.5%', change: -2 },
  { metric: 'ROI', value: '24.3%', change: 15 },
  { metric: 'Cash Flow', value: '$720K', change: 22 }
];

export function generateMockInsights(file: File): DocumentInsight {
  // Determine classification based on filename or random
  let classification: typeof classifications[number];
  const fileName = file.name.toLowerCase();
  
  if (fileName.includes('resume') || fileName.includes('cv')) {
    classification = 'Resume';
  } else if (fileName.includes('nda') || fileName.includes('confidential')) {
    classification = 'NDA';
  } else if (fileName.includes('annual') || fileName.includes('report') || fileName.includes('financial')) {
    classification = 'Annual Report';
  } else {
    classification = classifications[Math.floor(Math.random() * classifications.length)];
  }

  // Generate confidence score (higher for better matches)
  const baseConfidence = 70 + Math.random() * 25;
  const confidence = Math.round(baseConfidence);

  // Select appropriate content based on classification
  const summaries = mockSummaries[classification];
  const keyPoints = mockKeyPoints[classification];
  const risks = mockRisks[classification];

  // Generate trends data
  const trends = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => ({
    label: trendLabels[Math.floor(Math.random() * trendLabels.length)],
    value: Math.round(20 + Math.random() * 60),
    change: Math.round(-10 + Math.random() * 30)
  }));

  // Generate financial data for reports
  const financials = classification === 'Annual Report' 
    ? financialMetrics.slice(0, 2 + Math.floor(Math.random() * 3))
    : undefined;

  return {
    id: `insight-${Date.now()}-${Math.random()}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    classification,
    confidence,
    summary: summaries[Math.floor(Math.random() * summaries.length)],
    keyPoints: keyPoints.slice(0, 2 + Math.floor(Math.random() * 3)),
    risks: risks.slice(0, 1 + Math.floor(Math.random() * 2)),
    trends,
    financials,
    processedAt: new Date()
  };
}