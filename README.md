# Install

`sudo apt-get install unoconv libreoffice imagemagick ruby1.9.3 postgresql`

## Set up DB

```
sudo -u postgres createuser -P snapppt # enter x8PSrT6Zvpq8 as password
sudo -u postgres createdb snapppt
cat db/schema.sql | PGUSER=snapppt PGPASSWORD=x8PSrT6Zvpq8 psql -h localhost snapppt
```

## Nodejs

```
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
```

## Backend deps

`npm install`

## Frontend build tools

```
sudo npm install -g grunt-cli bower
sudo gem install compass
```

## Build frontend

```
cd frontend
npm install
bower install
grunt build
```
