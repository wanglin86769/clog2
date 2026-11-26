const path = require('path');
const fs = require('fs-extra');
const ExcelJS = require('exceljs');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    VerticalAlign,
} = require('docx');
const moment = require('moment');

// docx sizes are in half-points: 24 = 12pt, 28 = 14pt, 36 = 18pt
const FONT_TITLE = 36;
const FONT_HEADING = 28;
const FONT_BODY = 24;
const FONT_META = 22;

const TABLE_BORDERS = {
    top: { style: BorderStyle.SINGLE, size: 8, color: '999999' },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: '999999' },
    left: { style: BorderStyle.SINGLE, size: 8, color: '999999' },
    right: { style: BorderStyle.SINGLE, size: 8, color: '999999' },
};

const TABLE_WIDTH = 9000;
const LABEL_WIDTH = 2200;
const VALUE_WIDTH = 6800;


function stripHtml(html) {
    if (!html) return '';
    return String(html)
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+\n/g, '\n')
        .trim();
}


function formatDateTime(value) {
    if (!value) return '';
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
}


function formatDateForFilename(value) {
    return moment(value || new Date()).format('YYYY-MM-DD');
}


function buildExportFilename(format) {
    const ext = format === 'docx' ? 'docx' : 'xlsx';
    return `clog_export_${formatDateForFilename()}.${ext}`;
}


function buildExportAllFilename(format) {
    const ext = format === 'docx' ? 'docx' : 'xlsx';
    return `clog_export_all_${formatDateForFilename()}.${ext}`;
}


function setDownloadHeaders(res, filename, contentType) {
    const encoded = encodeURIComponent(filename);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/[^\x20-\x7E]/g, '_')}"; filename*=UTF-8''${encoded}`);
}


function getAuthorName(log) {
    if (!log || !log.createdBy) return '';
    if (typeof log.createdBy === 'string') return log.createdBy;
    return log.createdBy.name || '';
}


function getAuthorEmail(log) {
    if (!log || !log.createdBy) return '';
    if (typeof log.createdBy === 'string') return log.createdBy;
    return log.createdBy.email || '';
}


function getTagNames(log) {
    if (!log || !Array.isArray(log.tags) || !log.tags.length) return '';
    return log.tags
        .filter(Boolean)
        .map(tag => (typeof tag === 'string' ? tag : tag.name))
        .filter(Boolean)
        .join(', ');
}


function getAttachmentNames(log) {
    if (!log || !Array.isArray(log.attachments) || !log.attachments.length) return '';
    return log.attachments.map(item => item.name).filter(Boolean).join(', ');
}


async function loadAttachmentNames(attachmentdir, log) {
    try {
        const date = new Date(log.createdAt);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const fileDir = path.join(attachmentdir, year.toString(), month.toString(), day.toString(), log._id.toString());

        if (!(await fs.pathExists(fileDir))) {
            return [];
        }

        const files = await fs.readdir(fileDir);
        return (files || []).map(name => ({ name }));
    } catch (error) {
        console.log('Failed to load attachment names for export:', error.message);
        return [];
    }
}


function toExportRow(log) {
    return {
        createdAt: formatDateTime(log.createdAt),
        author: getAuthorName(log),
        email: getAuthorEmail(log),
        category: log.category || '',
        tags: getTagNames(log),
        title: log.title || '',
        description: stripHtml(log.description),
        attachments: getAttachmentNames(log),
    };
}


function textParagraphs(text, options = {}) {
    const {
        bold = false,
        size = FONT_BODY,
        spacingAfter = 60,
    } = options;

    const content = (text == null || text === '') ? ' ' : String(text);
    const lines = content.split(/\r?\n/);

    return lines.map(line => new Paragraph({
        children: [
            new TextRun({
                text: line || ' ',
                bold,
                size,
            }),
        ],
        spacing: { after: spacingAfter },
    }));
}


