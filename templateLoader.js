const fs = require('fs')

const loadTemplate = (path, resolve, reject) => {
  fs.readFile(path, (error, content) => {
    if (error) {
      reject(error)
    } else {
      resolve(content)
    }
  })
}

const loadTopBannerTemplate = new Promise((resolve, reject) => {
  loadTemplate('./template/top-banner.html', resolve, reject)
})

const loadIndexPage = new Promise((resolve, reject) => {
  loadTemplate('./template/index.html', resolve, reject)
})

module.exports = {
  loadIndexPage,
  loadTopBannerTemplate
}

// TODO: use async await
