#Child groups

Childs age 1 to 2 = a
Childs age 2 to 5 = b
Childs age 5 to 8 = c
Childs age 8 to 12 = d
Childs age 12 + = e

#Booking flow

parent books -> 
email to babysitter ->
babysitter accepts -> 
booking confirmed status in database ->
payment email to parent ->
parents pays -> 
booking paid status in database ->
email to babysitter ->
money goes to you -> 
boss pays manually

#Booking status

- Pending (Babysitter has not accepted)
- Awaiting payment (Babysitter accepted, but the booking has been paid yet)

#login flow

users logs in -> 
	if parent, show booking page
	if babysitter, show appoinment requests page
	if neither, make them choose.
	if both, make them choose which page to go



Babysitter page 

Show a list of babysitters

Parent will chose a babysitter -> 
They will get an overview of the babysitter bookings ->
Parent books -> 
Server responses



#Deployment notes

##Braintree info

var gateway = braintree.connect({
  environment: braintree.Environment.Production,
  merchantId: "94n344n8n3dwz9db",
  publicKey: "jm4v8nwqj34v98xr",
  privateKey: "d4439b7ec1b85c75577e446186a569fc"
});

## Email hardcoded values

 	- Go to mail.js and ensure all emails are going to the correct person instead of the test values

	- find babysittersTest and replace it with babysitters

	- Check firebase rules comments
	
	- put `md-active="true"` on the your information tab under pages/account.html
	








---


- babysitters
	- workHours 
		- 0
			ms to ms ( default is 7AM to 8M | 25200000 - 72000000)
		- 1
		- 2 
		- 3
		- 4
		- 5
		- 6


86400000


7 divs
 2 selects (md-select) which is 14 in total
  48 options (increments of 1800000)


72000000 + 1800000


86,400,000

21600000 / 1800000 // 6  am
28800000 / 1800000 // 8 am
50400000 / 1800000 // 2 pm
57600000 / 1800000 // 4 pm


32400000 / 1800000


21600000