let map;
let marker;
let geocoder;
let infoWindow;
let service;

// Food banks near Tempe, Arizona
const foodBanks = [
    {
        name: "St. Mary's Food Bank - Tempe Distribution",
        address: "933 E University Dr, Tempe, AZ 85281",
        lat: 33.4242,
        lng: -111.9281,
        hours: "Mon-Fri: 8AM-5PM, Sat: 8AM-12PM",
        phone: "(602) 242-3663",
        description: "Main food distribution center serving Tempe area"
    },
    {
        name: "Tempe Community Action Agency",
        address: "1603 S Rural Rd, Tempe, AZ 85281",
        lat: 33.4034,
        lng: -111.9094,
        hours: "Mon-Thu: 8AM-4:30PM, Fri: 8AM-12PM",
        phone: "(480) 350-5400",
        description: "Emergency food assistance and community services"
    },
    {
        name: "Desert Mission Food Bank",
        address: "1431 S 27th Ave, Phoenix, AZ 85009",
        lat: 33.4242,
        lng: -112.1240,
        hours: "Mon-Fri: 9AM-4PM",
        phone: "(602) 279-5853",
        description: "Serving Phoenix and surrounding areas including Tempe"
    },
    {
        name: "United Food Bank - Mesa",
        address: "245 S Nina Dr, Mesa, AZ 85210",
        lat: 33.4019,
        lng: -111.8442,
        hours: "Mon-Fri: 8AM-4PM, Sat: 8AM-12PM",
        phone: "(480) 926-4897",
        description: "Food distribution serving East Valley including Tempe"
    },
    {
        name: "Salvation Army - Tempe Corps",
        address: "1009 E Baseline Rd, Tempe, AZ 85283",
        lat: 33.3783,
        lng: -111.9281,
        hours: "Mon-Fri: 9AM-3PM",
        phone: "(480) 967-2583",
        description: "Emergency food assistance and social services"
    }
];

let foodBankMarkers = [];

// Initialize the map
function initMap() {
    // Default location (Tempe, Arizona)
    const defaultLocation = { lat: 33.4255, lng: -111.9400 };
    
    // Create the map
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: defaultLocation,
        mapTypeId: 'roadmap',
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
            }
        ]
    });
    
    // Initialize services
    geocoder = new google.maps.Geocoder();
    infoWindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    
    // Create initial marker (user location marker - will be updated)
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: "Your Location",
        draggable: true,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#4285f4" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12)
        }
    });
    
    // Add food bank markers
    addFoodBankMarkers();
    
    // Add click listener to map
    map.addListener("click", (event) => {
        moveMarkerAndGetInfo(event.latLng);
    });
    
    // Add drag listener to marker
    marker.addListener("dragend", (event) => {
        moveMarkerAndGetInfo(event.latLng);
    });
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Try to get user's current location first
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                
                // Update map center and user marker
                map.setCenter(userPos);
                marker.setPosition(userPos);
                marker.setTitle("Your Current Location");
                
                getLocationInfo(userPos.lat, userPos.lng);
            },
            (error) => {
                // If location fails, use default and get its info
                console.log("Geolocation failed, using default location");
                getLocationInfo(defaultLocation.lat, defaultLocation.lng);
            }
        );
    } else {
        // Get initial location info for default location
        getLocationInfo(defaultLocation.lat, defaultLocation.lng);
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // corrected id name to match HTML
    const searchBtn = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    
    // Search button click (guarded)
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // Enter key in search input (guarded)
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Get current location button (guarded)
    if (getCurrentLocationBtn) {
        getCurrentLocationBtn.addEventListener('click', getCurrentLocation);
    }
}

