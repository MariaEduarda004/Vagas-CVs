import dotenv from 'dotenv';
dotenv.config();
import { es, INDEX } from '../src/services/es.js';

async function ensureIndex(name, body) {
  const exists = await es.indices.exists({ index: name });
  if (!exists) {
    await es.indices.create({ index: name, body });
    console.log(`Created index: ${name}`);
  } else {
    console.log(`Index already exists: ${name}`);
  }
}

const commonText = {
  type: "text",
  analyzer: "portuguese",
  fields: { keyword: { type: "keyword", ignore_above: 256 } }
};

const jobsBody = {
  settings: {
    analysis: {
      analyzer: {
        portuguese: { type: "standard", stopwords: "_portuguese_" }
      }
    }
  },
  mappings: {
    properties: {
      title: commonText,
      description: commonText,
      company: commonText,
      location: {
        properties: {
          city: { type: "keyword" },
          uf: { type: "keyword" },
          geo: { type: "geo_point" }
        }
      },
      salary_min: { type: "integer" },
      salary_max: { type: "integer" },
      seniority: { type: "keyword" }, 
      type: { type: "keyword" },      
      skills: { type: "keyword" },   
      created_at: { type: "date" }
    }
  }
};

const cvsBody = {
  settings: {
    analysis: {
      analyzer: {
        portuguese: { type: "standard", stopwords: "_portuguese_" }
      }
    }
  },
  mappings: {
    properties: {
      name: commonText,
      headline: commonText,
      summary: commonText,
      location: {
        properties: {
          city: { type: "keyword" },
          uf: { type: "keyword" },
          geo: { type: "geo_point" }
        }
      },
      years_exp: { type: "integer" },
      seniority: { type: "keyword" },
      skills: { type: "keyword" },
      desired_type: { type: "keyword" },
      created_at: { type: "date" }
    }
  }
};

(async () => {
  await ensureIndex(INDEX.JOBS, jobsBody);
  await ensureIndex(INDEX.CVS, cvsBody);
  process.exit(0);
})();
