#!/usr/bin/env node
import fetch from "node-fetch";
import * as dotenv from "dotenv";
import chalk from "chalk";
import * as readline from "node:readline/promises"; // This uses the promise-based APIs
import { stdin as input, stdout as output } from "node:process";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let API_KEY;
const URL = "https://api.football-data.org/v4/";

const rl = readline.createInterface({
  input,
  output,
});

function clearLastLine() {
  process.stdout.moveCursor(0, -1); // Up one line
  process.stdout.clearLine(1); // From cursor to end
}

function clearLastLines(N) {
  for (let i = 0; i < N; i++) {
    clearLastLine();
  }
}

async function setAPIKey() {
  dotenv.config();

  API_KEY = process.env.X_AUTH_TOKEN;
  const noEnvFile = API_KEY === undefined;

  while (API_KEY === undefined || API_KEY.trim() === "") {
    API_KEY = await rl.question(
      chalk.yellowBright("Account required from ") +
        chalk.whiteBright("https://www.football-data.org/") +
        chalk.yellowBright(
          "\nCreate a free account and enter your unique API key."
        ) +
        "\nEnter X_AUTH_TOKEN: "
    );
    clearLastLines(3);
  }

  if (noEnvFile) {
    const store = await rl.question(
      "Save API key to .env in current directory? (Y/N) "
    );
    clearLastLine();

    if (store == "y" || store == "Y") {
      // Save API key to a local .env file
      fs.writeFile("./.env", `X_AUTH_TOKEN=${API_KEY}`, function (err) {
        if (err) {
          return console.log(err);
        }
      });
      console.log(`Saved API key to ${__dirname}/.env`);
    }
  }
}

async function getData(endpoint) {
  const res = await fetch(URL + endpoint, {
    headers: {
      "X-Auth-Token": API_KEY,
    },
  });

  if (res.status === 200) {
    return await res.json();
  } else if (res.status === 400) {
    console.log(
      chalk.redBright(`Error: API key invalid.\nStatus code: ${res.status}`)
    );
    return { message: "Error: Data fetch from API failed. API key invalid." };
  } else {
    console.log(
      chalk.redBright(
        `Error: Data fetch from API failed.\nStatus code: ${res.status}`
      )
    );
    return { message: "Error: Data fetch from API failed." };
  }
}

async function upcoming() {
  const data = await getData("matches");

  if ("message" in data) {
    return;
  }

  const inplay = [];
  const scheduled = [];
  for (const match of data.matches) {
    if (match.status === "IN_PLAY" || match.status === "PAUSED") {
      inplay.push(match);
    } else if (match.status === "SCHEDULED") {
      scheduled.push(match);
    }
  }

  if (inplay.length > 0) {
    console.log(chalk.blueBright(`IN-PLAY:`));
    for (const match of inplay) {
      console.log(
        `${chalk.grey(
          new Date(match.utcDate).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        )} ${ljust(
          match.homeTeam.shortName +
            chalk.grey(" vs ") +
            match.awayTeam.shortName,
          40
        )} ${chalk.grey(match.competition.name)}`
      );
    }
    if (scheduled.length > 0) {
      console.log();
    }
  }

  if (scheduled.length > 0) {
    console.log(chalk.blueBright(`SCHEDULED:`));
    for (const match of scheduled) {
      console.log(
        `${chalk.grey(
          new Date(match.utcDate).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        )} ${ljust(
          match.homeTeam.shortName +
            chalk.grey(" vs ") +
            match.awayTeam.shortName,
          40
        )} ${chalk.grey(`${match.competition.name}`)}`
      );
    }
  }
}

const competitionID = {
  "Premier League": 2021,
  Championship: 2016,
  "Champions League": 2001,
  "Ligue 1": 2015,
  Bundesliga: 2002,
  "Serie A": 2019,
  "Primera Division": 2014,
};

async function standings(competition) {
  competition = setDefaultCompetition(competition);

  const data = await getData(
    `competitions/${competitionID[competition]}/standings`
  );

  if ("message" in data) {
    return;
  }

  let total = 0;
  for (let row of data.standings[0].table) {
    total += row.playedGames;
  }
  const meanPlayed = total / data.standings[0].table.length;

  console.log(chalk.blueBright(`${competition.toUpperCase()} STANDINGS:`));
  console.log(
    rjust("Pl", 24),
    rjust("W", 4),
    rjust("D", 2),
    rjust("L", 2),
    rjust("GF", 4),
    rjust("GA", 2),
    rjust("GD", 3),
    rjust("P", 4)
  );
  for (const [i, row] of data.standings[0].table.entries()) {
    console.log(
      `${chalk.gray(ljust(row.position, 2))} ${formatStandingsTeamName(
        row.team.shortName,
        i + 1,
        18
      )} ${formatStandingsPlayed(row.playedGames, meanPlayed, 2)} ${rjust(
        row.won,
        4
      )} ${rjust(row.draw, 2)} ${rjust(row.lost, 2)} ${rjust(
        row.goalsFor,
        4
      )} ${rjust(row.goalsAgainst, 2)} ${formatStandingsGoalDifference(
        row.goalDifference,
        3
      )} ${chalk.yellowBright(rjust(row.points, 4))}`
    );
  }
}

