const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  saveResume,
  getRoleSuggestions,
  getSkillSuggestions,
  downloadPdf,
  downloadPresentation,
  generatePdfWithWkhtmltopdf,
  renderResumePreview,
  generatePdfFromPreview,
  getResumeByEmail,
} = require('../controllers/resumeController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Use email from req.body.data JSON to create filename
    let emailPrefix = 'profileimage';
    try {
      if (req.body && req.body.data) {
        const data = JSON.parse(req.body.data);
        if (data.email) {
          emailPrefix = data.email.replace(/[@.]/g, '_');
        }
      }
    } catch (err) {
      // ignore JSON parse errors
    }
    cb(null, emailPrefix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/save', upload.single('profileImage'), saveResume);
router.post('/get_role_suggestions', getRoleSuggestions);
router.post('/get_skill_suggestions', getSkillSuggestions);
router.post('/download_pdf', downloadPdf);
router.get('/download_pdf/:filename', downloadPdf);
router.get('/download_presentation/:filename', downloadPresentation);

// New route for wkhtmltopdf PDF generation
router.post('/download_pdf_wkhtmltopdf', generatePdfWithWkhtmltopdf);

// New routes for server-rendered preview and download
router.post('/preview', upload.single('profileImage'), renderResumePreview);
router.post('/download', generatePdfFromPreview);

// New route to get resume by email
router.get('/get_resume/:email', getResumeByEmail);


module.exports = router;
