import fetch from "node-fetch";
import * as dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const URL = "https://api.football-data.org/v4/";

async function getData(endpoint) {
  const res = await fetch(URL + endpoint, {
    headers: {
      "X-Auth-Token": process.env.X_AUTH_TOKEN,
    },
  });

  if (res.status == 200) {
    return await res.json();
  } else {
    return { message: "Error: Data fetch from API failed." };
  }
}

async function upcoming() {
  const data = await getData("matches");

  let inplay = [];
  let scheduled = [];
  for (let match of data.matches) {
    if (match.status === "IN_PLAY" || match.status === "PAUSED") {
      inplay.push(match);
    } else {
      scheduled.push(match);
    }
  }

  console.log(chalk.blueBright("IN-PLAY:"));
  for (let match of inplay) {
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
  console.log(chalk.blueBright("SCHEDULED:"));
  for (let match of scheduled) {
    console.log(
      `${chalk.grey(
        new Date(match.utcDate).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      )} ${match.homeTeam.shortName} ${chalk.grey("vs")} ${
        match.awayTeam.shortName
      } ${chalk.grey(`(${match.competition.name})`)}`
    );
  }
}

upcoming();
