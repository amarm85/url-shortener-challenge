module.exports = {
  domain: {
    //host: process.env.DOMAIN_HOST,
    host:"localhost:3003",
    //protocol: process.env.DOMAIN_PROTOCOL,
    protocol: "http",
  },
  crypt: {
    SALT_ROUNDS: Number(process.env.SALT_ROUNDS),
    SECRET:'2Wd4-SDjwu-24457-rsjdA-45234',
  },
  Mongo: {
    HOST: process.env.MONGO_DB_HOST,
    PORT: Number(process.env.MONGO_DB_PORT),
    NAME: process.env.MONGO_DB_NAME,
    USER: process.env.MONGO_DB_USER,
    PASS: process.env.MONGO_DB_PASS,
    AUTH: process.env.MONGO_DB_AUTH,
    URL:'mongodb://mlab.url'
  }
};