function formatStandingsTeamName(teamName, position, padding) {
  if (position === 1) {
    return chalk.greenBright(ljust(teamName, padding));
  } else if (position > 1 && position < 5) {
    return chalk.cyanBright(ljust(teamName, padding));
  } else if (position > 17) {
    return chalk.redBright(ljust(teamName, padding));
  } else {
    return ljust(teamName, padding);
  }
}

function formatStandingsGoalDifference(gd, padding) {
  if (gd > 0) {
    return chalk.greenBright(rjust(gd, padding));
  } else if (gd < 0) {
    return chalk.redBright(rjust(gd, padding));
  } else {
    return rjust(gd, padding);
  }
}

function formatStandingsPlayed(pl, mean, padding) {
  if (pl > Math.ceil(mean)) {
    return chalk.greenBright(rjust(pl, padding));
  } else if (pl < Math.floor(mean)) {
    return chalk.redBright(rjust(pl, padding));
  } else {
    return rjust(pl, padding);
  }
}

async function scorers(competition) {
  competition = setDefaultCompetition(competition);

  const data = await getData(
    `competitions/${competitionID[competition]}/scorers`
  );

  if ("message" in data) {
    return;
  }

  console.log(chalk.blueBright("TOP GOALSCORERS:"));
  console.log(rjust("G", 42), rjust("A", 2));
  for (const player of data.scorers) {
    console.log(
      `${ljust(player.player.name, 22)} ${chalk.grey(
        ljust(`${player.team.shortName}`, 16)
      )} ${chalk.greenBright(rjust(player.goals, 2))} ${chalk.blueBright(
        rjust(player.assists, 2)
      )}`
    );
  }
}

async function fixtures(competition) {
  competition = setDefaultCompetition(competition);

  const data = await getData(
    `competitions/${competitionID[competition]}/matches`
  );

  if ("message" in data) {
    return;
  }

  console.log(chalk.blueBright(`${competition.toUpperCase()} FIXTURES:`));
  for (const match of data.matches) {
    const matchdate = new Date(match.utcDate);
    if (matchdate > new Date()) {
      console.log(
        `${chalk.grey(
          matchdate
            .toLocaleString()
            .replace(",", "")
            .replace(/:00$/, "")
            .replace("/20", "/")
            .replace(/\/\d\d /, " ")
        )}  ${match.homeTeam.shortName} ${chalk.grey("vs")} ${
          match.awayTeam.shortName
        }`
      );
    }
  }
}

function ljust(str, width) {
  str = str.toString();
  return str + " ".repeat(width).slice(str.length);
}

function rjust(str, width) {
  str = str.toString();
  return " ".repeat(width).slice(str.length) + str;
}

function setDefaultCompetition(current) {
  if (current === undefined) {
    return "Premier League";
  }
  return current;
}

const competitionAlias = {
  "premier-league": "Premier League",
  premier_league: "Premier League",
  pl: "Premier League",
  premier: "Premier League",
  cs: "Championship",
  championship: "Champsionship",
  efl: "Championship",
  l1: "Ligue 1",
  lu: "Ligue 1",
  "ligue-1": "Ligue 1",
  ligue_1: "Ligue 1",
  "ligue-un": "Ligue 1",
  ligue_un: "Ligue 1",
  bundesliga: "Bundesliga",
  bl: "Bundesliga",
  sa: "Serie A",
  "serie-a": "Serie A",
  serie_a: "Serie A",
  "la-liga": "Primera Division",
  la_liga: "Primera Division",
  ll: "Primera Division",
};

function getArgs() {
  let method;
  let competition;
  process.argv.forEach(function (val, index, array) {
    if (
      val === "upcoming" ||
      val === "standings" ||
      val === "scorers" ||
      val === "fixtures"
    ) {
      method = val;
    } else if (
      val === "--competition" ||
      val === "--comp" ||
      (val === "-C" && index < array.length - 1)
    ) {
      competition = competitionAlias[array[index + 1].toLowerCase()];
    }
  });

  return [method, competition];
}

async function mainMenu() {
  const input = await rl.question(
    `${chalk.yellowBright("1")} Standings\n${chalk.yellowBright(
      "2"
    )} Fixtures\n${chalk.yellowBright("3")} Upcoming\n${chalk.yellowBright(
      "4"
    )} Scorers\n`
  );

  clearLastLines(5);

  switch (input) {
    case "1":
      await standings(undefined);
      break;
    case "2":
      await fixtures(undefined);
      break;
    case "3":
      await upcoming();
      break;
    case "4":
      await scorers(undefined);
      break;
    default:
      await mainMenu();
  }
}

async function run() {
  let [method, competition] = getArgs();
  switch (method) {
    case "standings":
      await standings(competition);
      break;
    case "fixtures":
      await fixtures(competition);
      break;
    case "upcoming":
      await upcoming();
      break;
    case "scorers":
      await scorers(competition);
      break;
    default:
      await mainMenu();
  }
  process.exit();
}

await setAPIKey();
await run();
