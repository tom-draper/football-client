# Football CLI

A command-line tool for checking football scores, fixtures and standings.

Football data is sourced from https://www.football-data.org/, and a free account is required. You can enter your unique API token straight from the command-line during the setup routine, or set it as an environment variable in `X_AUTH_TOKEN` in a `.env` file at the root of the project.

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
node index
```

### Arguments

As an alternative to the main menu, the page (`standings`, `fixtures`, `upcoming` or `scorers`) can be specified as a command-line argument.

```bash
npx football-client standings
```

```bash
node index fixtures
```

When accessing standings, fixtures or scorers, the competition can be specified with the `--competition` flag. Available competitions include `premier-league`, `championship`, `la-liga`, `serie-a`, `ligue-1` and `bundesliga`. If none specified, the Premier League is used as default.

```bash
npx football-client fixtures --competition bundesliga
```

```bash
node index scorers --competition serie-a
```