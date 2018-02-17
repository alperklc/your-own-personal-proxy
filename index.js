const http = require("http")
const url = require("url")
const request = require("request")
const validUrl = require("valid-url")
const { createLogger, transports } = require("winston")

const port = process.env.PORT || 3000;

const logger = createLogger({
  transports: [
    // write all logs error (and below) to `error.log`.
    new transports.File({ filename: 'error.log', level: 'error' }),
    // write to all logs with level `info` and below to `info.log`
    new transports.File({ filename: 'info.log', level: 'info' })
  ]
})

const replaceLinks = (data, rootUrl) => data.toString().replace(/href="/, `href="/?url=${rootUrl}`)

const onRequest = (req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const parsedQuery = parsedUrl.query

  let data = ""

  if (parsedQuery.url) {
    logger.log({
      level: 'info',
      message: `${new Date()} - ${req.connection.remoteAddress} - ${parsedQuery.url}`
    })

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
