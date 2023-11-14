# Football CLI

A command-line tool for checking football scores, fixtures and standings.

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/41476809/224570149-0c594c23-40c7-4805-8684-2c45e15e7de0.gif" />
</p>

Football data is sourced from https://www.football-data.org/, and a free account is required. You can enter your unique API token straight from the command-line during the first run, or set it as an environment variable in `X_AUTH_TOKEN` in a `.env` file at the root of the project.

## Getting Started

The script can be run directly using `npx`:

```bash
npx football-client
```

### Installation

Alternatively, clone the project to your local machine with:

```bash
git clone https://github.com/tom-draper/football-client.git
```

Install dependencies with:

```bash
npm install
```

And then run using:

```bash
node main
```

### Arguments

The main menu can be skipped by passing the target page name (`standings`, `fixtures`, `upcoming` or `scorers`) as a command-line argument.

```bash
npx football-client standings
```

If a target page has been specified, the competition can also be provided using the `--comp` flag followed by a competition name (`premier-league`, `championship`, `la-liga`, `serie-a`, `ligue-1` or `bundesliga`). If none specified, the `premier-league` is used as default.

```bash
npx football-client standings --comp la-liga

npx football-client fixtures --comp bundesliga

npx football-client scorers --comp serie-a
```
