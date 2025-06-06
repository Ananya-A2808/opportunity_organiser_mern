const Imap = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const sanitizeHtml = require('sanitize-html');
const User = require('../models/User');
const { parse, isFuture } = require('date-fns');

const imapConfig = (email, password) => ({
  imap: {
    user: email,
    password: password,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }, // Added to ignore self-signed cert errors
    authTimeout: 10000,
  },
});

function categorize(subject, body) {
  const text = (subject + ' ' + body).toLowerCase();
  if (/internship|intern/.test(text)) return 'Internship';
  if (/full[- ]?time|job|position/.test(text)) return 'Full-time Job';
  if (/hackathon/.test(text)) return 'Hackathon';
  if (/opportunity|contest|competition/.test(text)) return 'Other Opportunities';
  if (/unsubscribe|spam|advertisement/.test(text)) return 'Ignore';
  return 'Other Opportunities';
}

function highlightKeywords(text) {
  const keywords = [
    'deadline',
    'apply',
    'CTC',
    'salary',
    'last date',
    'job',
    'internship',
  ];
  let highlighted = text;
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
    highlighted = highlighted.replace(
      regex,
      '<span style="background: #fff3cd; color: #a76f00; font-weight: bold;">$1</span>'
    );
  });
  // Highlight URLs
  highlighted = highlighted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" style="color:#4b0082; text-decoration:underline;">$1</a>'
  );
  return highlighted;
}

function cleanEmailBody(html) {
  let clean = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'a', 'span']),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'style'],
      img: ['src', 'alt'],
      span: ['style'],
    },
  });
  return clean;
}

function extractApplicationLink(body) {
  const linkMatch = body.match(/https?:\/\/[a-zA-Z0-9./?=_%-]+/);
  if (linkMatch) {
    const extractedLink = linkMatch[0];
    if (extractedLink.includes('http') && extractedLink.includes('.')) {
      return extractedLink;
    }
  }
  return 'Not provided';
}

function extractDeadline(plainText) {
  const lines = plainText.split('\n');
  const keywords = ['deadline', 'apply before', 'last date', 'register by', 'before'];
  for (const line of lines) {
    for (const kw of keywords) {
      if (line.toLowerCase().includes(kw)) {
        try {
          const parsedDate = parse(line, 'dd/MM/yyyy', new Date());
          if (isFuture(parsedDate)) {
            return parsedDate.toLocaleDateString();
          }
        } catch {}
      }
    }
  }
  // Fallback: try to parse any date in lines
  for (const line of lines) {
    try {
      const parsedDate = parse(line, 'dd/MM/yyyy', new Date());
      if (isFuture(parsedDate)) {
        return parsedDate.toLocaleDateString();
      }
    } catch {}
  }
  return 'Not found';
}

function extractEligibility(body) {
  const match = body.match(/eligibility[^:\n]*[:\n](.+)/i);
  if (match) {
    return match[1].trim();
  }
  return 'Not mentioned';
}

exports.fetchEmails = async (req, res) => {
  try {
    const { email, appPassword, forceRefresh } = req.body;
    if (!email || !appPassword) {
      return res.status(400).json({ message: 'Email and app password required' });
    }

    const user = await User.findOne({ email });
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (user && user.lastEmailFetchAt && user.emails.length > 0 && !forceRefresh) {
      if (user.lastEmailFetchAt > oneHourAgo) {
        // Return cached emails if last fetch was within 1 hour and no force refresh requested
        return res.status(200).json({ emails: user.emails });
      }
    }

    const config = imapConfig(email, appPassword);
    const connection = await Imap.connect(config);
    await connection.openBox('INBOX');

    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };

    const messages = await connection.search(searchCriteria, fetchOptions);
    const emails = [];

    for (let i = messages.length - 1; i >= Math.max(0, messages.length - 10); i--) {
      const parts = Imap.getParts(messages[i].attributes.struct);
      const all = await Promise.all(parts.map(async (part) => {
        if (part.disposition == null && part.type === 'text') {
          const partData = await connection.getPartData(messages[i], part);
          return partData;
        }
        return '';
      }));
      const body = all.join('');
      const header = messages[i].parts[0].body;
      const subject = header.subject ? header.subject[0] : '';
      const from = header.from ? header.from[0] : '';
      const date = header.date ? header.date[0] : '';

      const category = categorize(subject, body);
      if (category === 'Ignore') continue;

      // Extract plain text from HTML body for deadline and eligibility extraction
      const plainText = body.replace(/<[^>]+>/g, '\n');

      const application_link = extractApplicationLink(body);
      const deadline = extractDeadline(plainText);
      const eligibility = extractEligibility(body);
      const highlightedDescription = highlightKeywords(body);

      emails.push({
        subject,
        from,
        date,
        body: cleanEmailBody(body),
        category,
        application_link,
        deadline,
        eligibility,
        highlightedDescription,
      });
    }

    await connection.end();

    // Save emails and update lastEmailFetchAt timestamp atomically to avoid version errors
    if (user) {
      await User.findOneAndUpdate(
        { _id: user._id },
        { emails: emails, lastEmailFetchAt: new Date() },
        { new: true }
      );
    }

    res.status(200).json({ emails });
  } catch (error) {
    console.error('Fetch emails error:', error);
    res.status(500).json({ message: 'Failed to fetch emails' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user || !user.emails) return res.status(404).json({ message: 'No emails found' });

    const counts = user.emails.reduce((acc, email) => {
      acc[email.category] = (acc[email.category] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({ counts, total: user.emails.length });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOpportunitiesByCategory = async (req, res) => {
  try {
    const { email } = req.query;
    const { category } = req.params;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user || !user.emails) return res.status(404).json({ message: 'No emails found' });

    const filtered = user.emails.filter(e => e.category.toLowerCase() === category.toLowerCase());

    res.status(200).json({ opportunities: filtered });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
