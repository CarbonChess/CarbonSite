var faunadb = window.faunadb;
var q = faunadb.query;
var client = new faunadb.Client({
    secret: 'your_key_here',
    domain: 'db.fauna.com',
    scheme: 'https',
  })
