# Football CLI

A command-line tool for checking football scores, fixtures and standings.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/41476809/224570149-0c594c23-40c7-4805-8684-2c45e15e7de0.gif" />
</p>

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

The main menu can be skipped by passing the target page name (`standings`, `fixtures`, `upcoming` or `scorers`) as a command-line argument.

```bash
npx football-client standings
```

When specifying standings, fixtures or scorers as a command-line argument, the competition can also be input using the `--competition` flag followed by the competition name (`premier-league`, `championship`, `la-liga`, `serie-a`, `ligue-1` or `bundesliga`). If none specified, the 'premier-league' is used as default.

```bash
npx football-client standings --competition la-liga

npx football-client fixtures --competition bundesliga

npx football-client scorers --competition serie-a
```
