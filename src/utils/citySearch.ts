interface City {
  nom: string;
  code: string;
}

export async function searchCityByPostalCode(postalCode: string): Promise<City[]> {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=nom,code`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors de la recherche de la ville');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la recherche de la ville:', error);
    return [];
  }
}