const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (_, res) => res.json({ ok: 'ok' }));

// eslint-disable-next-line no-console
app.listen(port, (err) => console.log(err || `server listening on port ${port}`));
