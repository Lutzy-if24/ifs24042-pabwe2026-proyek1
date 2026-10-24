const express = require('express');
const cors = require('cors');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const topicRoutes = require('./routes/topics');
const materialRoutes = require('./routes/materials');
const problemRoutes = require('./routes/problems');
const progressRoutes = require('./routes/progress');
const metaRoutes = require('./routes/meta');

const app = express();

app.use(cors({ origin: config.corsOrigins.includes('*') ? true : config.corsOrigins }));
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (req, res) => res.json({ data: { status: 'ok' } }));

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api', metaRoutes); // /levels, /competitions, /tags

app.use(notFound);
app.use(errorHandler);

module.exports = app;
