import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography, Avatar, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';


const ResumeHeader = ({ data, format }) => {
  const isProfessional = format === 'professional';
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        flexDirection: isProfessional ? 'column' : 'row',
        alignItems: 'center',
        textAlign: isProfessional ? 'center' : 'left',
        marginBottom: 4,
        borderBottom: `2px solid ${isProfessional ? '#555' : '#888'}`,
        paddingBottom: 2,
        gap: 2,
      }}
    >
      <Avatar
        alt={data.name}
        src={data.profileImage ? `http://localhost:5000/uploads/${data.profileImage}` : 'https://i.ibb.co/DGrKhr8/profile.png'}
        sx={{
          width: isProfessional ? 120 : 150,
          height: isProfessional ? 120 : 150,
          borderRadius: '50%',
          border: `2px solid ${isProfessional ? '#555' : '#888'}`,
          objectFit: 'cover',
          margin: isProfessional ? '0 auto' : 0,
        }}
      />
      <Box>
        <Typography
          variant="h3"
          sx={{
            margin: 0,
            fontSize: isProfessional ? '2.2em' : '2.5em',
            fontWeight: 'bold',
            color: '#222',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}
        >
          {data.name}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            margin: '10px 0',
            fontWeight: 'medium',
            color: '#555',
          }}
        >
          {data.jobRole}
        </Typography>
        <Typography sx={{ margin: '5px 0', color: '#666' }}>
          {data.phone && <>📞 {data.phone}</>}
          {data.email && <> | ✉️ {data.email}</>}
          {data.website && <> | 🌐 {data.website}</>}
        </Typography>
      </Box>
    </Box>
  );
};

