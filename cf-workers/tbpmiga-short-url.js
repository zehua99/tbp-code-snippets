/**
 * Redirect the user to a webpage given the short URL.
 * The variable “NAMESPACE” needs to be binded to a Workers KV.
 */
const SECRET = '[REDACTED]'
const HOME = 'https://tbp.engin.umich.edu'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = new URL(request.url)

  // For a URL like “tbpmi.ga/AP.”, the pathname equals “ap”
  let pathname = url.pathname.slice(1).toLowerCase()
  // Remove the trailing dot
  while (pathname.endsWith('.')) {
    pathname = pathname.slice(0, pathname.length - 1)
  }

  // Write operations
  if (pathname === '_update') {
    let { key, destination, secret, isOfficer } = await request.json()
    if (secret === SECRET) {
      if (!destination) {
        if (isOfficer) {
          await NAMESPACE.delete(key)
          await NAMESPACE.delete(key.toLowerCase())
        } else {
          return new Response("Unauthorized")
        }
      } else if (await NAMESPACE.get(key.toLowerCase()) !== undefined) {
        if (isOfficer) { // Only officers can update a URL
          await NAMESPACE.put(key.toLowerCase(), destination)
        } else {
          return new Response("Unauthorized")
        }
      } else {
        await NAMESPACE.put(key.toLowerCase(), destination)
      }
    }
    return Response.redirect(HOME, 302);
  } else if (pathname === '_list') {
    const existingRoutes = await NAMESPACE.list();
    const map = {}
    for (const key of existingRoutes.keys) {
        map[key.name] = await NAMESPACE.get(key.name)
    }
    return new Response(JSON.stringify(map, null, 2))
  }

  // Start the actual redirecting.
  if (pathname.length === 0) {
    return Response.redirect(HOME, 302);
  }

  const destinationURL = await NAMESPACE.get(pathname);
  if (destinationURL) {
    return Response.redirect(destinationURL, 302);
  }

  return new Response(`
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <title>TBP Short URL</title>
        <style>
            html, body {
              margin: 0;
              padding: 0;
            }

            .center {
                width: calc(100vw - 10px);
                height: calc(100vh - 10px);
                margin: auto;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .content {
                text-align: center;
                width: 400px;
            }
        </style>
    </head>

    <body>
        <div class="center">
            <div class="content">
                <h1>Page not found</h1>
                <span>Redirecting to <a href="https://tbp.engin.umich.edu">tbp.engin.umich.edu</a></span>
            </div>
        </div>
        
        <script>
            setTimeout(function() {
                window.location = "https://tbp.engin.umich.edu";
            }, 2000);
        </script>
    </body>

    </html>
  `.trim(), {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}
