// Export Utilities for ProposalAI (PDF, Word, Email)
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Programmatically generate and download a clean PDF from a Proposal object
export function generateDirectPdfFromProposal(proposal, filename = "Proposal_ProposalAI.pdf") {
  if (!proposal) return;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const p = proposal;

  // Header Banner
  pdf.setFillColor(30, 58, 138); // Indigo Navy
  pdf.rect(0, 0, 210, 24, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text("STATEMENT OF WORK & PROPOSAL", 14, 15);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`ID: ${p.proposalId || 'PROP-1001'}`, 160, 15);

  // 1. Client Contact Info
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text("1. Client Contact Information", 14, 34);

  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Project Title: ${p.projectName || 'Enterprise Software Platform'}`, 14, 42);
  pdf.text(`Client Name: ${p.clientName || 'Enterprise Account'}`, 14, 48);
  pdf.text(`Client Email: ${p.clientEmail || 'contact@client.com'}`, 14, 54);
  pdf.text(`Created Date: ${p.createdAt || new Date().toISOString().split('T')[0]}`, 14, 60);

  // 2. Executive Summary
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text("2. Executive Summary", 14, 72);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const summaryText = p.executiveSummary || `We are pleased to submit this proposal for ${p.projectName || 'Software Initiative'}.`;
  const summaryLines = pdf.splitTextToSize(summaryText, 182);
  pdf.text(summaryLines, 14, 79);

  let curY = 79 + (summaryLines.length * 4.5) + 6;

  // 3. Scope of Work
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text("3. Scope of Work", 14, curY);
  curY += 7;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  (p.scopeOfWork || []).forEach(item => {
    if (curY > 270) {
      pdf.addPage();
      curY = 20;
    }
    pdf.text(`• ${item}`, 16, curY);
    curY += 5.5;
  });

  curY += 4;

  // 4. Technology Stack
  if (curY > 260) {
    pdf.addPage();
    curY = 20;
  }
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text("4. Recommended Technology Stack", 14, curY);
  curY += 7;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const stackStr = Array.isArray(p.techStack) ? p.techStack.join(', ') : 'React, Node.js, PostgreSQL, AWS';
  pdf.text(stackStr, 14, curY);
  curY += 10;

  // 5. Assigned Bench Team Table
  if (curY > 240) {
    pdf.addPage();
    curY = 20;
  }
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text("5. Assigned Engineering Bench Team", 14, curY);
  curY += 7;

  pdf.setFillColor(241, 245, 249);
  pdf.rect(14, curY - 4, 182, 6, 'F');
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text("Role", 16, curY);
  pdf.text("Developer Name", 65, curY);
  pdf.text("Emp Code", 125, curY);
  pdf.text("Hourly Rate", 165, curY);
  curY += 7;

  pdf.setFont('helvetica', 'normal');
  (p.teamStructure || []).forEach(dev => {
    if (curY > 270) {
      pdf.addPage();
      curY = 20;
    }
    pdf.text(`${dev.role || 'Engineer'}`, 16, curY);
    pdf.text(`${dev.name || 'Developer'}`, 65, curY);
    pdf.text(`${dev.empCode || 'EMP-101'}`, 125, curY);
    pdf.text(`$${dev.hourlyRate || 60}/hr`, 165, curY);
    curY += 5.5;
  });

  curY += 6;

  // 6. Financial Quotation
  if (curY > 230) {
    pdf.addPage();
    curY = 20;
  }
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text("6. Project Financial Quotation", 14, curY);
  curY += 7;

  const grandTotal = p.financials?.grandTotal || p.estimatedCost || 125000;
  const devCost = p.financials?.devCost || Math.round(grandTotal * 0.7);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Engineering Team Cost (${p.timeline?.realisticWeeks || 12} Weeks): $${devCost.toLocaleString()}`, 14, curY);
  curY += 5.5;
  pdf.text(`Cloud Infrastructure & Subscriptions: $${(p.financials?.cloudInfraCost || 3500).toLocaleString()}`, 14, curY);
  curY += 5.5;
  pdf.text(`Contingency Buffer (10%): $${(p.financials?.contingencyBuffer || 12500).toLocaleString()}`, 14, curY);
  curY += 8;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(16, 185, 129); // Emerald
  pdf.text(`Grand Total Investment: $${grandTotal.toLocaleString()} USD`, 14, curY);

  // Trigger PDF file download directly
  const outName = filename || `${(p.projectName || 'Proposal').replace(/[^a-zA-Z0-9]/g, '_')}_Proposal.pdf`;
  pdf.save(outName);
}

