const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use((req, res) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Header', '*');
//   if (req.method === 'OPTIONS') {
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.status(200).json({});
//   }
// });

app.get('/', (_, res) => res.json({ ok: 'ok' }));

app.get('/test', (_, res) => {
  console.log('test');
  res.json({ ok: 'ok' });
});

// eslint-disable-next-line no-console
app.listen(port, (err) => console.log(err || `server listening on port ${port}`));
