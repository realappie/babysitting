#users
	- Username : string
	- profile picture : string
	- email : string
	- uid : string
	- parent : boolean
	- babysitter : boolean
	- userType : Object { babySitter: boolean, parent: boolean}
	- Children : Array<{Age: Number, Name: String}>
	- pricing: Array<{ codename:string, description:string, rate: number }> 

<!-- Read only for admins -->
#privateBookings
	#pushID 
		- cost 	    : number
		- day	    : number 
		- endTime   : number
		- startTime : number
		- babysitter
			- accepted : boolean
			- email    : string
			- id 	   : string
			- name 	   : string
		    - paid 	   : boolean
		- parent
			- children : Object { age : number }
			- email    : string
			- id 	   : string
			- name     : string
			- paid     : boolean
			- street   : string
			- zipcode  : string

<!-- When a babysitter confirms a booking or a babysitter says they are busy-->
#availability
	#uid
		#week (unix seconds)
			#days (unix seconds)
				#pushID
					- startTime : number 
					- endTime : number

#babysitter
	- uid
	- birthDay: 
    - email: 
    - locationCity: 
    - name: 
    - photoURL: 
    - pricing: Array<{ codename:string, description:string, rate: number }> 
	
#bookingStatus
	- uid : string (Parent | Babysitter)
		- id : string (BookingID)
			- accepted   : boolean (Whether its accepted by the babysitter or not)
			- paid 	   	 : boolean (Whether its paid by the parent or not)
			- startTime  : number (Unix seconds)
			- endTime    : number (Unix seconds)
			- cost       : number
			- babysitter 
				- id 	 : string
				- email  : string
				- name 	 : string
			- parent
				- children : Object { age : number }
				- email    : string
				- id 	   : string
				- name     : string