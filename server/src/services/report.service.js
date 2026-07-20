const { REPORT_TYPES } = require('../config/report.config');
const exceljs = require('exceljs');
const PDFDocument = require('pdfkit');
const { Transform } = require('stream');
const { AsyncParser } = require('json2csv');
const AuditLog = require('../models/AuditLog');

class ReportService {
  async getPreview(type, filters, user) {
    const startTime = Date.now();
    const config = REPORT_TYPES[type];
    if (!config) throw new Error(`Report type '${type}' not found.`);

    // Extract columns array from filters if it exists
    let selectedColumns = null;
    if (filters.columns) {
      selectedColumns = Array.isArray(filters.columns) ? filters.columns : filters.columns.split(',');
      delete filters.columns; // Don't use it for match query
    }

    const match = config.getMatchQuery(filters);
    const summary = await config.getSummary(match);
    
    // Limit preview to 50 records
    const data = await config.model
      .find(match)
      .sort(config.defaultSort)
      .limit(50)
      .lean();

    const formattedData = data.map(config.formatRecord);
    const totalRecords = await config.model.countDocuments(match);
    const executionTimeMs = Date.now() - startTime;

    const allColumns = config.getColumns();
    const columnsToReturn = selectedColumns 
      ? allColumns.filter(c => selectedColumns.includes(c.key))
      : allColumns;

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: user ? (user.name || user.email || user._id) : 'System',
        totalRecords,
        appliedFilters: filters,
        executionTimeMs,
        exportFormat: 'JSON Preview',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      summary,
      columns: columnsToReturn,
      data: formattedData
    };
  }

  async logExport(type, format, user) {
    const config = REPORT_TYPES[type];
    if (!user) return; // Might be system generated later, but for now we need a user
    
    await AuditLog.create({
      action: 'EXPORT_REPORT',
      entityType: 'Report',
      user: user._id,
      details: {
        reportType: type,
        reportName: config?.name || type,
        format
      }
    });
  }

  async exportCSV(type, filters, outputStream, user) {
    const config = REPORT_TYPES[type];
    if (!config) throw new Error(`Report type '${type}' not found.`);

    let selectedColumns = null;
    if (filters.columns) {
      selectedColumns = Array.isArray(filters.columns) ? filters.columns : filters.columns.split(',');
      delete filters.columns;
    }

    const match = config.getMatchQuery(filters);
    const allColumns = config.getColumns();
    const columns = selectedColumns ? allColumns.filter(c => selectedColumns.includes(c.key)) : allColumns;
    const fields = columns.map(c => ({ label: c.header, value: c.key }));
    
    const opts = { fields };
    const transformOpts = { objectMode: true };
    const asyncParser = new AsyncParser(opts, transformOpts);
    
    // Set headers only if it's an HTTP response
    if (outputStream.setHeader) {
      const filename = `${config.filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`;
      outputStream.setHeader('Content-Type', 'text/csv');
      outputStream.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    // Stream from DB directly to response
    const cursor = config.model.find(match).sort(config.defaultSort).cursor();
    
    const formatTransform = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        // Must convert Mongoose document to plain object
        const plain = chunk.toObject ? chunk.toObject() : chunk;
        callback(null, config.formatRecord(plain));
      }
    });

    cursor.pipe(formatTransform).pipe(asyncParser.processor).pipe(outputStream);
    
    // Wait for the cursor to finish so we can log
    return new Promise((resolve, reject) => {
      cursor.on('close', async () => {
        try {
          await this.logExport(type, 'CSV', user);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      cursor.on('error', reject);
    });
  }

  async exportExcel(type, filters, outputStream, user) {
    const config = REPORT_TYPES[type];
    if (!config) throw new Error(`Report type '${type}' not found.`);

    let selectedColumns = null;
    if (filters.columns) {
      selectedColumns = Array.isArray(filters.columns) ? filters.columns : filters.columns.split(',');
      delete filters.columns;
    }

    const match = config.getMatchQuery(filters);
    const allColumns = config.getColumns();
    const columns = selectedColumns ? allColumns.filter(c => selectedColumns.includes(c.key)) : allColumns;

    if (outputStream.setHeader) {
      const filename = `${config.filenamePrefix}_${new Date().toISOString().split('T')[0]}.xlsx`;
      outputStream.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      outputStream.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    const workbook = new exceljs.stream.xlsx.WorkbookWriter({ stream: outputStream });
    const worksheet = workbook.addWorksheet(config.name);

    worksheet.columns = columns.map(c => ({
      header: c.header,
      key: c.key,
      width: c.width
    }));

    // Add summary info at the top if needed (optional enhancement)
    // For simplicity, we just dump the data rows
    const cursor = config.model.find(match).sort(config.defaultSort).cursor();

    for await (const doc of cursor) {
      const plain = doc.toObject ? doc.toObject() : doc;
      const formatted = config.formatRecord(plain);
      worksheet.addRow(formatted).commit();
    }

    await workbook.commit();
    await this.logExport(type, 'EXCEL', user);
  }

  async exportPDF(type, filters, outputStream, user) {
    const config = REPORT_TYPES[type];
    if (!config) throw new Error(`Report type '${type}' not found.`);

    let selectedColumns = null;
    if (filters.columns) {
      selectedColumns = Array.isArray(filters.columns) ? filters.columns : filters.columns.split(',');
      delete filters.columns;
    }

    const match = config.getMatchQuery(filters);
    const allColumns = config.getColumns();
    const columns = selectedColumns ? allColumns.filter(c => selectedColumns.includes(c.key)) : allColumns;

    if (outputStream.setHeader) {
      const filename = `${config.filenamePrefix}_${new Date().toISOString().split('T')[0]}.pdf`;
      outputStream.setHeader('Content-Type', 'application/pdf');
      outputStream.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    doc.pipe(outputStream);

    // Header
    doc.fontSize(20).text(config.name, { align: 'center' });
    doc.moveDown();

    // Summary
    const summary = await config.getSummary(match);
    doc.fontSize(12);
    Object.entries(summary).forEach(([k, v]) => {
      doc.text(`${k}: ${v}`);
    });
    doc.moveDown();

    // Table Headers (simplified)
    const startX = 30;
    let currentY = doc.y;
    
    // Compute simple column widths for PDF
    const totalWidth = 780; // A4 landscape width minus margins
    const colWidth = totalWidth / columns.length;

    doc.fontSize(10).font('Helvetica-Bold');
    columns.forEach((col, i) => {
      doc.text(col.header, startX + (i * colWidth), currentY, { width: colWidth });
    });
    
    currentY += 15;
    doc.moveTo(startX, currentY).lineTo(startX + totalWidth, currentY).stroke();
    currentY += 5;

    doc.font('Helvetica');

    const cursor = config.model.find(match).sort(config.defaultSort).cursor();

    for await (const record of cursor) {
      const plain = record.toObject ? record.toObject() : record;
      const formatted = config.formatRecord(plain);
      
      // Check pagination
      if (currentY > 550) {
        doc.addPage();
        currentY = 30;
        
        // Redraw headers
        doc.fontSize(10).font('Helvetica-Bold');
        columns.forEach((col, i) => {
          doc.text(col.header, startX + (i * colWidth), currentY, { width: colWidth });
        });
        currentY += 15;
        doc.moveTo(startX, currentY).lineTo(startX + totalWidth, currentY).stroke();
        currentY += 5;
        doc.font('Helvetica');
      }

      columns.forEach((col, i) => {
        let val = formatted[col.key] || '';
        doc.text(String(val), startX + (i * colWidth), currentY, { width: colWidth - 5, height: 15, lineBreak: false });
      });
      currentY += 15;
    }

    doc.end();
    await this.logExport(type, 'PDF', user);
  }
}

module.exports = new ReportService();