// Unified export function
export async function exportProposalToPdf(target, filename = "Proposal_ProposalAI.pdf") {
  // If target is an object (proposal data record)
  if (target && typeof target === 'object') {
    generateDirectPdfFromProposal(target, filename);
    return;
  }

  // If target is string (element ID)
  if (typeof target === 'string') {
    const element = document.getElementById(target);
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(filename);
        return;
      } catch (err) {
        console.error("Canvas PDF export error:", err);
      }
    }
  }
}

// Export Proposal as a Microsoft Word compatible (.doc / .docx) HTML text blob download
export function exportProposalToWord(proposal, filename = "Proposal_ProposalAI.doc") {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><title>${proposal.projectName}</title>
    <style>
      body { font-family: Calibri, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; }
      h1 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
      h2 { color: #3b82f6; margin-top: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
      th { background-color: #f1f5f9; color: #1e293b; }
      .summary-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px; }
    </style>
    </head>
    <body>
      <h1>${proposal.projectName}</h1>
      <p><strong>Client:</strong> ${proposal.clientName} | <strong>Prepared By:</strong> ${proposal.companyName} | <strong>Date:</strong> ${proposal.createdAt}</p>
      
      <div class="summary-box">
        <h2>Executive Summary</h2>
        <p>${proposal.executiveSummary}</p>
      </div>

      <h2>Scope of Work</h2>
      <ul>
        ${proposal.scopeOfWork.map(item => `<li>${item}</li>`).join('')}
      </ul>

      <h2>Recommended Technology Stack</h2>
      <p>${proposal.techStack.join(', ')}</p>

      <h2>Assigned Bench Team</h2>
      <table>
        <tr><th>Role</th><th>Developer Name</th><th>Experience</th><th>Skill Overlap</th></tr>
        ${proposal.teamStructure.map(dev => `
          <tr>
            <td>${dev.role}</td>
            <td>${dev.name}</td>
            <td>${dev.experienceYears} Years</td>
            <td>${dev.matchPercentage || 95}% Match</td>
          </tr>
        `).join('')}
      </table>

      <h2>Project Financial Quotation</h2>
      <table>
        <tr><th>Item</th><th>Amount (USD)</th></tr>
        <tr><td>Engineering Team Cost (${proposal.timeline.realisticWeeks} Weeks)</td><td>$${proposal.financials.devCost.toLocaleString()}</td></tr>
        <tr><td>Cloud Infrastructure & Services</td><td>$${proposal.financials.cloudInfraCost.toLocaleString()}</td></tr>
        <tr><td>Third-Party APIs & Testing</td><td>$${proposal.financials.thirdPartyApiCost.toLocaleString()}</td></tr>
        <tr><td>Contingency Buffer (10%)</td><td>$${proposal.financials.contingencyBuffer.toLocaleString()}</td></tr>
        <tr><td><strong>Total Fixed Quotation</strong></td><td><strong>$${proposal.financials.grandTotal.toLocaleString()}</strong></td></tr>
      </table>

      <h2>Terms & Conditions</h2>
      <p>${proposal.termsAndConditions}</p>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate Mailto Share Link
export function generateProposalEmailBody(proposal) {
  const subject = encodeURIComponent(`Proposal Submission: ${proposal.projectName}`);
  const body = encodeURIComponent(`Dear ${proposal.clientName} Team,

We are excited to share our official proposal for "${proposal.projectName}".

Project Highlights:
- Duration: ${proposal.timeline.realisticWeeks} Weeks
- Team Size: ${proposal.teamStructure.length} Senior Bench Engineers
- Total Investment: $${proposal.financials.grandTotal.toLocaleString()}

Executive Summary:
${proposal.executiveSummary}

Please let us know your availability for a follow-up presentation call.

Best regards,
${proposal.companyName} Team`);

  return `mailto:client@example.com?subject=${subject}&body=${body}`;
}
