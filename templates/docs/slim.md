## Slim Installation

1. Open **FhyServe** and go to the **PACK INSTALLER** menu.
2. Configure installation:

   * **Installation Location**: `public_html/apache_web` or `public_html/nginx_web`
   * **Choose a Packing**: Slim
   * **Select Version**: Latest
   * Click **Install**
   
3. Open the **MAIN** menu & Enable **CMD** Service
4. Type in CMD:

   * `go apache_web` for Apache or `go nginx_web` for Nginx
   * `cd slim`
   * `composer install`
   * `composer dump-autoload`
   
   *#Or you can run it directly via CMD with the command `php artisan serve` directly at this stage.*
   
5. Next, Enable the service according to the installation location (Apache or Nginx)
6. Go to `https://localhost:PORT/slim/public` to start the Slim site.