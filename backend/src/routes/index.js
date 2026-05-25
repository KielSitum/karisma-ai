import authRoutes from '../services/auth/routes/index.js';
import cvRoutes from '../services/cv/routes/index.js';
import jobRoutes from '../services/jobs/routes/index.js';

export default function registerRoutes(app) {
  app.use('/auth', authRoutes);
  app.use('/cv', cvRoutes);
  app.use('/jobs', jobRoutes);
}
