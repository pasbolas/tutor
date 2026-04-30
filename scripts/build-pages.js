const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const layoutPath = path.join(root, "templates", "layout.html");
const loaderPath = path.join(root, "templates", "partials", "loader.html");
const pagesPath = path.join(root, "templates", "pages.json");

const layout = fs.readFileSync(layoutPath, "utf8");
const loaderTemplate = fs.readFileSync(loaderPath, "utf8");
const pages = JSON.parse(fs.readFileSync(pagesPath, "utf8"));

const applyTokens = (template, tokens) => {
  let result = template;
  Object.entries(tokens).forEach(([key, value]) => {
    result = result.replaceAll(`{{${key}}}`, value);
  });
  return result;
};

pages.forEach((page) => {
  const bodyPath = path.join(root, page.body);
  const body = fs.readFileSync(bodyPath, "utf8").trimEnd();
  const loader = applyTokens(loaderTemplate, {
    basePath: page.basePath,
    loaderMicro: page.loaderMicro,
    loaderMarkLabel: page.loaderMarkLabel,
    loaderMarkA: page.loaderMarkA,
    loaderMarkB: page.loaderMarkB,
  });

  const html = applyTokens(layout, {
    title: page.title,
    description: page.description,
    basePath: page.basePath,
    mainCssVersion: page.mainCssVersion,
    feedbackCssVersion: page.feedbackCssVersion,
    pageTransitionsVersion: page.pageTransitionsVersion,
    audioVersion: page.audioVersion,
    trailsVersion: page.trailsVersion,
    mainJsVersion: page.mainJsVersion,
    loader,
    body: `${body}\n`,
  });

  const outputPath = path.join(root, page.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
  console.log(`Wrote ${page.output}`);
});
