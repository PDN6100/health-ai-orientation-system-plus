const axios = require('axios');

async function testGPT4All() {
  try {
    const response = await axios.post('http://localhost:4891/completions', {
      prompt: "Donne des conseils pour un patient avec fièvre et maux de tête",
      max_tokens: 300
    });
    console.log(response.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

testGPT4All();
