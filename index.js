#!/usr/bin/env node
import fetch from "node-fetch";
import * as dotenv from "dotenv";
import chalk from "chalk";
import * as readline from "node:readline/promises"; // This uses the promise-based APIs
import { stdin, stdout } from "node:process";

let API_KEY;
const URL = "https://api.football-data.org/v4/";

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
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
    } else {
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
        )} ${match.homeTeam.shortName} ${chalk.yellowBright("0 - 0")} ${
          match.awayTeam.shortName
        } ${chalk.grey(`(${match.competition.name})`)}`
      );
    }
    console.log();
  }

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

const competitionID = {
  "Premier League": 2021,
  Championship: 2016,
  "Champions League": 2001,
  "Ligue 1": 2015,
  Bundesliga: 2002,
  "Serie A": 2019,
};

async function standings(competition) {
  competition = setDefaultCompetition();

  const data = await getData(
    `competitions/${competitionID[competition]}/standings`
  );

  if ("message" in data) {
    return;
  }

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
  for (const row of data.standings[0].table) {
    console.log(
      `${chalk.gray(ljust(row.position, 2))} ${ljust(
        row.team.shortName,
        18
      )} ${rjust(row.playedGames, 2)} ${rjust(row.won, 4)} ${rjust(
        row.draw,
        2
      )} ${rjust(row.lost, 2)} ${rjust(row.goalsFor, 4)} ${rjust(
        row.goalsAgainst,
        2
      )} ${rjust(row.goalDifference, 3)} ${chalk.yellowBright(
        rjust(row.points, 4)
      )}`
    );
  }
}

async function scorers(competition) {
  competition = setDefaultCompetition();

  const data = await getData(
    `competitions/${competitionID[competition]}/scorers`
  );

  if ("message" in data) {
    return;
  }

  console.log(chalk.blueBright("TOP GOALSCORERS:"));
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
  competition = setDefaultCompetition();

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

function getArgs() {
  let method;
  let competition;
  let team;
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
      competition = array[index + 1];
    } else if (val === "--team" || val === "-T") {
      team = array[index + 1];
    }
  });

  return [method, competition, team];
}

async function prompt(question, callback) {
  const stdin = process.stdin,
    stdout = process.stdout;

  stdin.resume();
  stdout.write(question);

  stdin.once("data", async function (data) {
    await callback(data.toString().trim());
  });
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
      process.exit();
    case "2":
      await fixtures(undefined);
      process.exit();
    case "3":
      await upcoming();
      process.exit();
    case "4":
      await scorers(undefined);
      process.exit();
    default:
      mainMenu();
  }
}

async function run() {
  let [method, competition, team] = getArgs();
  switch (method) {
    case "upcoming":
      await upcoming();
      break;
    case "standings":
      await standings(competition);
      break;
    case "scorers":
      await scorers(competition);
      break;
    case "fixtures":
      await fixtures(competition);
      break;
    default:
      mainMenu();
  }
}

await setAPIKey();
await mainMenu();
