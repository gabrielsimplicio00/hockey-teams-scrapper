import puppeteer from "puppeteer";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 10,
  });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://www.scrapethissite.com/pages/forms");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });
  page.setDefaultTimeout(120_000);

  let teamsRow;

  const teamNames = await page.$$eval(".team .name", (elements) => {
    elements.splice(21);
    return elements.map((element) => element.textContent.trim());
  });

  const teamData = [];
  const teamsInfo = [];

  for (let team of teamNames) {
    await page.waitForSelector("[type=submit]");
    await page.type("#q", team);
    await page.click("[type=submit]");

    teamsRow = await page.$$(".team");

    for (let teamRow of teamsRow) {
      teamData.push({ ...(await getTeamInfo(teamRow)) });
    }
    teamsInfo.push({ team, teamData });
    teamData.splice(0);

    await page.focus("#q");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
  }

  await browser.close();
})();

async function getTeamInfo(rowElement) {
  const teamName = await rowElement.$eval(".name", (teamName) =>
    teamName.textContent.trim()
  );
  const year = await rowElement.$eval(".year", (year) =>
    year.textContent.trim()
  );
  const wins = await rowElement.$eval(".wins", (wins) =>
    wins.textContent.trim()
  );
  const losses = await rowElement.$eval(".losses", (losses) =>
    losses.textContent.trim()
  );
  const ot_losses = await rowElement.$eval(".ot-losses", (ot_losses) =>
    ot_losses.textContent.trim()
  );
  const pctWin = await rowElement.$eval(".pct", (pctWin) =>
    pctWin.textContent.trim()
  );
  const goalsFor = await rowElement.$eval(".gf", (goalsFor) =>
    goalsFor.textContent.trim()
  );
  const goalsAgainst = await rowElement.$eval(".ga", (goalsAgainst) =>
    goalsAgainst.textContent.trim()
  );
  const goalsDiff = await rowElement.$eval(".diff", (goalsDiff) =>
    goalsDiff.textContent.trim()
  );

  return {
    // team: teamName,
    year,
    wins,
    losses,
    ot_losses,
    pctWin,
    goalsFor,
    goalsAgainst,
    goalsDiff,
  };
}

// function to get data through all of the pages, one by one
// async function paginateAndGetData(page) {
//   const teamData = [];

//   const pagesList = await page.$$eval(".pagination li a", (elements) => {
//     return elements.map((element) => element.getAttribute("href"));
//   });
//   pagesList.pop();

//   let currentPage = 0;

//   while (true) {
//     if (currentPage >= pagesList.length) break;

//     let newUrl = `http://www.scrapethissite.com${pagesList[currentPage]}`;
//     await page.goto(newUrl);

//     const teamsRow = await page.$$(".team");

//     for (let teamRow of teamsRow) {
//       teamsData.push(await getTeamInfo(teamRow));
//     }

//     currentPage++;
//   }
// }
