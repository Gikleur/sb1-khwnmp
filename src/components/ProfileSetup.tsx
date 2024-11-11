import React, { useState, useCallback } from 'react';
import { UserCircle, MapPin, Calendar, Users } from 'lucide-react';
import type { UserProfile } from '../types';
import { searchCityByPostalCode } from '../utils/citySearch';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

const AVATARS = ['😊', '😎', '🤓', '🦊', '🐱', '🐶', '🐼', '🐨', '🦁', '🐯', '🦄', '🐸'];
const AGE_RANGE = Array.from({ length: 108 }, (_, i) => i + 13);
const COUNTRIES = [
  'France', 'Belgique', 'Suisse', 'Canada', 'Luxembourg', 
  'Maroc', 'Algérie', 'Tunisie', 'Sénégal', 'Côte d\'Ivoire',
  'Madagascar', 'Cameroun', 'Congo', 'Mali', 'Niger'
];

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'homme' | 'femme' | 'autre'>('homme');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [cities, setCities] = useState<Array<{ nom: string; code: string }>>([]);
  const [error, setError] = useState('');

  const handlePostalCodeChange = useCallback(async (code: string) => {
    setPostalCode(code);
    if (code.length === 5) {
      const results = await searchCityByPostalCode(code);
      setCities(results);
      if (results.length > 0) {
        setCity(results[0].nom);
      }
    } else {
      setCities([]);
      setCity('');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Le nom d\'utilisateur est requis');
      return;
    }

    if (!age) {
      setError('L\'âge est requis');
      return;
    }

    if (!city) {
      setError('La ville est requise');
      return;
    }

    const profile: UserProfile = {
      username: username.trim(),
      age: parseInt(age, 10),
      gender,
      city,
      country,
      avatar
    };

    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Bienvenue sur <span className="text-blue-400">ChatFranco</span> 🇫🇷
        </h1>
        <p className="text-gray-300 text-lg">
          Le nouveau chat anonyme de la communauté francophone.
          Discutez librement avec des personnes du monde entier partageant votre langue et votre culture !
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <div className="flex items-center text-gray-400">
            <span className="text-2xl mr-2">🔒</span>
            <span>100% Anonyme</span>
          </div>
          <div className="flex items-center text-gray-400">
            <span className="text-2xl mr-2">🌍</span>
            <span>Francophone</span>
          </div>
          <div className="flex items-center text-gray-400">
            <span className="text-2xl mr-2">⚡</span>
            <span>Instantané</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-6">
          <UserCircle className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-white">Configuration du Profil</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Choisissez un avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`text-2xl p-2 rounded-lg ${
                    avatar === emoji ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'hover:bg-gray-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
                Âge
              </label>
              <select
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner</option>
                {AGE_RANGE.map((age) => (
                  <option key={age} value={age}>
                    {age} ans
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'homme' | 'femme' | 'autre')}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300 mb-2">
              Code postal
            </label>
            <input
              type="text"
              id="postalCode"
              value={postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={5}
              pattern="[0-9]*"
            />
          </div>

          {cities.length > 0 && (
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                Ville
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cities.map((city) => (
                  <option key={city.code} value={city.nom}>
                    {city.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
              Pays
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Commencer à chatter
          </button>
        </form>
      </div>
    </div>
  );
}