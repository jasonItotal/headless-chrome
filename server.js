const express = require("express");
const puppeteer = require("puppeteer");
const app = express();

const resume_url = 'http://localhost:8080/resume'

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length; 

    let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

    console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
      countStableSizeIterations++;
    else 
      countStableSizeIterations = 0; //reset the counter

    if(countStableSizeIterations >= minStableSizeIterations) {
      console.log("Page rendered fully..");
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitFor(checkDurationMsecs);
  }  
};

app.get("/pdf", async (req, res) => {
    // var token = req.query.token
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgwNDk3MyIsImZpcnN0X25hbWUiOiJKYXNvIiwibGFzdF9uYW1lIjoibiIsInBob25lIjoiOTUxNTg1NzEiLCJuYmYiOjE2MTc4NzA1MjIsImV4cCI6MTYxODQ3NTMyMSwiaWF0IjoxNjE3ODcwNTIyfQ.J5-fbmodEYRvOmd9mscah0UvGXdi65ecHFPJtP42uIA'
    const url = `${resume_url}?token=${token}`;
    console.log('url',url)
    // const url = resume_url

    const browser = await puppeteer.launch({
        headless: true
    });

    const webPage = await browser.newPage();

    await webPage.goto(url, {'waitUntil':'networkidle0'});

    // await webPage.goto(url, {'timeout': 10000, 'waitUntil':'load'});
    // await waitTillHTMLRendered(page)
    
    const pdf = await webPage.pdf({
        printBackground: true,
        format: "A4"
    });

    await browser.close();

    res.contentType("application/pdf");
    res.send(pdf);
})

app.listen(1234, () => {
    console.log("Server started");
});
