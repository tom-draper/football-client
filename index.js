import fetch from 'node-fetch';
import * as dotenv from 'dotenv'

dotenv.config()

const URL = 'https://api.football-data.org/v4/'

async function getData() {
  console.log(process.env.X_AUTH_TOKEN)
  const res = await fetch(URL + 'matches', {
    headers: {
      'X-Auth-Token': process.env.X_AUTH_TOKEN
    }
  });

  if (res.status == 200) {
    return await res.json();
  } else {
    return {'message': 'Error: Data fetch from API failed.'}
  }
}

let data = await getData();

console.log(data);
