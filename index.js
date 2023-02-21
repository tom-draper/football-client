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
    console.log("Status code:", res.status);
    return { message: "Error: Data fetch from API failed." };
  }
}

async function upcoming() {
  const data = await getData("matches");

  if ("message" in data) {
    return;
  }

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

const competitionID = {
  "Premier League": 2021,
  Championship: 2016,
  "Champions League": 2001,
  "Ligue 1": 2015,
  Bundesliga: 2002,
  "Serie A": 2019,
};

async function standings(competition) {
  const data = await getData(
    `competitions/${competitionID[competition]}/standings`
  );

  if ("message" in data) {
    return;
  }

  console.log(chalk.blueBright(`${competition.toUpperCase()} STANDINGS:`));
  for (let row of data.standings[0].table) {
    console.log(
      `${chalk.gray(row.position)} ${row.team.shortName} ${row.playedGames} ${
        row.won
      } ${row.draw} ${row.lost} ${row.goalsFor} ${row.goalsAgainst} ${
        row.goalDifference
      } ${row.lost} ${row.points}`
    );
  }
}

async function scorers(competition) {
  const data = await getData(
    `competitions/${competitionID[competition]}/scorers`
  );

  if ("message" in data) {
    return;
  }

  console.log(chalk.blueBright("TOP GOALSCORERS:"));
  for (let player of data.scorers) {
    console.log(
      `${player.player.name} ${chalk.grey(
        `(${player.team.shortName})`
      )} ${chalk.greenBright(player.goals)} ${chalk.blueBright(player.assists)}`
    );
  }
}

async function fixtures(competition) {
  const data = await getData(
    `competitions/${competitionID[competition]}/matches`
  );

  if ("message" in data) {
    return;
  }

  console.log(chalk.blueBright(`${competition.toUpperCase()} FIXTURES`));
  for (let match of data.matches) {
    const matchdate = new Date(match.utcDate);
    if (matchdate > new Date()) {
      console.log(
        `${chalk.grey(
          matchdate
            .toLocaleString()
            .replace(",", "")
            .replace(/:00$/, "")
            .replace("/20", "/")
        )} ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`
      );
    }
  }
}

upcoming();
standings("Premier League");
scorers("Premier League");
fixtures("Premier League");
