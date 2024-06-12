# NestJS REST API with MongoDB and RabbitMQ

This is a simple REST API application built with NestJS, using MongoDB for data storage and RabbitMQ for messaging.

## Prerequisites

Before you start, ensure you have the following installed:

- Node.js (v20 or later)
- Yarn (v1.22 or later)

### MongoDB

MongoDB is a NoSQL database used to store our application data.

#### Installation

1. **Windows**:

    Download the MongoDB installer from the [official website](https://www.mongodb.com/try/download/community) and follow the installation instructions.

2. **Linux**:

    Follow the instructions for your specific Linux distribution on the [official website](https://docs.mongodb.com/manual/installation/).

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
