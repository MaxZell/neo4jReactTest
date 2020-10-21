const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver')

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const cnx = {
    user: 'neo4j',
    password: '1234',
    uri: 'bolt://localhost:7687'
}

const driver = neo4j.driver(cnx.uri, neo4j.auth.basic(cnx.user, cnx.password))

driver.verifyConnectivity()
    .then((cnxMsg) => {
        console.log(cnxMsg)
    })

const session = driver.session({ database: 'neo4j' })

// API calls
// app.get('/api/hello', (req, res) => {
  // res.send({ express: 'Hello From Express' });
// });

app.post('/db/neo4j', (req, res) => {
  console.log(req.body);
  session.run(`MATCH (n { name: '${req.body.post}' }) return n`)
	 .subscribe({
		 onKeys: keys => {
			 console.log(keys)
		 },
		 onNext: record => {
			 console.log(record.get('n').properties.name)
			 console.log(record.get('n'))
		 },
		 onCompleted: () => {
			 // session.close()
		 },
		 onError: error => {
			 console.error(error) 
		 }
	 })
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'frontend/src')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend/src', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
