const http = require('http')
const url = require('url')
const request = require('request')
const { JSDOM } = require('jsdom')

const { createLogger, transports } = require('winston')

const { loadIndexPage, loadTopBannerTemplate } = require('./templateLoader')

const port = process.env.PORT || 3000

const logger = createLogger({
  transports: [
    // write all logs error (and below) to `error.log`.
    new transports.File({
      filename: 'error.log',
      level: 'error'
    }),
    // write to all logs with level `info` and below to `info.log`
    new transports.File({
      filename: 'info.log',
      level: 'info'
    })
  ]
})

const replaceLinks = (links, rootUrl) => {
  links.forEach(link => {
    const isRelativeLink = link.href.charAt(0) === '/'
    link.href = isRelativeLink ? `/?url=${rootUrl}${link.href}` : `/?url=${link.href}`
  })

  return links
}

const addTopBanner = (document, topBannerTemplate) => {
  const topBannerEl = document.createElement('div')
  topBannerEl.innerHTML = topBannerTemplate
  topBannerEl.style.top = 0
  topBannerEl.style.position = 'absolute'

  document.body.appendChild(topBannerEl)
  document.body.style.marginTop = '54px'

  return document
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

    request({
      url: parsedQuery.url
    })
      .on('data', chunk => {
        data += chunk
      })
      .on('end', () => {
        const pageDOM = new JSDOM(data)
        const bodyEl = pageDOM.window.document.body

        replaceLinks(bodyEl.querySelectorAll('a'), parsedOrigin)

        loadTopBannerTemplate.then((template) => {
          addTopBanner(pageDOM.window.document, template)
          res.end(pageDOM.serialize())
        })
      })
      .on('error', e => {
        logger.log({
          level: 'error',
          message: `${new Date()} - ${req.connection.remoteAddress} - ${parsedQuery.url} - ${e.toString()}`
        })
        res.end(e.toString())
      })
  } else {
    loadIndexPage.then((data) => {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(data, 'utf-8')
    })
  }
}

http.createServer(onRequest).listen(port)
console.log(`Your own personal proxy is running at port ${port}`)
