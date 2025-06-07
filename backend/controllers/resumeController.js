const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const PPTXGenJS = require('pptxgenjs');
const { OpenAI } = require('openai');
const ejs = require('ejs');
const wkhtmltopdf = require('wkhtmltopdf');

const wkhtmltopdfConfig = {
  binary: "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe"
};
const { PassThrough } = require('stream');
const Resume = require('../models/Resume');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || undefined,
});

exports.saveResume = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    if (req.file) {
      data.profileImage = req.file.filename;
    }

    let resume = await Resume.findOne({ email: data.email });
    if (!resume) {
      resume = new Resume(data);
    } else {
      Object.assign(resume, data);
    }
    await resume.save();

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
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
    const resume = await Resume.findOne({ email });
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
    if (req.file) {
      data.profileImage = req.file.filename;
    }

    const format = data.format || 'modern';
    const mappedData = {
      name: data.name || '',
      title: data.jobRole || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      profile_image: data.profileImage || '',
      about: data.professionalSummary || '',
      skills: Array.isArray(data.skills) ? data.skills.join(', ') : ''
    };

    if (Array.isArray(data.education)) {
      mappedData.edu1 = data.education[0] ? `${data.education[0].degree} - ${data.education[0].institution} (${data.education[0].startYear} - ${data.education[0].endYear})` : '';
      mappedData.edu2 = data.education[1] ? `${data.education[1].degree} - ${data.education[1].institution} (${data.education[1].startYear} - ${data.education[1].endYear})` : '';
      mappedData.edu3 = data.education[2] ? `${data.education[2].degree} - ${data.education[2].institution} (${data.education[2].startYear} - ${data.education[2].endYear})` : '';
    }

    if (Array.isArray(data.experience)) {
      mappedData.exp1 = data.experience[0] ? `${data.experience[0].title} at ${data.experience[0].company} (${data.experience[0].startYear} - ${data.experience[0].endYear})` : '';
      mappedData.exp2 = data.experience[1] ? `${data.experience[1].title} at ${data.experience[1].company} (${data.experience[1].startYear} - ${data.experience[1].endYear})` : '';
    }

    if (Array.isArray(data.projects)) {
      mappedData.proj1 = data.projects[0] ? `${data.projects[0].title}: ${data.projects[0].description}` : '';
      mappedData.proj2 = data.projects[1] ? `${data.projects[1].title}: ${data.projects[1].description}` : '';
      mappedData.proj3 = data.projects[2] ? `${data.projects[2].title}: ${data.projects[2].description}` : '';
    }

    if (Array.isArray(data.references)) {
      mappedData.ref1 = data.references[0] ? `${data.references[0].name} - ${data.references[0].contact}` : '';
      mappedData.ref2 = data.references[1] ? `${data.references[1].name} - ${data.references[1].contact}` : '';
    }

    const templatePath = path.join(__dirname, '..', 'templates', format + '.html');
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
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
    const mappedData = {
      name: data.name || '',
      title: data.jobRole || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      profile_image: data.profileImage || '',
      about: data.professionalSummary || '',
      skills: Array.isArray(data.skills) ? data.skills.join(', ') : ''
    };

    if (Array.isArray(data.education)) {
      mappedData.edu1 = data.education[0] ? `${data.education[0].degree} - ${data.education[0].institution} (${data.education[0].startYear} - ${data.education[0].endYear})` : '';
      mappedData.edu2 = data.education[1] ? `${data.education[1].degree} - ${data.education[1].institution} (${data.education[1].startYear} - ${data.education[1].endYear})` : '';
      mappedData.edu3 = data.education[2] ? `${data.education[2].degree} - ${data.education[2].institution} (${data.education[2].startYear} - ${data.education[2].endYear})` : '';
    }

    if (Array.isArray(data.experience)) {
      mappedData.exp1 = data.experience[0] ? `${data.experience[0].title} at ${data.experience[0].company} (${data.experience[0].startYear} - ${data.experience[0].endYear})` : '';
      mappedData.exp2 = data.experience[1] ? `${data.experience[1].title} at ${data.experience[1].company} (${data.experience[1].startYear} - ${data.experience[1].endYear})` : '';
    }

    if (Array.isArray(data.references)) {
      mappedData.ref1 = data.references[0] ? `${data.references[0].name} - ${data.references[0].contact}` : '';
      mappedData.ref2 = data.references[1] ? `${data.references[1].name} - ${data.references[1].contact}` : '';
    }

    const templatePath = path.join(__dirname, '..', 'templates', format + '.html');
    const html = await ejs.renderFile(templatePath, { data: mappedData });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');

    const pdfStream = wkhtmltopdf(html, { pageSize: 'A4' });
    if (!pdfStream) {
      console.error('Download PDF error: wkhtmltopdf returned undefined');
      return res.status(404).json({ message: 'PDF generation error' });
    }
    pdfStream.pipe(res);
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.downloadPdf = exports.generatePdfFromPreview;

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

