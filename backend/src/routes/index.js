import authRoutes from '../services/auth/routes/index.js';
import cvRoutes from '../services/cv/routes/index.js';
import jobRoutes from '../services/jobs/routes/index.js';

export default function registerRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/cv', cvRoutes);
  app.use('/api/jobs', jobRoutes);
}
