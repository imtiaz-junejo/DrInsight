import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface InvoiceData {
  invoiceNumber: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: string;
  consultationFee: string;
  platformFee: string;
  tax: string;
  total: string;
  currency: string;
  transactionId: string;
  status: string;
  receiptUrl?: string | null;
  paidAt: string;
}

@Injectable()
export class InvoiceService {
  generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(22).fillColor('#1a56a0').text('DrInsight', { align: 'left' });
      doc.fontSize(10).fillColor('#64748b').text('Healthcare Consultation Platform', { align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(16).fillColor('#0f172a').text('INVOICE', { align: 'right' });
      doc.fontSize(10).fillColor('#64748b').text(`#${data.invoiceNumber}`, { align: 'right' });
      doc.moveDown(1.5);

      doc.fontSize(11).fillColor('#0f172a');
      doc.text(`Date: ${data.paidAt}`);
      doc.text(`Status: ${data.status}`);
      doc.text(`Transaction ID: ${data.transactionId}`);
      doc.moveDown(1);

      doc.fontSize(12).fillColor('#1a56a0').text('Patient');
      doc.fontSize(10).fillColor('#334155');
      doc.text(data.patientName);
      doc.text(data.patientEmail);
      doc.moveDown(0.75);

      doc.fontSize(12).fillColor('#1a56a0').text('Doctor');
      doc.fontSize(10).fillColor('#334155');
      doc.text(data.doctorName);
      doc.text(data.doctorSpecialty);
      doc.moveDown(0.75);

      doc.fontSize(12).fillColor('#1a56a0').text('Appointment');
      doc.fontSize(10).fillColor('#334155');
      doc.text(`${data.appointmentDate} at ${data.appointmentTime}`);
      doc.text(`Type: ${data.consultationType}`);
      doc.moveDown(1);

      const tableTop = doc.y;
      doc.fontSize(10).fillColor('#64748b');
      doc.text('Description', 50, tableTop);
      doc.text('Amount', 400, tableTop, { align: 'right', width: 145 });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.5);

      const rows = [
        ['Consultation Fee', data.consultationFee],
        ['Platform Fee', data.platformFee],
        ['Tax', data.tax],
      ];

      doc.fillColor('#334155');
      for (const [label, amount] of rows) {
        doc.text(label, 50);
        doc.text(amount, 400, doc.y - 12, { align: 'right', width: 145 });
        doc.moveDown(0.4);
      }

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#0f172a');
      doc.text('Total Paid', 50);
      doc.text(data.total, 400, doc.y - 14, { align: 'right', width: 145 });

      if (data.receiptUrl) {
        doc.moveDown(1.5);
        doc.fontSize(9).fillColor('#1a56a0').text(`Stripe Receipt: ${data.receiptUrl}`);
      }

      doc.moveDown(2);
      doc.fontSize(8).fillColor('#94a3b8').text(
        'Thank you for choosing DrInsight. This invoice was generated automatically.',
        { align: 'center' },
      );

      doc.end();
    });
  }
}
