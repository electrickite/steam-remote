# Steam Remote

A set of scripts for remote management of a PC running the Steam client for
remote play. A web service and web GUI can power the PC on and off, and allows
for account switching in the Steam client.

The Steam PC must be running Windows, and the web GUI client can be run on any
computer on the same network as the Steam PC.

## Server

A NodeJS server provides a web service API for controlling the PC power
functions and the Steam Client.

  1. Install NodeJS for Windows, version 22 LTS or higher
  2. Copy `server/config.example.js` to `server/config.js` and adjust settings
     as needed.
  3. The server can be started with `node server.js`
  4. Install a service manager to run the server process. PM2 can be installed
     with `npm install pm2 -g` and run using `server/start.bat`

You can access the web service at e.g.
[http://localhost:3000/info](http://localhost:3000/info)

### Windows Task Scheduler

Task Scheduler can be used to run the server at log on. Add a new task with the
following settings:

  * When running the task use the following account: Steam account
  * Run only when user is logged in
  * Hidden
  * Triggers: At log on, specific user. Steam user
  * Actions: Start a program, Path to `start.bat`, Start in `server` directory
  * Allow task to be run on demand
  * Run task as soon as possible

### Wake on LAN

In order to power on the Steam PC from the web GUI, the PC must be configured
to support Wake on LAN. This configures the network card to listen for special
"magic packets" and power on the computer if they are received.

Wake on LAN must be configured in two places:

  1. The system BIOS or UEFI setup utility. This is system dependent but can
     often be found under networking or advanced setup menus.
  2. Enable [Wake on LAN in Windows](https://www.windowscentral.com/software-apps/windows-11/how-to-enable-wake-on-lan-on-windows-11)

## Client

PHP scripts and assets in the `client` directory provide a simple web GUI that
uses the web service API to manage the Steam PC.

  1. Ensure the computer is on the same network as the Steam PC and has a web
     server with  PHP 8+
  2. Install the [Wake on Lan wol](https://sourceforge.net/projects/wake-on-lan/)
     utility on the host computer
  3. Copy the `client` directory to the host computer
  4. Copy `client/config.example.php` to `client/config.php` and adjust
     settings as needed.
  5. Configure the web server to serve the `client/public` directory at the
     desired path

### Steam Deck Setup

To access the web GUI on the Steam Deck in gaming mode:

  1. Switch to desktop mode
  2. Install Firefox from the Discover app
  3. In the Steam client, add a non-Steam game, and select Firefox
  4. Find the Firefox game in the Library and open Properties
  5. Adjust the name and icon as needed
  6. Change the launch options to: `run --branch=stable --arch=x86_64 --socket=wayland --env=MOZ_ENABLE_WAYLAND=1 --command=firefox --file-forwarding org.mozilla.firefox --kiosk --private-window "<web gui url>"`
  7. Open Firefox and visit `about:config`
  8. Add a String config setting called `general.useragent.override`
  9. Set it to `Mozilla/5.0 (X11; Linux x86_64; SteamDeck) Gecko/20100101 Firefox`
  10. Create a controller profile for the new game. Suggest starting with the
      Web Browser preset and customize. Keybaord shortcuts include:
      Tab/Shift+Tab to move focus between controls, Space/Enter to activate
      controls, Ctrl+W to quit, and Ctrl+/ to submit the form

## API

API actions are provided at paths relative to the base URL. Unless otherwise
noted, responses will be JSON encoded and in the format:

  * Success: `{ "message": "Message text" }`
  * Error: `{ "error": "Error message" }`

Request parameters must be included in the request body as a
`x-www-form-urlencoded` query string.

If authorization tokens have been included in the server configuration, an
Authorization header containing the bearer token must be included in each
request:

    Authorization: Bearer <token>

### info

`GET /info` Get system information

Response is a JSON encoded object including the following fields:

  * `active` (boolean) - Indicates if the Steam client is running
  * `pid` (int) - Process ID of Steam client
  * `userId` (int) - Steam account number (if signed in). Seems to be the Steam
     Friend Code presented in the client UI
  * `user` (string) - The Steam account name (if signed in) or "Unknown" if an
    account is signed in but not included in the server configuration
  * `accounts` (array) - The account names present in the server configuration

### start

`POST /start` Start the Steam client

Parameters:

  * `user` - Sign in with this Steam user account name. Must have signed in to
    the Steam client at least once with "Remember password" set and be included
    in the server accounts configuration.
  * `force` - Attempt to start Steam, even if it is already running

### stop

`POST /stop` - Shut down the Steam client

Parameters:

  * `force` - Attempt to stop Steam, even if it is not running

### restart

`POST /restart` Shut down and then start the Steam client

Parameters:

  * `user` - Sign in with this Steam user account name. Must have signed in to
    the Steam client at least once with "Remember password" set and be included
    in the server accounts configuration.
  * `force` - Attempt to stop and start Steam, even if it is already running

### poweroff

`POST /poweroff` - Shut down the PC

**NOTE**: There is no API to power on the PC!

### powercycle

`POST /powercycle` - Restart the PC
