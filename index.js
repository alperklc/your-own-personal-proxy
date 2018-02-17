const http = require("http")
const url = require("url")
const request = require("request")
const validUrl = require("valid-url")

const port = process.env.PORT || 3000;

const replaceLinks = (data, rootUrl) => data.toString().replace(/href="/, `href="/?url=${rootUrl}`)

const onRequest = (req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const parsedQuery = parsedUrl.query

  let data = ""

  if (parsedQuery.url) {
    request({ url: parsedQuery.url })
      .on("data", chunk => {
        data += replaceLinks(chunk, parsedQuery.url)
      })
      .on("end", () => res.end(data))
      .on("error", e => res.end(e.toString()))
  }
  else {
    res.end("no url found")
  }
}

http.createServer(onRequest).listen(port)
console.log(`Your own personal proxy is running at port ${port}`);
