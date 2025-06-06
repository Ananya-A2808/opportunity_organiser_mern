import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Grid, MenuItem, Box, Paper, Chip, IconButton, Avatar
} from '@mui/material';
import { AddCircle, Delete } from '@mui/icons-material';
import axios from 'axios';

const formats = [
  { value: 'modern', label: 'Modern' },
  { value: 'professional', label: 'Professional' },
];

const ResumeBuilder = () => {
  const [format, setFormat] = useState('modern');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [professionalSummary, setProfessionalSummary] = useState('');
  const [education, setEducation] = useState([{ degree: '', institution: '', startYear: '', endYear: '' }]);
  const [experience, setExperience] = useState([{ title: '', company: '', startYear: '', endYear: '', description: '' }]);
  const [projects, setProjects] = useState([{ title: '', description: '' }]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [references, setReferences] = useState([{ name: '', contact: '' }]);
  const [loading, setLoading] = useState(false);
  const [roleSuggestion, setRoleSuggestion] = useState('');
  const [skillSuggestion, setSkillSuggestion] = useState('');
  const [previewContent, setPreviewContent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const storedEmail = sessionStorage.getItem('email');
  useEffect(() => {
    if (storedEmail) setEmail(storedEmail);
  }, [storedEmail]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImagePreview(null);
    }
  };

  const handleAddEducation = () => {
    setEducation([...education, { degree: '', institution: '', startYear: '', endYear: '' }]);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index, field, value) => {
    const newEdu = [...education];
    newEdu[index][field] = value;
    setEducation(newEdu);
  };

  const handleAddExperience = () => {
    setExperience([...experience, { title: '', company: '', startYear: '', endYear: '', description: '' }]);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };

  const handleAddProject = () => {
    setProjects([...projects, { title: '', description: '' }]);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...projects];
    newProjects[index][field] = value;
    setProjects(newProjects);
  };

  const handleAddReference = () => {
    setReferences([...references, { name: '', contact: '' }]);
  };

  const handleRemoveReference = (index) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const handleReferenceChange = (index, field, value) => {
    const newRefs = [...references];
    newRefs[index][field] = value;
    setReferences(newRefs);
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setSkills(skills.filter(skill => skill !== skillToDelete));
  };

  const handleGetRoleSuggestion = async () => {
    if (!jobRole) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/resume/get_role_suggestions', { summary: jobRole });
      setRoleSuggestion(res.data.suggestion);
      setProfessionalSummary(res.data.suggestion);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSkillSuggestion = async () => {
    if (!jobRole) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/resume/get_skill_suggestions', { skills: jobRole });
      let suggestionText = res.data.suggestion;

      // Parse suggestionText to extract keywords robustly
      let suggestedSkills = [];

      // Try splitting by commas, semicolons, or newlines
      if (suggestionText.includes(',')) {
        suggestedSkills = suggestionText.split(',').map(s => s.trim());
      } else if (suggestionText.includes(';')) {
        suggestedSkills = suggestionText.split(';').map(s => s.trim());
      } else if (suggestionText.includes('\n')) {
        suggestedSkills = suggestionText.split('\n').map(s => s.trim());
      } else {
        // Fallback: split by spaces and filter short words
        suggestedSkills = suggestionText.split(' ').map(s => s.trim()).filter(s => s.length > 2);
      }

      // Filter out empty strings and long sentences
      suggestedSkills = suggestedSkills.filter(s => s && s.length < 30);

      // Autofill skills with suggested skills without duplicates
      const newSkills = [...skills];
      suggestedSkills.forEach(skill => {
        if (!newSkills.includes(skill)) {
          newSkills.push(skill);
        }
      });

      setSkills(newSkills);
      setSkillSuggestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!email) {
      alert('Email is required');
      return;
    }
    setLoading(true);
    try {
      // Fetch resume data from backend by email
      const res = await axios.get(`http://localhost:5000/api/resume/get_resume/${encodeURIComponent(email)}`);
      const resumeData = res.data.resume;

      // Prepare formData for preview request
      const formData = new FormData();
      formData.append('data', JSON.stringify({ ...resumeData, format }));

      // Append profileImage file if format is modern and profileImage exists
      if (format === 'modern' && profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await axios.post('http://localhost:5000/api/resume/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      window.open('', '_blank').document.write(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to preview resume');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch existing resume data on component mount and populate form
  useEffect(() => {
    const fetchResume = async () => {
      if (!email) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/resume/get_resume/${email}`);
        const resumeData = res.data.resume;
        if (resumeData) {
          setName(resumeData.name || '');
          setJobRole(resumeData.jobRole || '');
          setProfessionalSummary(resumeData.professionalSummary || '');
          setEducation(resumeData.education || [{ degree: '', institution: '', startYear: '', endYear: '' }]);
          setExperience(resumeData.experience || [{ title: '', company: '', startYear: '', endYear: '', description: '' }]);
          setProjects(resumeData.projects || [{ title: '', description: '' }]);
          setSkills(resumeData.skills || []);
          setReferences(resumeData.references || [{ name: '', contact: '' }]);
          if (resumeData.profileImage) {
            setProfileImagePreview(`http://localhost:5000/uploads/${resumeData.profileImage}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch resume data:', err);
      }
    };
    fetchResume();
  }, [email]);

  // Save resume data to backend
  const handleSave = async () => {
    if (!email) {
      alert('Email is required');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const resumeData = {
        email,
        name,
        jobRole,
        professionalSummary: roleSuggestion || professionalSummary,
        education,
        experience,
        projects,
        skills,
        references,
        format,
      };
      formData.append('data', JSON.stringify(resumeData));
      if (format === 'modern' && profileImage) {
        formData.append('profileImage', profileImage);
      }
      await axios.post('http://localhost:5000/api/resume/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Resume saved successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save resume');
    } finally {
      setLoading(false);
    }
  };

  // Update resume data (same as save in this case)
  const handleUpdate = async () => {
    await handleSave();
  };
  
  // Add Save and Update buttons in the UI (to be added in the return JSX)

  const handleDownloadPdf = async () => {
    if (!email) {
      alert('Email is required');
      return;
    }
    setLoading(true);
    try {
      const data = {
        email,
        name,
        professionalSummary: roleSuggestion || professionalSummary,
        education,
        experience,
        projects,
        skills,
        references,
        format: 'modern',  // force modern format for PDF
      };
      // Use backend generatePdfFromPreview endpoint for HTML template based PDF generation
      const response = await axios.post('http://localhost:5000/api/resume/download', data);
      const filename = response.data.filename;
      const link = document.createElement('a');
      link.href = `http://localhost:5000/api/resume/download_pdf/${filename}`;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={12} sx={{ p: 4, bgcolor: 'rgba(18, 18, 18, 0.85)', boxShadow: '0 0 20px #b0b0b0' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#b0b0b0', textShadow: '0 0 10px #b0b0b0' }}>
          Resume Builder
        </Typography>
        <Box sx={{ mb: 3 }}>
          <TextField
            select
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            sx={{ width: 200, color: '#b0b0b0' }}
            InputLabelProps={{ style: { color: '#b0b0b0' } }}
            SelectProps={{ sx: { color: '#b0b0b0' } }}
          >
            {formats.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ color: '#b0b0b0' }}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            {format === 'modern' && (
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{ boxShadow: '0 0 10px #b0b0b0', '&:hover': { boxShadow: '0 0 20px #b0b0b0' } }}
                >
                  Upload Profile Image
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
              </Box>
            )}
            {profileImagePreview && format === 'modern' && (
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={profileImagePreview}
                  alt="Profile Preview"
                  sx={{ width: 120, height: 120, margin: '0 auto', boxShadow: '0 0 15px #b0b0b0' }}
                />
              </Box>
            )}
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputLabelProps={{ style: { color: '#b0b0b0' } }}
              InputProps={{ sx: { color: '#b0b0b0' } }}
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              InputLabelProps={{ style: { color: '#b0b0b0' } }}
              InputProps={{ sx: { color: '#b0b0b0' } }}
            />
            <TextField
              label="Job Role"
              fullWidth
              margin="normal"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              InputLabelProps={{ style: { color: '#b0b0b0' } }}
              InputProps={{ sx: { color: '#b0b0b0' } }}
            />
            <Button
              variant="outlined"
              onClick={handleGetRoleSuggestion}
              disabled={loading || !jobRole}
              sx={{ mt: 1, mb: 2, boxShadow: '0 0 10px #b0b0b0', '&:hover': { boxShadow: '0 0 20px #b0b0b0' } }}
            >
              Get Professional Summary Suggestions
            </Button>
            {roleSuggestion && (
              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#121212', boxShadow: '0 0 10px #b0b0b0' }}>
                <Typography variant="body1" sx={{ color: '#b0b0b0' }}>{roleSuggestion}</Typography>
              </Paper>
            )}
            <TextField
              label="Professional Summary"
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              value={professionalSummary}
              onChange={(e) => setProfessionalSummary(e.target.value)}
              InputLabelProps={{ style: { color: '#b0b0b0' } }}
              InputProps={{ sx: { color: '#b0b0b0' } }}
            />
          </Grid>
        </Grid>
      <Typography variant="h6" sx={{ mt: 4 }}>
        Skills
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Add Skill"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSkill();
            }
          }}
          sx={{ flexGrow: 1, mr: 1 }}
        />
        <Button variant="contained" onClick={handleAddSkill}>
          Add
        </Button>
      </Box>
      <Box sx={{ mb: 2 }}>
        {skills.map((skill) => (
          <Chip
            key={skill}
            label={skill}
            onDelete={() => handleDeleteSkill(skill)}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
      </Box>
      {skillSuggestion && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#121212', boxShadow: '0 0 10px #b0b0b0' }}>
          <Typography variant="body1" sx={{ color: '#b0b0b0' }}>{skillSuggestion}</Typography>
        </Paper>
      )}
      <Button variant="outlined" onClick={handleGetSkillSuggestion} disabled={loading} sx={{ mb: 3 }}>
        Get Skill Suggestions
      </Button>
      <Typography variant="h6" sx={{ mt: 4 }}>
        Education
      </Typography>
      {education.map((edu, index) => (
        <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Degree"
              fullWidth
              value={edu.degree}
              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Institution"
              fullWidth
              value={edu.institution}
              onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={1}>
            <TextField
              label="Start Year"
              fullWidth
              value={edu.startYear}
              onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={1}>
            <TextField
              label="End Year"
              fullWidth
              value={edu.endYear}
              onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton onClick={() => handleRemoveEducation(index)} color="error">
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddCircle />} onClick={handleAddEducation} sx={{ mb: 3 }}>
        Add Education
      </Button>
      <Typography variant="h6" sx={{ mt: 4 }}>
        Experience
      </Typography>
      {experience.map((exp, index) => (
        <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Title"
              fullWidth
              value={exp.title}
              onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Company"
              fullWidth
              value={exp.company}
              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={1}>
            <TextField
              label="Start Year"
              fullWidth
              value={exp.startYear}
              onChange={(e) => handleExperienceChange(index, 'startYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={1}>
            <TextField
              label="End Year"
              fullWidth
              value={exp.endYear}
              onChange={(e) => handleExperienceChange(index, 'endYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <IconButton onClick={() => handleRemoveExperience(index)} color="error">
              <Delete />
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={exp.description}
              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
            />
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddCircle />} onClick={handleAddExperience} sx={{ mb: 3 }}>
        Add Experience
      </Button>
      <Typography variant="h6" sx={{ mt: 4 }}>
        Projects
      </Typography>
      {projects.map((project, index) => (
        <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Project Title"
              fullWidth
              value={project.title}
              onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Project Description"
              fullWidth
              multiline
              minRows={2}
              value={project.description}
              onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <IconButton onClick={() => handleRemoveProject(index)} color="error">
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddCircle />} onClick={handleAddProject} sx={{ mb: 3 }}>
        Add Project
      </Button>
      <Typography variant="h6" sx={{ mt: 4 }}>
        References
      </Typography>
      {references.map((ref, index) => (
        <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Name"
              fullWidth
              value={ref.name}
              onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Contact"
              fullWidth
              value={ref.contact}
              onChange={(e) => handleReferenceChange(index, 'contact', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <IconButton onClick={() => handleRemoveReference(index)} color="error">
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button startIcon={<AddCircle />} onClick={handleAddReference} sx={{ mb: 3 }}>
        Add Reference
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handlePreview} disabled={loading} sx={{ boxShadow: '0 0 10px #e0e0e0', '&:hover': { boxShadow: '0 0 20px #e0e0e0' } }}>
          Preview Resume
        </Button>
        <Button variant="outlined" color="primary" onClick={handleDownloadPdf} disabled={loading} sx={{ boxShadow: '0 0 10px #e0e0e0', '&:hover': { boxShadow: '0 0 20px #e0e0e0' } }}>
          Download PDF
        </Button>
        <Button variant="contained" color="secondary" onClick={handleSave} disabled={loading} sx={{ boxShadow: '0 0 10px #e0e0e0', '&:hover': { boxShadow: '0 0 20px #e0e0e0' }, ml: 2 }}>
          Save Resume
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleUpdate} disabled={loading} sx={{ boxShadow: '0 0 10px #e0e0e0', '&:hover': { boxShadow: '0 0 20px #e0e0e0' }, ml: 2 }}>
          Update Resume
        </Button>
      </Box>
    </Paper>
  </Container>
  );
}

export default ResumeBuilder;