exports.getRoleSuggestions = async (req, res) => {
  try {
    const { input } = req.body;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Suggest 5 job roles related to: ${input}` }],
    });
    const suggestions = response.choices[0].message.content.split('\n').filter(Boolean);
    res.json({ suggestions });
  } catch (error) {
    console.error('getRoleSuggestions error:', error);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
};

exports.getSkillSuggestions = async (req, res) => {
  try {
    const { input } = req.body;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Suggest 5 relevant skills for: ${input}` }],
    });
    const suggestions = response.choices[0].message.content.split('\n').filter(Boolean);
    res.json({ suggestions });
  } catch (error) {
    console.error('getSkillSuggestions error:', error);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
};
// At the end of resumeController.js or near similar export functions

exports.generatePdfWithWkhtmltopdf = async (req, res) => {
  try {
    const data = req.body;
    const format = data.format || 'modern';

    const mappedData = {
      name: data.name || '',
      title: data.jobRole || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      profile_image: data.profileImage || '',
      about: data.professionalSummary || '',
      skills: Array.isArray(data.skills) ? data.skills.join(', ') : ''
    };

    if (Array.isArray(data.education)) {
      mappedData.edu1 = data.education[0] ? `${data.education[0].degree} - ${data.education[0].institution} (${data.education[0].startYear} - ${data.education[0].endYear})` : '';
      mappedData.edu2 = data.education[1] ? `${data.education[1].degree} - ${data.education[1].institution} (${data.education[1].startYear} - ${data.education[1].endYear})` : '';
      mappedData.edu3 = data.education[2] ? `${data.education[2].degree} - ${data.education[2].institution} (${data.education[2].startYear} - ${data.education[2].endYear})` : '';
    }

    if (Array.isArray(data.experience)) {
      mappedData.exp1 = data.experience[0] ? `${data.experience[0].title} at ${data.experience[0].company} (${data.experience[0].startYear} - ${data.experience[0].endYear})` : '';
      mappedData.exp2 = data.experience[1] ? `${data.experience[1].title} at ${data.experience[1].company} (${data.experience[1].startYear} - ${data.experience[1].endYear})` : '';
    }

    const templatePath = path.join(__dirname, '..', 'templates', format + '.html');
    const html = await ejs.renderFile(templatePath, { data: mappedData });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');

    const pdfStream = wkhtmltopdf(html, {
      pageSize: 'A4',
      marginTop: '0.75in',
      marginRight: '0.75in',
      marginBottom: '0.75in',
      marginLeft: '0.75in',
      ...wkhtmltopdfConfig
    });

    if (!pdfStream) {
      console.error('wkhtmltopdf returned undefined');
      return res.status(404).json({ message: 'PDF generation error' });
    }

    pdfStream.pipe(res);
  } catch (error) {
    console.error('generatePdfWithWkhtmltopdf error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
