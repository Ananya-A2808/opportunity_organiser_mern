const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const PPTXGenJS = require('pptxgenjs');
const OpenAI = require('openai');
const ejs = require('ejs');
const wkhtmltopdf = require('wkhtmltopdf');

const wkhtmltopdfConfig = {
  binary: "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe" // Set the full path to wkhtmltopdf executable here
};
const { PassThrough } = require('stream');
const Resume = require('../models/Resume');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || undefined,
  // Add this to specify the Azure deployment if using Azure OpenAI
  // azure: {
  //   deploymentName: process.env.OPENAI_DEPLOYMENT_NAME,
  // },
});

exports.saveResume = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    if (req.file) {
      data.profileImage = req.file.filename;
    }

    // Save resume data to MongoDB (create or update)
    let resume = await Resume.findOne({ email: data.email });
    if (!resume) {
      resume = new Resume(data);
    } else {
      Object.assign(resume, data);
    }
    await resume.save();

    // Also save JSON file for backup or other uses
    const generatedDir = path.join(__dirname, '..', 'generated');
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir);
    }
    const savePath = path.join(generatedDir, `${data.email}_resume.json`);
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2));

    res.status(200).json({ message: 'Resume saved', data });
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getResumeByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    console.log('Fetching resume for email:', email);
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
    const resume = await Resume.findOne({ email });
    console.log('Resume found:', resume);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(200).json({ resume });
  } catch (error) {
    console.error('Get resume by email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.renderResumePreview = async (req, res) => {
  try {
    let data = req.body;
    if (typeof data.data === 'string') {
      data = JSON.parse(data.data);
    }
    console.log('req.file:', req.file);
    if (req.file) {
      data.profileImage = req.file.filename;
    }
    console.log('data.profileImage:', data.profileImage);

    const format = data.format || 'modern';

    // Map frontend data structure to template expected fields
    const mappedData = {};

    mappedData.name = data.name || '';
    mappedData.title = data.jobRole || '';
    mappedData.phone = data.phone || '';
    mappedData.email = data.email || '';
    mappedData.website = data.website || '';
    mappedData.profile_image = data.profileImage || '';

    mappedData.about = data.professionalSummary || '';

    // Map education array to edu1, edu2, edu3
    if (Array.isArray(data.education)) {
      mappedData.edu1 = data.education[0] ? `${data.education[0].degree} - ${data.education[0].institution} (${data.education[0].startYear} - ${data.education[0].endYear})` : '';
      mappedData.edu2 = data.education[1] ? `${data.education[1].degree} - ${data.education[1].institution} (${data.education[1].startYear} - ${data.education[1].endYear})` : '';
      mappedData.edu3 = data.education[2] ? `${data.education[2].degree} - ${data.education[2].institution} (${data.education[2].startYear} - ${data.education[2].endYear})` : '';
    }

    // Map experience array to exp1, exp2
    if (Array.isArray(data.experience)) {
      mappedData.exp1 = data.experience[0] ? `${data.experience[0].title} at ${data.experience[0].company} (${data.experience[0].startYear} - ${data.experience[0].endYear})` : '';
      mappedData.exp2 = data.experience[1] ? `${data.experience[1].title} at ${data.experience[1].company} (${data.experience[1].startYear} - ${data.experience[1].endYear})` : '';
    }

    // Map projects if any
    if (Array.isArray(data.projects)) {
      mappedData.proj1 = data.projects[0] ? `${data.projects[0].title}: ${data.projects[0].description}` : '';
      mappedData.proj2 = data.projects[1] ? `${data.projects[1].title}: ${data.projects[1].description}` : '';
      mappedData.proj3 = data.projects[2] ? `${data.projects[2].title}: ${data.projects[2].description}` : '';
    } else {
      mappedData.proj1 = '';
      mappedData.proj2 = '';
      mappedData.proj3 = '';
    }

    // Map skills array to comma separated string
    if (Array.isArray(data.skills)) {
      mappedData.skills = data.skills.join(', ');
    } else {
      mappedData.skills = '';
    }

    // Map references array to ref1, ref2
    if (Array.isArray(data.references)) {
      mappedData.ref1 = data.references[0] ? `${data.references[0].name} - ${data.references[0].contact}` : '';
      mappedData.ref2 = data.references[1] ? `${data.references[1].name} - ${data.references[1].contact}` : '';
    }

    // Render the appropriate template to HTML string
    const templatePath = path.join(__dirname, '..', 'templates', format + '.html');

    // Determine base URL for image paths
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    // Render the template directly as EJS without manual conversion
    const html = await ejs.renderFile(templatePath, { data: mappedData, baseUrl });

    res.send(html);
  } catch (error) {
    console.error('Render resume preview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generatePdfFromPreview = async (req, res) => {
  try {
    const data = req.body;
    const format = data.format || 'modern';

    // Map frontend data structure to template expected fields
    const mappedData = {};

    mappedData.name = data.name || '';
    mappedData.title = data.jobRole || '';
    mappedData.phone = data.phone || '';
    mappedData.email = data.email || '';
    mappedData.website = data.website || '';
    mappedData.profile_image = data.profileImage || '';

    mappedData.about = data.professionalSummary || '';

    // Map education array to edu1, edu2, edu3
    if (Array.isArray(data.education)) {
      mappedData.edu1 = data.education[0] ? `${data.education[0].degree} - ${data.education[0].institution} (${data.education[0].startYear} - ${data.education[0].endYear})` : '';
      mappedData.edu2 = data.education[1] ? `${data.education[1].degree} - ${data.education[1].institution} (${data.education[1].startYear} - ${data.education[1].endYear})` : '';
      mappedData.edu3 = data.education[2] ? `${data.education[2].degree} - ${data.education[2].institution} (${data.education[2].startYear} - ${data.education[2].endYear})` : '';
    }

    // Map experience array to exp1, exp2
    if (Array.isArray(data.experience)) {
      mappedData.exp1 = data.experience[0] ? `${data.experience[0].title} at ${data.experience[0].company} (${data.experience[0].startYear} - ${data.experience[0].endYear})` : '';
      mappedData.exp2 = data.experience[1] ? `${data.experience[1].title} at ${data.experience[1].company} (${data.experience[1].startYear} - ${data.experience[1].endYear})` : '';
    }

    // Map projects if any (not in frontend data, so leave empty)
    mappedData.proj1 = '';
    mappedData.proj2 = '';
    mappedData.proj3 = '';

    // Map skills array to comma separated string
    if (Array.isArray(data.skills)) {
      mappedData.skills = data.skills.join(', ');
    } else {
      mappedData.skills = '';
    }

    // Map references array to ref1, ref2
    if (Array.isArray(data.references)) {
      mappedData.ref1 = data.references[0] ? `${data.references[0].name} - ${data.references[0].contact}` : '';
      mappedData.ref2 = data.references[1] ? `${data.references[1].name} - ${data.references[1].contact}` : '';
    }

    // Render the appropriate template to HTML string
    const templatePath = path.join(__dirname, '..', 'templates', format + '.html');
    const html = await ejs.renderFile(templatePath, { data: mappedData });

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');

    // Use wkhtmltopdf to convert HTML to PDF and pipe to response
    wkhtmltopdf(html, { pageSize: 'A4', marginTop: '0.75in', marginRight: '0.75in', marginBottom: '0.75in', marginLeft: '0.75in' })
      .pipe(res);
  } catch (error) {
    console.error('Generate PDF from preview error:', error);
    res.status(500).json({ message: 'PDF generation error' });
  }
};

exports.generatePdfWithWkhtmltopdf = async (req, res) => {
  try {
    const data = req.body;
    const format = data.format || 'modern';

    // Map frontend data structure to template expected fields
    const mappedData = {};

    mappedData.name = data.name || '';
    mappedData.title = data.jobRole || '';
    mappedData.phone = data.phone || '';
    mappedData.email = data.email || '';
    mappedData.website = data.website || '';
    mappedData.profile_image = data.profileImage || '';

    mappedData.about = data.professionalSummary || '';

    // Map education array to edu1, edu2, edu3
    if (Array.isArray(data.education)) {
      mappedData.edu1 = data.education[0] ? `${data.education[0].degree} - ${data.education[0].institution} (${data.education[0].startYear} - ${data.education[0].endYear})` : '';
      mappedData.edu2 = data.education[1] ? `${data.education[1].degree} - ${data.education[1].institution} (${data.education[1].startYear} - ${data.education[1].endYear})` : '';
      mappedData.edu3 = data.education[2] ? `${data.education[2].degree} - ${data.education[2].institution} (${data.education[2].startYear} - ${data.education[2].endYear})` : '';
    }

    // Map experience array to exp1, exp2
    if (Array.isArray(data.experience)) {
      mappedData.exp1 = data.experience[0] ? `${data.experience[0].title} at ${data.experience[0].company} (${data.experience[0].startYear} - ${data.experience[0].endYear})` : '';
      mappedData.exp2 = data.experience[1] ? `${data.experience[1].title} at ${data.experience[1].company} (${data.experience[1].startYear} - ${data.experience[1].endYear})` : '';
    }

    // Map projects if any (not in frontend data, so leave empty)
    mappedData.proj1 = '';
    mappedData.proj2 = '';
    mappedData.proj3 = '';

    // Map skills array to comma separated string
    if (Array.isArray(data.skills)) {
      mappedData.skills = data.skills.join(', ');
    } else {
      mappedData.skills = '';
    }

    // Map references array to ref1, ref2
    if (Array.isArray(data.references)) {
      mappedData.ref1 = data.references[0] ? `${data.references[0].name} - ${data.references[0].contact}` : '';
      mappedData.ref2 = data.references[1] ? `${data.references[1].name} - ${data.references[1].contact}` : '';
    }

    // Render the appropriate template to HTML string
    const templatePath = path.join(__dirname, '..', 'templates', format + '.html');
    const html = await ejs.renderFile(templatePath, { data: mappedData });

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');

    // Use wkhtmltopdf to convert HTML to PDF and pipe to response
    wkhtmltopdf(html, { pageSize: 'A4', marginTop: '0.75in', marginRight: '0.75in', marginBottom: '0.75in', marginLeft: '0.75in' })
      .pipe(res);
  } catch (error) {
    console.error('WKHTMLTOPDF generation error:', error);
    res.status(500).json({ message: 'PDF generation error' });
  }
};


exports.getRoleSuggestions = async (req, res) => {
  try {
    const { summary } = req.body;
    if (!summary) return res.status(400).json({ message: 'Summary required' });

    const prompt = `Suggest professional summary for this text without any extra text:\n${summary}`;

    // Use createChatCompletion or createCompletion depending on your OpenAI package version
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
    });

    const suggestion = response.choices[0].message.content.trim();
    res.status(200).json({ suggestion });
  } catch (error) {
    console.error('Role suggestion error:', error);
    res.status(500).json({ message: 'OpenAI error', error: error.message });
  }
};

exports.getSkillSuggestions = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills) return res.status(400).json({ message: 'Skills required' });

    const prompt = `Provide a list of 5 additional skills as comma-separated keywords only, without any explanation or sentences, based on these:\n${skills}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
    });

    const suggestion = response.choices[0].message.content.trim();
    res.status(200).json({ suggestion });
  } catch (error) {
    console.error('Skill suggestion error:', error);
    res.status(500).json({ message: 'OpenAI error', error: error.message });
  }
};

function createPdf(data, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(20).text(data.name || 'Name', { align: 'center' });
    doc.moveDown();

    if (data.profileImage) {
      const imgPath = path.join(__dirname, '..', 'uploads', data.profileImage);
      if (fs.existsSync(imgPath)) {
        doc.image(imgPath, { fit: [100, 100], align: 'center' });
        doc.moveDown();
      }
    }

    doc.fontSize(14).text(data.professionalSummary || '', { align: 'left' });
    doc.moveDown();

    if (data.education && data.education.length) {
      doc.fontSize(16).text('Education', { underline: true });
      data.education.forEach(edu => {
        doc.fontSize(14).text(`${edu.degree} - ${edu.institution} (${edu.startYear} - ${edu.endYear})`);
        doc.moveDown(0.5);
      });
    }

    if (data.experience && data.experience.length) {
      doc.fontSize(16).text('Experience', { underline: true });
      data.experience.forEach(exp => {
        doc.fontSize(14).text(`${exp.title} at ${exp.company} (${exp.startYear} - ${exp.endYear})`);
        doc.text(exp.description);
        doc.moveDown(0.5);
      });
    }

    if (data.skills && data.skills.length) {
      doc.fontSize(16).text('Skills', { underline: true });
      doc.fontSize(14).text(data.skills.join(', '));
      doc.moveDown();
    }

    if (data.references && data.references.length) {
      doc.fontSize(16).text('References', { underline: true });
      data.references.forEach(ref => {
        doc.fontSize(14).text(`${ref.name} - ${ref.contact}`);
        doc.moveDown(0.5);
      });
    }

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

function createPresentation(data, outputPath) {
  return new Promise((resolve, reject) => {
    const pptx = new PPTXGenJS();

    pptx.addSlide().addText(data.name || 'Name', { x: 1, y: 1, fontSize: 36, bold: true });

    if (data.professionalSummary) {
      pptx.addSlide().addText('Professional Summary', { x: 0.5, y: 0.5, fontSize: 24, bold: true });
      pptx.addSlide().addText(data.professionalSummary, { x: 0.5, y: 1.5, fontSize: 18 });
    }

    if (data.education && data.education.length) {
      const slide = pptx.addSlide();
      slide.addText('Education', { x: 0.5, y: 0.5, fontSize: 24, bold: true });
      data.education.forEach((edu, i) => {
        slide.addText(`${edu.degree} - ${edu.institution} (${edu.startYear} - ${edu.endYear})`, { x: 0.5, y: 1 + i * 0.5, fontSize: 18 });
      });
    }

    if (data.experience && data.experience.length) {
      const slide = pptx.addSlide();
      slide.addText('Experience', { x: 0.5, y: 0.5, fontSize: 24, bold: true });
      data.experience.forEach((exp, i) => {
        slide.addText(`${exp.title} at ${exp.company} (${exp.startYear} - ${exp.endYear})`, { x: 0.5, y: 1 + i * 0.5, fontSize: 18 });
        slide.addText(exp.description, { x: 0.5, y: 1.3 + i * 0.5, fontSize: 14, color: '666666' });
      });
    }

    if (data.skills && data.skills.length) {
      const slide = pptx.addSlide();
      slide.addText('Skills', { x: 0.5, y: 0.5, fontSize: 24, bold: true });
      slide.addText(data.skills.join(', '), { x: 0.5, y: 1, fontSize: 18 });
    }

    if (data.references && data.references.length) {
      const slide = pptx.addSlide();
      slide.addText('References', { x: 0.5, y: 0.5, fontSize: 24, bold: true });
      data.references.forEach((ref, i) => {
        slide.addText(`${ref.name} - ${ref.contact}`, { x: 0.5, y: 1 + i * 0.5, fontSize: 18 });
      });
    }

    pptx.writeFile(outputPath).then(() => resolve()).catch(reject);
  });
}

exports.downloadPdf = async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      console.error('Download PDF error: No data in request body');
      return res.status(400).json({ message: 'No data provided' });
    }
    const format = data.format || 'modern';

    // Map frontend data structure to template expected fields
    const mappedData = {};

    mappedData.name = data.name || '';
    mappedData.title = data.jobRole || '';
    mappedData.phone = data.phone || '';
    mappedData.email = data.email || '';
    mappedData.website = data.website || '';
    mappedData.profile_image = data.profileImage || '';

    mappedData.about = data.professionalSummary || '';

    // Map education array to edu1, edu2, edu3
    if (Array.isArray(data.education)) {
      mappedData.edu1 = data.education[0] ? `${data.education[0].degree} - ${data.education[0].institution} (${data.education[0].startYear} - ${data.education[0].endYear})` : '';
      mappedData.edu2 = data.education[1] ? `${data.education[1].degree} - ${data.education[1].institution} (${data.education[1].startYear} - ${data.education[1].endYear})` : '';
      mappedData.edu3 = data.education[2] ? `${data.education[2].degree} - ${data.education[2].institution} (${data.education[2].startYear} - ${data.education[2].endYear})` : '';
    }

    // Map experience array to exp1, exp2
    if (Array.isArray(data.experience)) {
      mappedData.exp1 = data.experience[0] ? `${data.experience[0].title} at ${data.experience[0].company} (${data.experience[0].startYear} - ${data.experience[0].endYear})` : '';
      mappedData.exp2 = data.experience[1] ? `${data.experience[1].title} at ${data.experience[1].company} (${data.experience[1].startYear} - ${data.experience[1].endYear})` : '';
    }

    // Map projects if any (not in frontend data, so leave empty)
    mappedData.proj1 = '';
    mappedData.proj2 = '';
    mappedData.proj3 = '';

    // Map skills array to comma separated string
    if (Array.isArray(data.skills)) {
      mappedData.skills = data.skills.join(', ');
    } else {
      mappedData.skills = '';
    }

    // Map references array to ref1, ref2
    if (Array.isArray(data.references)) {
      mappedData.ref1 = data.references[0] ? `${data.references[0].name} - ${data.references[0].contact}` : '';
      mappedData.ref2 = data.references[1] ? `${data.references[1].name} - ${data.references[1].contact}` : '';
    }

    // Render the appropriate template to HTML string
    const templatePath = path.join(__dirname, '..', 'templates', format + '.html');
    const html = await ejs.renderFile(templatePath, { data: mappedData });

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');

    // Use wkhtmltopdf to convert HTML to PDF and pipe to response
    const pdfStream = wkhtmltopdf(html, { pageSize: 'A4', marginTop: '0.75in', marginRight: '0.75in', marginBottom: '0.75in', marginLeft: '0.75in' });
    if (!pdfStream) {
      console.error('Download PDF error: wkhtmltopdf returned undefined');
      return res.status(500).json({ message: 'PDF generation error' });
    }
    pdfStream.pipe(res);
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.downloadPresentation = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'generated', filename);
    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    } else {
      return res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Download presentation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
