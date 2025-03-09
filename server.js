const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const app = express();
const port = 3000;

app.use(cors());

app.use(express.json({ limit: '20kb' })); // Limit request body size to 10kb

// Initialize SQLite database
const db = new sqlite3.Database('clipboard.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the clipboard database.');

  // Create the clipboard table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS clipboards (
      id TEXT PRIMARY KEY,
      content TEXT
    )
  `);
});

app.get('/:id', (req, res) => {
  fs.readFile('index.html', (err, html) => {
    if (err) {
      console.error('Error reading index.html:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(html);
    res.end();
  });
});

app.get('/', (req, res) => {
  fs.readFile('index.html', (err, html) => {
    if (err) {
      console.error('Error reading index.html:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(html);
    res.end();
  });
});

app.post('/api/create', (req, res) => {
  const content = req.body.content;

  if (!content) {
    return res.status(400).send({ error: 'Content is required' });
  }

  if (content.length > 20000) {
    return res.status(400).send({ error: 'Content exceeds 20,000 characters' });
  }

  db.get(`SELECT COUNT(*) AS count FROM clipboards`, (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send({ error: 'Failed to retrieve clipboard count' });
    }

    const id = encode(row.count);

    db.run(`INSERT INTO clipboards (id, content) VALUES (?, ?)`, [id, content], (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send({ error: 'Failed to save clipboard' });
      }
      res.send({ id });
    });
  });
});

app.get('/api/clipboard/:id', (req, res) => {
  const id = req.params.id;

  db.get(`SELECT content FROM clipboards WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send({ error: 'Failed to retrieve clipboard' });
    }

    if (!row) {
      return res.status(404).send({ error: 'Clipboard not found' });
    }

    res.send({ content: row.content });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});


function encode(n) {
  let str = ((n+1) * 2524).toString(36);
  const shift = (n * 97) % 36;
  const pattern = "0123456789abcdefghijklmnopqrstuvwxyz";
  let ret = "";
  for (let i = 0; i < str.length; i++) {
    ret += pattern[(pattern.indexOf(str[i]) + shift) % pattern.length];
  }
  ret = pattern[shift] + ret;
  return ret.toUpperCase();
}

app.get('/api/count', (req, res) => {
  db.get(`SELECT COUNT(*) AS count FROM clipboards`, (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send({ error: 'Failed to retrieve clipboard count' });
    }
    res.send({ count: row.count });
  });
});
