const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  startYear: String,
  endYear: String,
});

const ExperienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  startYear: String,
  endYear: String,
  description: String,
});

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const ReferenceSchema = new mongoose.Schema({
  name: String,
  contact: String,
});

const ResumeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  jobRole: String,
  professionalSummary: String,
  education: [EducationSchema],
  experience: [ExperienceSchema],
  projects: [ProjectSchema],
  skills: [String],
  references: [ReferenceSchema],
  profileImage: String,
  format: { type: String, default: 'modern' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', ResumeSchema);