const ResumeSection = ({ title, children }) => (
  <Box component="section" sx={{ marginBottom: 3 }}>
    <Typography
      variant="h6"
      sx={{
        textTransform: 'uppercase',
        borderBottom: '1px solid #ccc',
        paddingBottom: 1,
        marginBottom: 2,
        color: '#444',
        fontWeight: 'bold',
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

const ResumeView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [format, setFormat] = useState('professional');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simplified data loading: prefer location.state, then sessionStorage, else redirect
    if (location.state && location.state.resumeData) {
      setData(location.state.resumeData);
    } else {
      const storedData = sessionStorage.getItem('resumePreviewData');
      if (storedData) {
        setData(JSON.parse(storedData));
      } else {
        navigate('/resume');
      }
    }
  }, [location, navigate]);

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleFormatChange = (event) => {
    setFormat(event.target.value);
  };

  const handleDownloadPdf = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/resume/download_pdf',
        { ...data, format }
      );
      const filename = response.data.filename;
      const link = document.createElement('a');
      link.href = `http://localhost:5000/api/resume/download_pdf/${filename}`;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download PDF');
    }
    setLoading(false);
  };

  return (
    <Box id="resume-content" sx={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", lineHeight: 1.6, color: '#222', margin: 0, padding: 2, backgroundColor: '#f9f9f9' }}>
      <Container maxWidth="md" sx={{ padding: 4, backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <Paper sx={{ padding: 4, maxWidth: 800, margin: '0 auto' }}>
          <FormControl fullWidth sx={{ marginBottom: 3 }}>
            <InputLabel id="format-select-label">Resume Style</InputLabel>
            <Select labelId="format-select-label" id="format-select" value={format} label="Resume Style" onChange={handleFormatChange}>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="modern">Modern</MenuItem>
            </Select>
          </FormControl>

          <ResumeHeader data={data} format={format} />

          {format === 'professional' && (
            <>
              {data.professionalSummary && (
                <ResumeSection title="Professional Summary">
                  <Typography>{data.professionalSummary}</Typography>
                </ResumeSection>
              )}

              {data.education && data.education.length > 0 && (
                <ResumeSection title="Education">
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {data.education.map((edu, index) => (
                      <li key={index} style={{ marginBottom: 8, paddingLeft: 20, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#888' }}>•</span>
                        {edu.degree} - {edu.institution} ({edu.startYear} - {edu.endYear})
                      </li>
                    ))}
                  </ul>
                </ResumeSection>
              )}

              {data.experience && data.experience.length > 0 && (
                <ResumeSection title="Professional Experience">
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {data.experience.map((exp, index) => (
                      <li key={index} style={{ marginBottom: 8, paddingLeft: 20, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#888' }}>•</span>
                        <strong>{exp.title}</strong> at {exp.company} ({exp.startYear} - {exp.endYear})
                        <br />
                        {exp.description}
                      </li>
                    ))}
                  </ul>
                </ResumeSection>
              )}

              {data.skills && data.skills.length > 0 && (
                <ResumeSection title="Skills & Expertise">
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {data.skills.map((skill, index) => (
                      <Box
                        key={index}
                        sx={{
                          backgroundColor: '#ddd',
                          color: '#444',
                          padding: '4px 12px',
                          borderRadius: 1,
                          fontSize: '0.9em',
                          border: '1px solid #ccc',
                        }}
                      >
                        {skill}
                      </Box>
                    ))}
                  </Box>
                </ResumeSection>
              )}

              {data.references && data.references.length > 0 && (
                <ResumeSection title="Professional References">
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                    {data.references.map((ref, index) => (
                      <Box key={index} sx={{ borderLeft: '2px solid #888', paddingLeft: 2 }}>
                        {ref.name} - {ref.contact}
                      </Box>
                    ))}
                  </Box>
                </ResumeSection>
              )}
            </>
          )}

          {format === 'modern' && (
            <>
              <ResumeSection title="About Me">
                <Typography>{data.professionalSummary}</Typography>
              </ResumeSection>

              {data.education && data.education.length > 0 && (
                <ResumeSection title="Education">
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {data.education.map((edu, index) => (
                      <li key={index} style={{ marginBottom: 8, paddingLeft: 20, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#555' }}>•</span>
                        {edu.degree} - {edu.institution} ({edu.startYear} - {edu.endYear})
                      </li>
                    ))}
                  </ul>
                </ResumeSection>
              )}

              {data.experience && data.experience.length > 0 && (
                <ResumeSection title="Experience">
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {data.experience.map((exp, index) => (
                      <li key={index} style={{ marginBottom: 8, paddingLeft: 20, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#555' }}>•</span>
                        {exp.title} at {exp.company} ({exp.startYear} - {exp.endYear})
                      </li>
                    ))}
                  </ul>
                </ResumeSection>
              )}

              {data.skills && data.skills.length > 0 && (
                <ResumeSection title="Skills">
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {data.skills.map((skill, index) => (
                      <Box
                        key={index}
                        sx={{
                          backgroundColor: '#555',
                          color: 'white',
                          padding: '5px 15px',
                          borderRadius: '20px',
                          fontSize: '0.9em',
                        }}
                      >
                        {skill}
                      </Box>
                    ))}
                  </Box>
                </ResumeSection>
              )}

              {data.references && data.references.length > 0 && (
                <ResumeSection title="References">
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                    {data.references.map((ref, index) => (
                      <Box
                        key={index}
                        sx={{
                          backgroundColor: '#f0f0f0',
                          padding: 1.5,
                          borderRadius: 1,
                          borderLeft: '4px solid #555',
                        }}
                      >
                        {ref.name} - {ref.contact}
                      </Box>
                    ))}
                  </Box>
                </ResumeSection>
              )}
            </>
          )}

          <Box sx={{ textAlign: 'center', marginTop: 4 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/resume')}
              sx={{ marginRight: 2, backgroundColor: '#888', color: '#fff', '&:hover': { backgroundColor: '#666' } }}
            >
              Back to Resume Builder
            </Button>
            <Button
              variant="contained"
              onClick={handleDownloadPdf}
              disabled={loading}
              sx={{ backgroundColor: '#888', color: '#fff', '&:hover': { backgroundColor: '#666' } }}
            >
              {loading ? 'Downloading...' : 'Download PDF'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResumeView;
