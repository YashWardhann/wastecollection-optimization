const saritaVihar = { lat: 28.527958, lng: 77.289787 };
const origin = { lat: 28.527958, lng: 77.289787 };

let rounds = []; // Stores details of rounds
let empty = new Round(); // An empty round variable for pushback
let trucks = []; // Array of trucks
let emptrk = new Truck(); // Distances from node to landfill, landfill to node and capcity of sites
let emptysite = new Collsite();

var lfill_index; // Not in use

let sitelist = []; // Array to store sitelists
let n, m, k, trx, trcap, currcap=0 ,currt=0, lastvisit = -1, rdcnt = -1;

var lfill = 1; // Set landfills index


let map;
let markers = []; // Array to store markers
let distances = []; // Array to store time between 2 markers
let index = 0;
let bt = document.getElementById('dis');

var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

// Initializes Map
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: saritaVihar,
		zoom: 14,
		styles: [
    {
        "featureType": "landscape",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "stylers": [
            {
                "hue": "#00aaff"
            },
            {
                "saturation": -100
            },
            {
                "gamma": 2.15
            },
            {
                "lightness": 12
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": 24
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 57
            }
        ]
    }
]
	});

	// Place markers on click
	map.addListener('click', function (e) {
		placeMarker(e.latLng, map);
	});
}


// Accepts markers parameters
function placeMarker(position, map) {


	var marker = new google.maps.Marker({
		position: position,
		map: map,
		title: 'Garbage Can',
		icon: {
			 path: google.maps.SymbolPath.CIRCLE,
			 strokeColor:colorArray[Math.floor(Math.random() * colorArray.length) + 1] ,
			 scale: 3
	 }
	});
	// map.panTo(position);

	// Set marker parameters

	swal.setDefaults({
  input: 'text',
  confirmButtonText: 'Next &rarr;',
  showCancelButton: true,
  progressSteps: ['1', '2', '3']
})

// Save parameters in an array
var steps = [
  {
    title: 'Enter Site Capacity',

  },
   {
    title: 'Enter Site Targeted Population',

  },
  'Enter the Waste Produced Per Capita'
]


swal.queue(steps).then((result) => {
  swal.resetDefaults()

  if (result.value) {
		swal(
			'Success',
			'Garbage can has been added',
			'success'
		)

		// Getting parameters from the array
		var siteCap = result.value[0];
		var targetPopulation = result.value[1];
		var perCapita = result.value[2];

		// Popup for markers
		var contentString = "<div id = 'heading' style = 'font-size: 21px; font-weight: 700;'> Garbage #" + Number(markers.length) +"</div> <div class = 'capacity' style = 'margin-top: 6px;'> Capacity: "+ siteCap +" kg</div><div class = 'capacity' style = 'margin-top: 6px;'> Population: "+ targetPopulation +"</div><div class = 'pop' style = 'margin-top: 6px;'>Waste Produced Per Capita: "+perCapita+" kg</div>";

		// Add popup to the marker
		var infowindow = new google.maps.InfoWindow({
			content: contentString
		});

		// Show popup on click
		marker.addListener('click', function() {
					infowindow.open(map, marker);
		});

		markers.push({
			index: index,	// index of the marker
			lat: marker.getPosition().lat(),	// latitude
			lng: marker.getPosition().lng(),	// longitude
			cap: siteCap,	// capacity of site
			pop: targetPopulation,	// targeted population
			perCap: perCapita	// waste produced per capita
		})

		index++; // Increase index for next marker


  }
})
}



bt.addEventListener('click', function() {


	for(var i = 0; i < markers.length; i++)
	{
		var node_element = markers[i]; // Get 1 node

		var can = new Collsite(node_element.cap, false, 0,0,[]); // ?

		sitelist.push(can); // Add a new site in sitelist
	}

	var tr = $('#tr').val(); // No of trucks
	var tc = $('#tc').val(); // Truck Capacity


		// Distances between different markers
		for (var i = 0; i < markers.length; i++) // Primary Marker
		{
			for(var j = 0; j < markers.length; j++) // Secondary Marker
			{
				if (j != i) {
					var dist = getDistance(markers[i], markers[j]); // Get distance in meters

					var time = dist/8.8; // Time = distance/avg speed

					// Single object for the array

					var timing_obj = {
						node1: i, // Parent Node
						node2: j, // Secondary Node
						distance: dist, // Distance in meters
						timing: time // Time taken in seconds
					}

					distances.push(timing_obj); // Push object into array

					console.log(distances);
				}
			}
		}

		routingfunc(markers.length, distances.length, 1, tr, tc, ...distances);

});


// Convert deg to radians
var rad = function(x) {
	return x * Math.PI / 180;
}

