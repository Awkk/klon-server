# Klon-Server

A GraphQL server that works with [Klon-Client](https://github.com/Awkk/klon-client) to mimic features of Reddit.

## About The Project

https://klon.andrewkkw.com/

![Klon Screen Shot](https://imgur.com/5zuUFWo.png)

### Built With

- [GraphQL](https://graphql.org/)
- [TypeGraphQL](https://typegraphql.com/)
- [Appollo](https://www.apollographql.com/)
- [TypeORM](https://typeorm.io/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Getting Started

Clone the project

```
$ git clone https://github.com/Awkk/klon-server.git
```

Install all dependencies

```
$ npm install
```

### Installation

Create file `.env` in root directory
and set up enviornment variables below:

- `PORT`

  port for the server to run on

- `DATABASE_URL`

  Database url to connect. Database used for storing all data.

- `REDIS_URL`

  Redis url to connect. Redis used for session based authentication.

- `SESSION_SECRET`

  Session secret for user authentication.

- `CORS_ORIGIN`

  The url for the front end.

- `SSL_PASSPHASE`

  Optional. Not needed when running in production enviornment. SSL passphase for the self-signed certificate.

### Executing program

Build the project

```bash
$ npm run build
```

Then run it

```bash
$ npm run start
```
