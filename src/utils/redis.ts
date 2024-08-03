import {createClient} from 'redis'
import log from './logger';

// for production use { url: "redis://localhost:6379" }
const client = createClient({
  password: "5DL7BSECvX6yH37kBdW9fsfVdm3oqM6r",
  socket: {
    host: "redis-16438.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 16438
  }
})

client.on('error', err => console.log('Redis Client Error', err));

client.connect();

client.on('connect', ()=> {
  log.info('connection with Redis')
})

process.on('SIGINT', async () => {
  await client.quit();
  process.exit();
});

export default client