<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

This project is made for class. It is a simply development style project, therefore the containers are configured for a local development.

## Start the project

The project is (will be soon) fully dockerized. To start it, run these comands in order from this directory:

```bash
# build the containers
$ docker-compose build
```

```bash
# get them up and running
$ docker-compose up
```
Wait for the terminal to show that database is ready and the app has started. When everything is running nicely, open your browser to
```bash
http://localhost:4200/
```

## Stop the project

Dont forget to stop the containers and free up your ports! 

```bash
# to pause them
$ docker-compose stop
# Ctrl + C also works
```

```bash
# to remove them
$ docker-compose down
```
## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
