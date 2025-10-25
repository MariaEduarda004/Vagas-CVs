import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
dotenv.config();

export const es = new Client({ node: process.env.ELASTIC_URL });

export const INDEX = {
  JOBS: process.env.JOBS_INDEX || 'jobs',
  CVS: process.env.CVS_INDEX || 'cvs'
};
