const express = require('express');

const app = express();

const routes = require('./routes/routes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

const PORT = 8084;

app.listen(PORT, () => {
	console.log(`Running on ${PORT}`);
});
