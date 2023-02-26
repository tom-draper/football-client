# Football CLI

A command-line tool for checking football scores, fixtures and standings.

Football data is sourced from https://www.football-data.org/, and a free account is required. You can enter your API key straight from the command line during the setup routine, or set it as an environment variable in `X_AUTH_TOKEN` in a `.env` file at the root of the project.

## Usage

The script can be run using `npx`:

```bash
npx football-client
```

### Installation

Alternatively, you can install directly on to your local system with:

```bash
npm i football-client
```

and then run using:

```bash
node src/index.js
```
