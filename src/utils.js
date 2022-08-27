export function response(data) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

export function response_html(body, options) {
  return {
    statusCode: 200,
    body: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thew AI SIG</title>
  </head>
  <body>
    <h1>Thew AI SIG</h1>
    ${body}
  </body>
</html>`,
    ...options,
  };
}
