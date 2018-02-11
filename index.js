const http = require("http")
const url = require("url")
const request = require("request")
const validUrl = require("valid-url")

const onRequest = (req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const parsedQuery = parsedUrl.query

  let data = ""

  if (parsedQuery.url) {
    request({ url: parsedQuery.url })
      .on("data", chunk => data += chunk)
      .on("end", () => res.end(data))
      .on("error", e => res.end(e))
  }
  else {
    res.end("no url found")
  }
}

http.createServer(onRequest).listen(3000)
