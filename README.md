# your-own-personal-proxy
Bypass internet filtering by building your own tiny proxy server.

## Usage
`node index.js` or `npm run start` will run the proxy server.

If you browse the url where proxy server is deployed, you will see an index page inspired by [motherfuckingwebsite](http://www.motherfuckingwebsite.com).

Or the desired website could be browsed through the proxy by altering the `url` parameter at the end of URL:
`https://[YOUR-OWN-PROXY-SERVER-URL]/?url=[URL_OF_DESIRED_WEBSITE]`

Proxy server is also rendering a minimal banner on the top in every page it brings to the client, where user can type the URL of the website to browse.

## Capabilities
- Altering target of all relative links on the page for providing them behind the proxy. E.g: `/posts/{post-id}` => `https://[YOUR-OWN-PROXY-SERVER-URL]/?url=[URL_OF_DESIRED_WEBSITE]/posts/{post-id}`

- Logging access information and errors in `.log` files.