// Perform search based on input
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a location to search');
        return;
    }
    
    // Show loading state
    document.body.classList.add('loading');
    
    geocoder.geocode({ address: query }, (results, status) => {
        document.body.classList.remove('loading');
        
        if (status === 'OK') {
            const location = results[0].geometry.location;
            map.setCenter(location);
            map.setZoom(15);
            moveMarkerAndGetInfo(location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// Get user's current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        document.body.classList.add('loading');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.body.classList.remove('loading');
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                
                map.setCenter(pos);
                map.setZoom(15);
                moveMarkerAndGetInfo(pos);
                
                infoWindow.setPosition(pos);
                infoWindow.setContent("You are here!");
                infoWindow.open(map);
            },
            (error) => {
                document.body.classList.remove('loading');
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

// Handle geolocation errors
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}

// Move marker and get location information
function moveMarkerAndGetInfo(location) {
    marker.setPosition(location);
    
    // Get coordinates
    const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
    const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
    
    getLocationInfo(lat, lng);
}

// Get detailed information about the location
function getLocationInfo(lat, lng) {
    const latlng = { lat: lat, lng: lng };
    
    geocoder.geocode({ location: latlng }, (results, status) => {
        const locationInfo = document.getElementById('locationInfo');
        
        if (status === 'OK') {
            if (results[0]) {
                const place = results[0];
                
                // Extract relevant information
                const address = place.formatted_address;
                const placeId = place.place_id;
                
                // Update info panel
                locationInfo.innerHTML = `
                    <h3>Location Information</h3>
                    <p><strong>Address:</strong> ${address}</p>
                    <p><strong>Coordinates:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
                    <p><strong>Place ID:</strong> ${placeId}</p>
                `;
                
                // Get additional place details
                getPlaceDetails(placeId);
                
            } else {
                locationInfo.innerHTML = '<p>No address found for this location.</p>';
            }
        } else {
            console.error('Geocoder failed:', status);
            if (status === 'REQUEST_DENIED') {
                locationInfo.innerHTML = `<p>Geocoder failed: ${status}. Check your API key, enabled APIs (Maps JavaScript, Places) and key referrer restrictions in Google Cloud Console. See console for details.</p>`;
            } else {
            locationInfo.innerHTML = `<p>Geocoder failed: ${status}</p>`;
            }
        }
    });
}

// Get additional place details using Places API
function getPlaceDetails(placeId) {
    const request = {
        placeId: placeId,
        fields: ['name', 'rating', 'formatted_phone_number', 'website', 'opening_hours', 'types']
    };
    
    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const locationInfo = document.getElementById('locationInfo');
            let currentContent = locationInfo.innerHTML;
            
            // Add additional details
            let additionalInfo = '';
            
            if (place.name) {
                additionalInfo += `<p><strong>Name:</strong> ${place.name}</p>`;
            }
            
            if (place.rating) {
                additionalInfo += `<p><strong>Rating:</strong> ${place.rating} ⭐</p>`;
            }
            
            if (place.formatted_phone_number) {
                additionalInfo += `<p><strong>Phone:</strong> ${place.formatted_phone_number}</p>`;
            }
            
            if (place.website) {
                additionalInfo += `<p><strong>Website:</strong> <a href="${place.website}" target="_blank">Visit Website</a></p>`;
            }
            
            if (place.opening_hours && place.opening_hours.weekday_text) {
                additionalInfo += '<p><strong>Hours:</strong></p><ul>';
                place.opening_hours.weekday_text.forEach(day => {
                    additionalInfo += `<li>${day}</li>`;
                });
                additionalInfo += '</ul>';
            }
            
            if (place.types && place.types.length > 0) {
                const types = place.types.map(type => type.replace(/_/g, ' ')).join(', ');
                additionalInfo += `<p><strong>Type:</strong> ${types}</p>`;
            }
            
            locationInfo.innerHTML = currentContent + additionalInfo;
        }
    });
}

// Add food bank markers to the map
function addFoodBankMarkers() {
    foodBanks.forEach((foodBank, index) => {
        const marker = new google.maps.Marker({
            position: { lat: foodBank.lat, lng: foodBank.lng },
            map: map,
            title: foodBank.name,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#EA4335" stroke="white" stroke-width="1"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
            }
        });

        // Add click listener for food bank info
        marker.addListener('click', () => {
            showFoodBankInfo(foodBank, marker);
        });

        foodBankMarkers.push(marker);
    });
}

// Show food bank information in info window and panel
function showFoodBankInfo(foodBank, marker) {
    // Update info window
    const infoContent = `
        <div style="max-width: 300px;">
            <h3 style="color: #EA4335; margin-bottom: 10px;">${foodBank.name}</h3>
            <p><strong>Address:</strong> ${foodBank.address}</p>
            <p><strong>Hours:</strong> ${foodBank.hours}</p>
            <p><strong>Phone:</strong> ${foodBank.phone}</p>
            <p>${foodBank.description}</p>
        </div>
    `;
    
    infoWindow.setContent(infoContent);
    infoWindow.open(map, marker);

    // Update location info panel
    const locationInfo = document.getElementById('locationInfo');
    locationInfo.innerHTML = `
        <h3>Food Bank Information</h3>
        <p><strong>Name:</strong> ${foodBank.name}</p>
        <p><strong>Address:</strong> ${foodBank.address}</p>
        <p><strong>Hours:</strong> ${foodBank.hours}</p>
        <p><strong>Phone:</strong> <a href="tel:${foodBank.phone}">${foodBank.phone}</a></p>
        <p><strong>Description:</strong> ${foodBank.description}</p>
        <p><strong>Coordinates:</strong> ${foodBank.lat.toFixed(6)}, ${foodBank.lng.toFixed(6)}</p>
    `;
}

// Error handling for map loading
window.addEventListener('error', (e) => {
    if (e.message.includes('Google Maps')) {
        document.getElementById('map').innerHTML = 
            '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: #f0f0f0; color: #666;">' +
            '<p>Error loading Google Maps. Please check your API key and internet connection.</p>' +
            '</div>';
    }
});

// Make initMap globally available
window.initMap = initMap;
