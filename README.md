# Mentors Marketplace

This project is a marketplace to find developers and freelancers. A mentor can invite you to join a session. Once a session is complete,
clients can pay for the session using Stripe. Payouts to mentors are done using Stripe connect.

You can learn how to build this project from scratch on [JustDjango](http://learn.justdjango.com). 

Here is an overview of the features:
- See a list of mentors
- View a mentor's profile, including their ratings and reviews
- Realtime chat with mentors - provided by [TalkJS](https://talkjs.com/)
- Mentors can start a paid session with you
- Pay for a session using [Stripe](https://stripe.com/)
- Mentors receive payouts with [Stripe Connect](https://stripe.com/connect)
- Review a mentor after a session 
- View your session history as either a mentor or client

## Technologies Used

1. Django and Django Rest Framework
2. NextJS

## Setting up the project

This project was bootstrapped with Cookiecutter Django, hence the Django project can be setup with Docker or to run locally 
inside a virtual environment. The `frontend` folder contains the NextJS project.

Run through these steps to setup the project for the first time:

1. Set your environment variables for the Django project inside `.envs/local/.django` and for the NextJS project 
inside `frontend/.env.local`. You can use the `frontend/.env.template` file as a starting point.
2. For the Django project build the docker containers with `docker-compose -f local.yml build`
3. Install dependencies for the NextJS project with `cd frontend && npm i`
4. Run the Django docker project with `docker-compose -f local.yml up`
5. Run the NextJS project with `npm run dev`
6. Create superusers and test users
7. Django mentors are by default set `is_approved=False` which means they will not show up in search results until they 
are approved. Right now the only way approve is to manually via the Django admin.

[![Built with Cookiecutter Django](https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter-django/)
[![Black code style](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/ambv/black)

License: MIT

## Settings

Moved to [settings](http://cookiecutter-django.readthedocs.io/en/latest/settings.html).

## Basic Commands

### Setting Up Your Users

-   To create a **normal user account**, just go to Sign Up and fill out the form. Once you submit it, you'll see a "Verify Your E-mail Address" page. Go to your console to see a simulated email verification message. Copy the link into your browser. Now the user's email should be verified and ready to go.

-   To create an **superuser account**, use this command:

        $ python manage.py createsuperuser

For convenience, you can keep your normal user logged in on Chrome and your superuser logged in on Firefox (or similar), so that you can see how the site behaves for both kinds of users.

### Type checks

Running type checks with mypy:

    $ mypy mentors

### Test coverage

To run the tests, check your test coverage, and generate an HTML coverage report:

    $ coverage run -m pytest
    $ coverage html
    $ open htmlcov/index.html

#### Running tests with pytest

    $ pytest

### Live reloading and Sass CSS compilation

Moved to [Live reloading and SASS compilation](http://cookiecutter-django.readthedocs.io/en/latest/live-reloading-and-sass-compilation.html).

### Celery

This app comes with Celery.

To run a celery worker:

``` bash
cd mentors
celery -A config.celery_app worker -l info
```

Please note: For Celery's import magic to work, it is important *where* the celery commands are run. If you are in the same folder with *manage.py*, you should be right.

### Sentry

Sentry is an error logging aggregator service. You can sign up for a free account at <https://sentry.io/signup/?code=cookiecutter> or download and host it yourself.
The system is set up with reasonable defaults, including 404 logging and integration with the WSGI application.

You must set the DSN url in production.

## Deployment

The following details how to deploy this application.

### Docker

See detailed [cookiecutter-django Docker documentation](http://cookiecutter-django.readthedocs.io/en/latest/deployment-with-docker.html).
