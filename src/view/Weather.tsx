import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface WeatherData {
    name: string;
    main: {
        temp: number;
        humidity: number;
        pressure: number;
    };
    weather: {
        description: string;
        icon: string;
    }[];
    wind: {
        speed: number;
    };
}

const CACHE_KEY = 'weatherData';
const CACHE_EXPIRY = 10 * 60 * 1000;

export const Weather = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [error, setError] = useState<Error | GeolocationPositionError | null>(null);
    const [isCached, setIsCached] = useState(false);

    const getWeather = async (latitude: number, longitude: number) => {
        try {
            const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
                params: {
                    lat: latitude,
                    lon: longitude,
                    appid: process.env.REACT_APP_API_KEY,
                    units: 'metric',
                    lang: 'fr'
                }
            });
            setWeatherData(response.data);
            setIsCached(false);
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: response.data,
                timestamp: Date.now()
            }));
        } catch (err) {
            setError(err as Error);
        }
    };

    const getLocation = (force: boolean = false) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (!force) {
                        const cachedData = localStorage.getItem(CACHE_KEY);
                        if (cachedData) {
                            const { data, timestamp } = JSON.parse(cachedData);
                            if (Date.now() - timestamp < CACHE_EXPIRY) {
                                setWeatherData(data);
                                setIsCached(true);
                                return;
                            }
                        }
                    }
                    getWeather(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    setError(err);
                }
            );
        } else {
            setError(new Error("La géolocalisation n'est pas supportée par ce navigateur."));
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    const handleNewLocationClick = () => {
        getLocation(true);
    };

    if (error) {
        return <div className="weather-error">Erreur : {error.message}</div>;
    }

    if (!weatherData) {
        return <div className="weather-loading">Chargement...</div>;
    }

    return (
        <div className="weather-container">
            <h2 className="weather-title">Météo à {weatherData.name}</h2>
            <div className="weather-info">
                <img
                    src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                    alt={weatherData.weather[0].description}
                    className="weather-icon"
                />
                <div className="weather-details">
                    <p className="weather-temp">Température : {weatherData.main.temp}°C</p>
                    <p className="weather-description">Météo : {weatherData.weather[0].description}</p>
                    <p className="weather-humidity">Humidité : {weatherData.main.humidity}%</p>
                    <p className="weather-pressure">Pression : {weatherData.main.pressure} hPa</p>
                    <p className="weather-wind">Vitesse du vent : {weatherData.wind.speed} m/s</p>
                    <p className="weather-source">Source: {isCached ? 'Cache' : 'API'}</p>
                </div>
            </div>
            <button onClick={handleNewLocationClick} className="new-location-button">Rafrachir ma position</button>
        </div>
    );
};

export default Weather;