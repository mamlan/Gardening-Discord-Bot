async function fetchSoilMoisture(latitude, longitude) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,rain,showers,vapor_pressure_deficit,soil_moisture_1_3cm`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const moisture = data.hourly.soil_moisture_1_3cm[0];
        const temperature = data.hourly.temperature_2m[0];  //celsius
        const rain = data.hourly.rain[0];         //mm
        const showers = data.hourly.showers[0];         //mm
        const vpd = data.hourly.vapor_pressure_deficit[0];         //kpa


		console.log(moisture)
        return {
            moisture: moisture,
            temperature: temperature,
            rain: rain,
            showers: showers,
            vpd: vpd,
        };
    } catch (error) {
        console.log('An error occurred:', error);
        return null; // Or handle the error appropriately based on your use case
    }
}

module.exports= {fetchSoilMoisture};
