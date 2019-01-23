# Changing API end point or domain name

## Files

Once changing domain name or API end point, don't forget to change the values of the following. 

	- `server/public/scripts/payment.js`
		Line 2 and 4 would need to be modified to the new domain name and API end point

	- `scripts/script.js`
		Line 27 checks for the current domain to decide on whether to make requests to a local server othe heroku server
		make sure the values on line 27 and 28 are replaced by the new domain and API end point


## Heroku

Make sure you have both Api and website config variables in heroku in the settings tab

![Heroku config](http://image.prntscr.com/image/5ab84ecb2aad4db2aa70c82c6d485ab5.png)

# Development

For development, you will need to have nodemon globally installed. Once you have done that, you can run nodemon in the server of this project and it will run the server + listen for changes for you.

Try to ensure the server is running on port 8080, because thats the end point the front end will be making requests to if its also running locally.

You will have to use `gulp serve` for development of the front end. Please notice that this also applies for the admin panel under server/public/

## Adding new pages

If you want to add a new page in the front end, it will be as simple as creating an HTML file. a javascript controller if needed and a new SASS file 

Just create the javascript file under controllers and make sure you do it like so

```
app.controller('yourCtrlNameHere', ['$scope',
    function($scope) {

    }]);
```

Create the HTML file and put it under the `pages` folder 

Now you have to tell our router about it under `scripts/script.js` just extend it with a state like so

```
.state('yourStateName', {
    url: '/yourStateName',
    templateUrl: 'pages/about.html',
    data: {
        pageTitle: 'About',
        guests: true, // Decides whether this page will be accessible by not logged in users or not
        hidden: true, // Decided whether this page will be shown in the navigation header
        icon: "info_outline" // this icon will be used in the navigation menu on mobile devices
    }, 
	controller: "yourCtrlNameHere"
})		
```

For styling, you will just create a new file under the `sass` folder, your code will have to be wrapped under a class named to the state you created

so in this case, it would look a bit like this

```
.yourStateName{
	/*All your sass code here*/
}```

This is a form of style encapsulation.

The same principle applies for the admin panel.

### Deployment

For deployment you will need the `firebase-tools`

Because for deployments you need to build the project to ensure everything gets minified properly. You will be deploying using the `npm run deploy` command, which internally will be calling `gulp build & firebase deploy`

## Server development

### Routes

If you ever feel like adding new routes, I would recommend you to do so under the routes folder. Make sure your express routes get required in your server entry file `server.js` like my admin route.

### Emails

For sending anything related to emails, checkout my mail.js file. It will help you avoid repetitive code and will be a central point where all the emails will are saved. If you ever feel like changing the email markup, this will be the place to be.

### Braintree

Braintree is currently configured properly to work with the production environment, but if you ever change your account, you can change the config variables in `server.js`

