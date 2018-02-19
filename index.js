const http = require('http')
const url = require('url')
const request = require('request')
const { JSDOM } = require('jsdom')

const { createLogger, transports } = require('winston')

const port = process.env.PORT || 3000

const logger = createLogger({
  transports: [
    // write all logs error (and below) to `error.log`.
    new transports.File({ filename: 'error.log', level: 'error' }),
    // write to all logs with level `info` and below to `info.log`
    new transports.File({ filename: 'info.log', level: 'info' })
  ]
})

const replaceLinks = (page, rootUrl) => {
  const pageDOM = new JSDOM(page)
  const links = pageDOM.window.document.body.querySelectorAll('a')

  links.forEach(link => {
    const isRelativeLink = link.href.charAt(0) === '/'
    link.href = isRelativeLink ? `/?url=${rootUrl}${link.href}` : `/?url=${link.href}`
  })

  return pageDOM.serialize()
}

const getOriginFromParsedUrl = (parsedUrl) => {
  if (parsedUrl) {
    return new url.URL(parsedUrl).origin
  }
  return ''
}

const onRequest = (req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const parsedQuery = parsedUrl.query
  const parsedOrigin = getOriginFromParsedUrl(parsedQuery.url)

  let data = ''

  if (parsedQuery.url) {
    logger.log({
      level: 'info',
      message: `${new Date()} - ${req.connection.remoteAddress} - ${parsedQuery.url}`
    })

    request({ url: parsedQuery.url })
      .on('data', chunk => {
        data += chunk
      })
      .on('end', () => {
        const page = replaceLinks(data, parsedOrigin)
        res.end(page)
      })
      .on('error', e => res.end(e.toString()))
  } else {
    res.end('no url found')
  }
}

http.createServer(onRequest).listen(port)
console.log(`Your own personal proxy is running at port ${port}`)
