// PDF Export Service for User Data
import jsPDF from 'jspdf';
import { sampleDataService } from './sampleData';

interface UserProfile {
  name: string;
  email: string;
  joinDate: string;
  safetyScore: number;
}

interface ExportData {
  profile: UserProfile;
  emergencyContacts: any[];
  recentIncidents: any[];
  safetyStats: any;
  exportDate: string;
}

class PDFExportService {
  /**
   * Export user data as PDF
   */
  async exportUserData(user: any): Promise<void> {
    try {
      // Collect user data
      const exportData = this.collectUserData(user);
      
      // Generate PDF
      const pdf = this.generatePDF(exportData);
      
      // Download PDF
      const fileName = `Sakhi_Safety_Data_${user?.name?.replace(/\s+/g, '_') || 'User'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF exported successfully:', fileName);
      
      // Show success notification
      this.showExportNotification(true, fileName);
      
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      this.showExportNotification(false);
    }
  }

  /**
   * Collect all user data for export
   */
  private collectUserData(user: any): ExportData {
    const safetyStats = sampleDataService.getSafetyStats();
    const recentIncidents = sampleDataService.getRecentIncidents();
    
    // Get emergency contacts from localStorage
    const emergencyContacts = JSON.parse(localStorage.getItem('emergency-contacts') || '[]');
    
    return {
      profile: {
        name: user?.name || 'Demo User',
        email: user?.email || 'demo@sakhi.com',
        joinDate: user?.memberSince || new Date().toISOString(),
        safetyScore: safetyStats.safetyScore
      },
      emergencyContacts,
      recentIncidents: recentIncidents.slice(0, 10), // Last 10 incidents
      safetyStats,
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Generate PDF document
   */
  private generatePDF(data: ExportData): jsPDF {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(147, 51, 234); // Purple color
    pdf.text('🛡️ Sakhi Safety Data Export', margin, yPosition);
    
    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date(data.exportDate).toLocaleDateString()}`, margin, yPosition);

    yPosition += 20;

    // User Profile Section
    this.addSection(pdf, 'User Profile', yPosition);
    yPosition += 15;
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Name: ${data.profile.name}`, margin + 5, yPosition);
    yPosition += 10;
    pdf.text(`Email: ${data.profile.email}`, margin + 5, yPosition);
    yPosition += 10;
    pdf.text(`Member Since: ${new Date(data.profile.joinDate).toLocaleDateString()}`, margin + 5, yPosition);
    yPosition += 10;
    pdf.text(`Safety Score: ${data.profile.safetyScore}%`, margin + 5, yPosition);
    
    yPosition += 20;

    // Emergency Contacts Section
    this.addSection(pdf, 'Emergency Contacts', yPosition);
    yPosition += 15;
    
    if (data.emergencyContacts.length > 0) {
      data.emergencyContacts.forEach((contact, index) => {
        pdf.text(`${index + 1}. ${contact.name} (${contact.relation})`, margin + 5, yPosition);
        yPosition += 10;
        pdf.text(`   Phone: ${contact.phone}`, margin + 5, yPosition);
        yPosition += 10;
        pdf.text(`   Primary Contact: ${contact.isPrimary ? 'Yes' : 'No'}`, margin + 5, yPosition);
        yPosition += 15;
      });
    } else {
      pdf.text('No emergency contacts configured', margin + 5, yPosition);
      yPosition += 15;
    }

    // Safety Statistics Section
    yPosition = this.checkPageBreak(pdf, yPosition, 60);
    this.addSection(pdf, 'Safety Statistics', yPosition);
    yPosition += 15;
    
    pdf.text(`Total Safe Zones: ${data.safetyStats.safeZones}`, margin + 5, yPosition);
    yPosition += 10;
    pdf.text(`Total Risk Zones: ${data.safetyStats.riskZones}`, margin + 5, yPosition);
    yPosition += 10;
    pdf.text(`Recent Incidents (7 days): ${data.safetyStats.recentIncidents}`, margin + 5, yPosition);
    yPosition += 10;
    pdf.text(`High Risk Incidents: ${data.safetyStats.highRiskIncidents}`, margin + 5, yPosition);
    yPosition += 10;
    pdf.text(`Overall Safety Score: ${data.safetyStats.safetyScore}%`, margin + 5, yPosition);
    
    yPosition += 20;

    // Recent Incidents Section
    yPosition = this.checkPageBreak(pdf, yPosition, 80);
    this.addSection(pdf, 'Recent Community Incidents', yPosition);
    yPosition += 15;
    
    if (data.recentIncidents.length > 0) {
      data.recentIncidents.forEach((incident, index) => {
        yPosition = this.checkPageBreak(pdf, yPosition, 40);
        
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${index + 1}. ${incident.type.toUpperCase()}`, margin + 5, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        const description = pdf.splitTextToSize(incident.description, pageWidth - 2 * margin - 10);
        pdf.text(description, margin + 10, yPosition);
        yPosition += description.length * 8;
        
        pdf.text(`Location: ${incident.location.address}`, margin + 10, yPosition);
        yPosition += 8;
        pdf.text(`Severity: ${incident.severity.toUpperCase()}`, margin + 10, yPosition);
        yPosition += 8;
        pdf.text(`Reported: ${incident.timeAgo}`, margin + 10, yPosition);
        yPosition += 15;
      });
    } else {
      pdf.text('No recent incidents to display', margin + 5, yPosition);
      yPosition += 15;
    }

    // Footer
    yPosition = this.checkPageBreak(pdf, yPosition, 40);
    yPosition += 20;
    
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('This data export was generated by Sakhi - Women Safety App', margin, yPosition);
    yPosition += 10;
    pdf.text('For support or questions, contact: support@sakhi.com', margin, yPosition);
    yPosition += 10;
    pdf.text('⚠️ This data contains sensitive information. Please handle with care.', margin, yPosition);

    return pdf;
  }

  /**
   * Add section header
   */
  private addSection(pdf: jsPDF, title: string, yPosition: number): void {
    pdf.setFontSize(14);
    pdf.setTextColor(147, 51, 234); // Purple
    pdf.text(`📋 ${title}`, 20, yPosition);
    
    // Add underline
    pdf.setDrawColor(147, 51, 234);
    pdf.line(20, yPosition + 2, 20 + pdf.getTextWidth(`📋 ${title}`), yPosition + 2);
  }

  /**
   * Check if new page is needed
   */
  private checkPageBreak(pdf: jsPDF, currentY: number, requiredSpace: number): number {
    const pageHeight = pdf.internal.pageSize.height;
    
    if (currentY + requiredSpace > pageHeight - 30) {
      pdf.addPage();
      return 30; // Reset to top margin
    }
    
    return currentY;
  }

  /**
   * Show export notification
   */
  private showExportNotification(success: boolean, fileName?: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      if (success) {
        new Notification('📄 Data Export Complete!', {
          body: `Your safety data has been exported as ${fileName}`,
          icon: '/favicon.ico',
          tag: 'pdf-export-success'
        });
      } else {
        new Notification('❌ Export Failed', {
          body: 'Unable to export your data. Please try again.',
          icon: '/favicon.ico',
          tag: 'pdf-export-error'
        });
      }
    }

    // Also show console message
    if (success) {
      console.log(`📄 PDF Export: ${fileName} downloaded successfully`);
    } else {
      console.error('❌ PDF Export failed');
    }
  }

  /**
   * Generate demo PDF for testing
   */
  async exportDemoData(): Promise<void> {
    const demoUser = {
      name: 'Demo User',
      email: 'demo@sakhi.com',
      memberSince: new Date().toISOString()
    };

    await this.exportUserData(demoUser);
  }
}

export const pdfExportService = new PDFExportService();
export default pdfExportService;