// Haversine Formula to calculate the dist between 2 markers
var getDistance = function(p1,p2) {
	var R = 6378137; // Earth’s mean radius in meter
 	var dLat = rad(p2.lat - p1.lat);
 	var dLong = rad(p2.lng - p1.lng);
 	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
	Math.sin(dLong / 2) * Math.sin(dLong / 2);
 	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 	var d = R * c;
 	return d; // returns the distance in meter
}

// Shashwat Algo


function Path() {
	this.destination = 0;
	this.timetaken = 0;
}

function Collsite()
// Distances from node to landfill, landfill to node and capcity of sites and whether visited or not
{
	this.capacity = 0;
	this.visited = false;
	this.tolfill = 0;
	this.fromlfill = 0;
	this.adj = [];
}

function Round() {
	this.sites = []; // Stores sites visited in a round
	this.tm = 0; // Stores time taken in that round
	this.cap = 0; // Stores the total capacity taken in that round
}

function Truck() {
	this.rds = []; // Stores the indexes of rounds a truck is undertaking
	this.cumtm = 0; // Stores the cumalative time of rounds already allocated to truck
	this.capserve = 0; // Stores the capacity the truck serves over all rounds
}



let custsort = (a, b) =>
// Sorting function for adjacency list of a node, base on the heuristic algo m*x + y
{
	return (k * a.timetaken + sitelist[a.destination].tolfill) - (k * b.timetaken + sitelist[b.destination].tolfill);
};

let rdsort = (a, b) =>
// Descending order of time sort function for rounds
{
	return b.tm - a.tm;
};

let dfs = (node) =>
// Generic dfs
{
	//console.log('node = ' + node);
	lastvisit = node; // We need the last visited node as we have to add last->landfill cost at end
	sitelist[node].visited = true; // Marks node as visited
	currcap += sitelist[node].capacity; // Increases capacity of current truck by the capacity of the current node
	for (let i = 0; i < sitelist[node].adj.length; i++) // Iterates over adjacent nodes for current node
	{
		let next = sitelist[node].adj[i].destination; // Candidate next node (taken in sorted order based on heuristic)

		if (sitelist[next].visited !== true && currcap + sitelist[next].capacity <= trcap) // If candidate hasnt been visited and truck doesnt overflow
		{
			currt += sitelist[node].adj[i].timetaken; // Time of current node increased by the edgeweight
			dfs(next); // Go to candidate
			break; // We break as we dont want the dfs function to return to this node and go to other nodes
		}
	}
}
let compute = () => // Compute for current value of k
{
	sitelist[lfill].visited = true;
	for (let i = 1; i <= n; i++) {
		sitelist[i].adj = sitelist[i].adj.sort(custsort); // Sort adjacency lists of all nodes on basis of heuristic
	}
	currt = 0; // Start computing the time taken for the current value of k
	for (let j = 0; j < sitelist[lfill].adj.length; j++) // Iterates over nodes attached to landfill(all nodes are connected)
	{
		let i = sitelist[lfill].adj[j].destination; // Check for the jth node connected to landfill
//		console.log('i = ' + i);

//		console.log('lfill = ' + lfill);

//		console.log('vis = ' + sitelist[i].visited);
			if (i !== lfill && sitelist[i].visited === false) // If node hasnt been visited already
		{
			currcap = 0; // Send a new truck

			dfs(i); // Find the route for this truck
			currt += sitelist[i].fromlfill; // Add initial cost of going from landfill to destination node
			if (lastvisit !== -1) // If the cost for last visit node has not not been added
			{
				currt += sitelist[lastvisit].tolfill; // Add the cost from last visit node to landfill
				lastvisit = -1; // Mark that last visit does not need to be added any more
			}
		}
	}
	return currt; // Return the final optimal time for current k
}

let dfs2 = (node) => // Timetaken dfs to fix the optimal k rounds
{
	rounds[rdcnt].sites.push(node); // Add the current node to current round
	lastvisit = node; // Set the last visit node has current for reason mentioned last time
	sitelist[node].visited = true; // Mark current node as visited
	rounds[rdcnt].cap += sitelist[node].capacity; // Add the capacity of current site to the current round
	for (let i = 0; i < sitelist[node].adj.length; i++) // Iterate over adjancet nodes of current node sorted by heuristic
	{
		let next = sitelist[node].adj[i].destination; // Take a candidate next, then next line checks if it has not been visited
		if (sitelist[next].visited !== true && rounds[rdcnt].cap + sitelist[next].capacity <= trcap) // Ensures truck will not overflow when it goes there
		{
			rounds[rdcnt].tm += sitelist[node].adj[i].timetaken; // Add the edge weight to the current round's time
			dfs2(next); // Go to the next node
			break; // Break as we do not want to come back to this node and pick another candidate
		}
	}
}
let build = () => {
	sitelist[lfill].visited = true;
	for (let i = 1; i <= n; i++) {
		sitelist[i].adj = sitelist[i].adj.sort(custsort); // Sorts the nodes according to heuristic for optimal k
	}
	for (let j = 0; j < sitelist[lfill].adj.length; j++) // Iterates over nodes connected to landfill
	{
		let i = sitelist[lfill].adj[j].destination; // Takes a node adjance to landfill as candidate
		if (i !== lfill && sitelist[i].visited === false) // If the node hasn't already been visited visit it
		{
			rdcnt++; // Starts a new round
			rounds.push(empty); // Initializes empty round to vector
			lastvisit = -1; // Marks last visit has -1
			rounds[rdcnt].tm += sitelist[i].fromlfill; // Add the time from landfill to destination node to current node's time
			dfs2(i); // Visit node to start routing
			if (lastvisit !== -1) // If there is a last visit node to landfill path left add to time
			{
					rounds[rdcnt].tm += sitelist[lastvisit].tolfill; // Add time to current round's time.
					lastvisit = -1; // Mark that there is no last visit to landfill left
			}
		}
	}
}



