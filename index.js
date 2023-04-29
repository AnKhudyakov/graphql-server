const express = require('express');
const cors = require('cors');
const jsonGraphqlExpress = require('json-graphql-server').default;

const PORT = process.env.PORT || 3004;
const DATA_DIR = './data';

const app = express();
app.use(cors());

const data = {};

// Load data from JSON files in the data directory
const fs = require('fs');
const path = require('path');
fs.readdirSync(DATA_DIR).forEach(file => {
  if (file.endsWith('.json')) {
    const name = path.basename(file, '.json');
    const json = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    data[name] = JSON.parse(json);
  }
});

// Serve GraphQL API at /graphql
app.use('/graphql', jsonGraphqlExpress(data));

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
