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
      // Prepare form data for upload
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

      // Upload resume data and profile image to backend preview endpoint
      const response = await axios.post('http://localhost:5000/api/resume/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Open preview in new window with HTML content
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(response.data);
      previewWindow.document.close();
    } catch (err) {
      console.error(err);
      alert('Failed to preview resume');
    } finally {
      setLoading(false);
    }
  };

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
        format,
      };
      const response = await axios.post('http://localhost:5000/api/resume/download_pdf_wkhtmltopdf', data, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
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
      <Typography variant="h4" gutterBottom>
        Resume Builder
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          sx={{ width: 200 }}
        >
          {formats.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          {format === 'modern' && (
            <Box sx={{ mb: 2 }}>
              <Button variant="contained" component="label" fullWidth>
                Upload Profile Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
            </Box>
          )}
          {profileImagePreview && format === 'modern' && (
            <Box sx={{ textAlign: 'center' }}>
              <img src={profileImagePreview} alt="Profile Preview" style={{ maxWidth: '100%', borderRadius: '50%' }} />
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
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
          />
          <TextField
          label="Job Role"
          fullWidth
          margin="normal"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
        />
          <Button variant="outlined" onClick={handleGetRoleSuggestion} disabled={loading || !jobRole} sx={{ mt: 1, mb: 2 }}>
            Get Professional Summary Suggestions
          </Button>
          {roleSuggestion && (
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="body1">{roleSuggestion}</Typography>
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
          />
        </Grid>
      </Grid>

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
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="body1">{skillSuggestion}</Typography>
        </Paper>
      )}
      <Button variant="outlined" onClick={handleGetSkillSuggestion} disabled={loading} sx={{ mb: 3 }}>
        Get Skill Suggestions
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
        <Button variant="contained" color="primary" onClick={handlePreview} disabled={loading}>
          Preview Resume
        </Button>
        <Button variant="outlined" color="primary" onClick={handleDownloadPdf} disabled={loading}>
          Download PDF
        </Button>
      </Box>
    </Container>
  );
};

export default ResumeBuilder;
