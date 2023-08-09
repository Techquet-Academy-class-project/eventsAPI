# Events Web API

### project description.

this project is a web API where users can sign up create events and have people purchase tickets to their event and purchase tickets to other users Event
 link to the api documnetation with postman: (https://documenter.getpostman.com/view/10653175/2s9Xy2QXg3)
## Routes

The API has these endpoints.

#### No Auth Routes

- `GET /events` return all events
- `GET /events/available` return all events with available tickets
- `GET /events/id` return the event information and the number of available tickets [Note do not return the users who purchased the tickets]
- `GET /users/id` return a user and all his events [Not including the users who both his tickets]
- `POST /login`
- `POST /signup`

#### Auth Route

- `GET purchase/eventId` Buy a ticket of an event
- `GET /users/tickets` all tickets the logged in users purchased
- `GET /users/events` all events the logged in users created
- `GET /myevents` all my events
- `GET /myevents/:id` all my event information and all the users that purchased a ticket
- `PUT /update/eventId` update the logged in users event
- `GET /myprofile` every inforamtion about me except the password
- `PUT /update/Myprofile` [only email and name can be updated]
- `PUT /update/security` [only password can be updated here] and all other logged in devices token should be invalid

### Your Schema should look something like this

```
   eventSchema{
    createdBy : the ID of the user who created the event
    title :
    availableTickets : max number of people for the event,
    audience : [array of id's of users who bought your ticket : array length should not be longer than availableTickets],
    eventDate : Date
}

userSchema{
    name,
    email,
    password,
    tickets : [array of all tickets purchased],
    events : [array of ids of all events created]
    lastchangedPassword,
}
```

## Run the app

you can clone this repo.
   ` $ git clone https://github.com/Techquet-Academy-class-project/eventsAPI.git`

or download the zip file

run ` npm install ` or ` yarn install ` to install dependencies and ` npm start ` to start the app
