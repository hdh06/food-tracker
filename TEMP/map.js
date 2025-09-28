function loadGoogleMapsApi() {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBJAr3yED80-VDpEMVMXc9mAlXyxH7o034";
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Maps API"));

        document.head.appendChild(script);
    });
}

async function initMap() {
    try {
        await loadGoogleMapsApi();
        const map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
        });
    } catch (error) {
        console.error("Error loading Google Maps API:", error);
    }
}

// Call the initMap function
window.onload = initMap;