import 'dotenv/config';
import app from './app.js';
import { testDbConnection } from './config/db.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`FitClub Server is running on http://localhost:${PORT}`);
  await testDbConnection();
});