function createFieldRow(label, value) {
    return new TableRow({
        children: [
            new TableCell({
                borders: TABLE_BORDERS,
                width: { size: LABEL_WIDTH, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                shading: { fill: 'F5F5F5' },
                children: textParagraphs(label, { bold: true, size: FONT_BODY }),
            }),
            new TableCell({
                borders: TABLE_BORDERS,
                width: { size: VALUE_WIDTH, type: WidthType.DXA },
                children: textParagraphs(value, { size: FONT_BODY }),
            }),
        ],
    });
}


function createLogTable(row) {
    return new Table({
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        columnWidths: [LABEL_WIDTH, VALUE_WIDTH],
        rows: [
            createFieldRow('Created At', row.createdAt),
            createFieldRow('Author', row.author),
            createFieldRow('Email', row.email),
            createFieldRow('Category', row.category),
            createFieldRow('Tags', row.tags),
            createFieldRow('Title', row.title),
            createFieldRow('Description', row.description),
            createFieldRow('Attachments', row.attachments),
        ],
    });
}


async function writeExcel(res, logs, filename) {
    setDownloadHeaders(res, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
    const sheet = workbook.addWorksheet('Logs');

    sheet.columns = [
        { header: 'Created At', key: 'createdAt', width: 20 },
        { header: 'Author', key: 'author', width: 16 },
        { header: 'Email', key: 'email', width: 28 },
        { header: 'Category', key: 'category', width: 12 },
        { header: 'Tags', key: 'tags', width: 20 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Description', key: 'description', width: 60 },
        { header: 'Attachments', key: 'attachments', width: 40 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const log of logs) {
        sheet.addRow(toExportRow(log)).commit();
    }

    await workbook.commit();
}


async function writeExcelAll(res, sections, filename) {
    setDownloadHeaders(res, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
    const sheet = workbook.addWorksheet('Logs');

    sheet.columns = [
        { header: 'Logbook', key: 'logbook', width: 24 },
        { header: 'Created At', key: 'createdAt', width: 20 },
        { header: 'Author', key: 'author', width: 16 },
        { header: 'Email', key: 'email', width: 28 },
        { header: 'Category', key: 'category', width: 12 },
        { header: 'Tags', key: 'tags', width: 20 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Description', key: 'description', width: 60 },
        { header: 'Attachments', key: 'attachments', width: 40 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const section of sections) {
        for (const log of section.logs) {
            sheet.addRow({
                logbook: section.name || '',
                ...toExportRow(log),
            }).commit();
        }
    }

    await workbook.commit();
}


async function writeWord(res, logs, filename, logbookName) {
    const children = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
                new TextRun({
                    text: logbookName || 'Log Export',
                    bold: true,
                    size: FONT_TITLE,
                    color: '1D95F3',
                }),
            ],
        }),
        new Paragraph({
            spacing: { after: 400 },
            children: [
                new TextRun({
                    text: `Exported at ${formatDateTime(new Date())}`,
                    italics: true,
                    size: FONT_META,
                }),
            ],
        }),
    ];

    if (!logs.length) {
        children.push(new Paragraph({
            children: [
                new TextRun({
                    text: 'No logs matched the current filters.',
                    size: FONT_BODY,
                }),
            ],
        }));
    } else {
        logs.forEach((log, index) => {
            const row = toExportRow(log);

            children.push(new Paragraph({
                spacing: { before: index === 0 ? 120 : 360, after: 160 },
                children: [
                    new TextRun({
                        text: `${index + 1}. ${row.title || '(Untitled)'}`,
                        bold: true,
                        size: FONT_HEADING,
                        color: '1D95F3',
                    }),
                ],
            }));

            children.push(createLogTable(row));
        });
    }

    const doc = new Document({
        styles: {
            default: {
                document: {
                    styles: [{
                        id: 'Normal',
                        run: {
                            size: FONT_BODY,
                        },
                    }],
                },
            },
        },
        sections: [{
            properties: {},
            children,
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    setDownloadHeaders(res, filename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
}


function appendLogbookSection(children, section, isFirst) {
    children.push(new Paragraph({
        spacing: { before: isFirst ? 200 : 480, after: 200 },
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 12, color: '1D95F3', space: 4 },
        },
        children: [
            new TextRun({
                text: section.name || '(Untitled logbook)',
                bold: true,
                size: FONT_TITLE,
                color: '1D95F3',
            }),
        ],
    }));

    if (!section.logs || !section.logs.length) {
        children.push(new Paragraph({
            spacing: { after: 200 },
            children: [
                new TextRun({
                    text: 'No logs.',
                    italics: true,
                    size: FONT_BODY,
                }),
            ],
        }));
        return;
    }

    section.logs.forEach((log, index) => {
        const row = toExportRow(log);

        children.push(new Paragraph({
            spacing: { before: index === 0 ? 160 : 360, after: 160 },
            children: [
                new TextRun({
                    text: `${index + 1}. ${row.title || '(Untitled)'}`,
                    bold: true,
                    size: FONT_HEADING,
                    color: '1D95F3',
                }),
            ],
        }));

        children.push(createLogTable(row));
    });
}


async function writeWordAll(res, sections, filename) {
    const children = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
                new TextRun({
                    text: 'All Logbooks',
                    bold: true,
                    size: FONT_TITLE,
                    color: '1D95F3',
                }),
            ],
        }),
        new Paragraph({
            spacing: { after: 200 },
            children: [
                new TextRun({
                    text: `Exported at ${formatDateTime(new Date())}`,
                    italics: true,
                    size: FONT_META,
                }),
            ],
        }),
    ];

    if (!sections.length) {
        children.push(new Paragraph({
            children: [
                new TextRun({
                    text: 'No logbooks were found.',
                    size: FONT_BODY,
                }),
            ],
        }));
    } else {
        sections.forEach((section, index) => {
            appendLogbookSection(children, section, index === 0);
        });
    }

    const doc = new Document({
        styles: {
            default: {
                document: {
                    styles: [{
                        id: 'Normal',
                        run: {
                            size: FONT_BODY,
                        },
                    }],
                },
            },
        },
        sections: [{
            properties: {},
            children,
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    setDownloadHeaders(res, filename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
}


module.exports = {
    stripHtml,
    buildExportFilename,
    buildExportAllFilename,
    loadAttachmentNames,
    writeExcel,
    writeExcelAll,
    writeWord,
    writeWordAll,
};