let routingfunc = (n, m, lfill, trx, trcap, ...arr) => {
	// Input nodes(no. of sites), edges, landfill index, no. of trucks and truck capacity

	console.log("edge: " + m);

	console.log(sitelist);
	for (let i = 0; i < m; i++) // Input edges and edgeweights
	{

		let a, b, t;
		a = arr[i].node1;
		b = arr[i].node2;
		t = arr[i].timing;

		console.log("time between " +  a + " & " + b + " is " + t);
		let item = new Path();
		item.destination = b;
		item.timetaken = t;
		sitelist[a].adj.push(item); // Add an edge to b with weight t to the adjacency list of a
		if (b === lfill) // If b = landfill then set return cost to landfill if a is last node
		{
			sitelist[a].tolfill = t;
		}
		else if (a === lfill) // If a = landfill then set initial visit from landfill to b cost
		{
			sitelist[b].fromlfill = t;
		}
	}
	k = 0; // Start from k = 0
	let minT = 1000000000;
	let optK = 0; // MinT stores minimum time and optK optimal found K till now
	while (k < 100) // Running k from 0 to 100 for every 0.1
	{
		//console.log(k);
		let val = compute(); // Compute value for current k

		for (let i = 0; i < n; i++) sitelist[i].visited = false; // Mark all nodes as unvisited again
		if (val < minT) // Update minimum time and optimal k if the current k gives a shorter time
		{
			minT = val;
			optK = k;
		}
		k += 0.1; // Increase k by 0.1
	}

	k = optK; // Set k to optimal K to rebuild solution and store final rounds, we didn't do this everytime earlier to save memory


	for (let i = 0; i < n; i++) sitelist[i].visited = false;
	build(); // Call build function similar to compute but builds the final round system
	rounds = rounds.sort(rdsort); // Sort rounds in descending order for allocation to trucks (greedy)



	for (let i = 0; i < rounds.length; i++) // Iterate over all rounds for printing what we have currently
	{
		console.log("Round: " + (i + 1) + "\n");
		for (let j = 0; j < rounds[i].sites.length; j++) {
			console.log(rounds[i].sites[j] + "");
		}
		console.log('\n');

	}
	for (let i = 0; i < trx; i++) {
		trucks.push(emptrk);
	}
	for (let i = 0; i < rounds.length; i++) // Iterate over all rounds to allocate rounds to trucks
	{ // Notice that we want to minimize the time taken by the truck that takes maximum time
		let mn = 1e9, mni = -1; // For every round we destination find truck which currently has minimum allocated time (mni is index of this truck)
		for (let j = 0; j < trx; j++) {
			if (trucks[j].cumtm < mn) // If current truck has less than mn cumalative time then set mn as this and make this minimum time truck
			{
				mni = j;
				mn = trucks[j].cumtm;
			}
		}

		console.log(i);
		trucks[mni].cumtm += rounds[i].tm; // For the finally chosen truck for this round, add the time of round to its cumalative
		trucks[mni].rds.push(i); // Add the round to the trucks list of rounds.
		trucks[mni].capserve += rounds[i].cap; // Add the round's total capacity collected to the truck's capacity servd
	}
	for (let i = 0; i < trx; i++) // Print truck info
	{
		console.log("Truck no: " + (i + 1) + "\n");
		for (let j = 0; j < trucks[i].rds.length; j++) {
			console.log("Round no: " + (trucks[i].rds[j] + 1));
			console.log("Round Time: " + rounds[i].tm + " Round Capacity: " + rounds[i].cap + "\n");
			for (let k = 0; k < rounds[trucks[i].rds[j]].sites.length; k++) {
				console.log(rounds[trucks[i].rds[j]].sites[k] + " ");

			}
			console.log("\n");
		}
		console.log("Total Time: " + trucks[i].cumtm + " Capacity Served: " + trucks[i].capserve + "\n");
	}
}
