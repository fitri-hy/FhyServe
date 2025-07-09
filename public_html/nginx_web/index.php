<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Nginx</title>
  <style>
    body {
      width: 100%;
      height: 100vh;
      padding: 1rem;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(to right, #f1f5f9, #ffffff);
      font-family: sans-serif;
    }

    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    img {
      height: 6rem;
      width: auto;
    }

    .info-box {
      text-align: center;
      padding: 0.25rem 1rem;
      background-color: #10b981;
      color: white;
      border-radius: 9999px;
    }

    .info-box span {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <main>
    <img src="/icon.png" alt="nginx" />
    <p class="info-box">
      Root directory: <span>public_html/nginx_web/*</span>
    </p>
  </main>
</body>
</html>
