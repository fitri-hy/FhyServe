## Changing Default PORT

- Launch **FhyServe**.
- Click the setting **Config** section.
- Open and Edit **app.config.json**.

	```
	{
	  "APACHE_PORT": 8000,
	  "NGINX_PORT": 8080,
	  "PHP_FPM_PORT": 1111,
	  "MYSQL_PORT": 3306,
	  "NODEJS_PORT": 2999,
	  "PYTHON_PORT": 4000,
	  "GOLANG_PORT": 5000,
	  "RUBY_PORT": 4560
	}
	```

- **Save** and **Restart** Application.
