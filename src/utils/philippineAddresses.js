// Philippine Address Data - Regions, Provinces, Cities, and Barangays
// This is a comprehensive dataset for address autocomplete

export const regions = [
  { code: 'NCR', name: 'National Capital Region (NCR)' },
  { code: 'CAR', name: 'Cordillera Administrative Region (CAR)' },
  { code: 'I', name: 'Region I (Ilocos Region)' },
  { code: 'II', name: 'Region II (Cagayan Valley)' },
  { code: 'III', name: 'Region III (Central Luzon)' },
  { code: 'IV-A', name: 'Region IV-A (CALABARZON)' },
  { code: 'IV-B', name: 'Region IV-B (MIMAROPA)' },
  { code: 'V', name: 'Region V (Bicol Region)' },
  { code: 'VI', name: 'Region VI (Western Visayas)' },
  { code: 'VII', name: 'Region VII (Central Visayas)' },
  { code: 'VIII', name: 'Region VIII (Eastern Visayas)' },
  { code: 'IX', name: 'Region IX (Zamboanga Peninsula)' },
  { code: 'X', name: 'Region X (Northern Mindanao)' },
  { code: 'XI', name: 'Region XI (Davao Region)' },
  { code: 'XII', name: 'Region XII (SOCCSKSARGEN)' },
  { code: 'XIII', name: 'Region XIII (Caraga)' },
  { code: 'BARMM', name: 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)' }
];

export const provincesByRegion = {
  'NCR': [
    'Metro Manila'
  ],
  'CAR': [
    'Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'
  ],
  'I': [
    'Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'
  ],
  'II': [
    'Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'
  ],
  'III': [
    'Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales'
  ],
  'IV-A': [
    'Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'
  ],
  'IV-B': [
    'Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon'
  ],
  'V': [
    'Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'
  ],
  'VI': [
    'Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental'
  ],
  'VII': [
    'Bohol', 'Cebu', 'Negros Oriental', 'Siquijor'
  ],
  'VIII': [
    'Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte'
  ],
  'IX': [
    'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'
  ],
  'X': [
    'Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'
  ],
  'XI': [
    'Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental'
  ],
  'XII': [
    'Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat'
  ],
  'XIII': [
    'Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'
  ],
  'BARMM': [
    'Basilan', 'Lanao del Sur', 'Maguindanao', 'Sulu', 'Tawi-Tawi'
  ]
};

export const citiesByProvince = {
  'Metro Manila': [
    'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 
    'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 
    'Quezon City', 'San Juan', 'Taguig', 'Valenzuela', 'Pateros'
  ],
  'Leyte': [
    'Abuyog', 'Alangalang', 'Albuera', 'Babatngon', 'Barugo', 'Bato', 'Baybay',
    'Burauen', 'Calubian', 'Capoocan', 'Carigara', 'Dagami', 'Dulag', 'Hilongos',
    'Hindang', 'Inopacan', 'Isabel', 'Jaro', 'Javier', 'Julita', 'Kananga',
    'La Paz', 'Leyte', 'MacArthur', 'Mahaplag', 'Matag-ob', 'Matalom', 'Mayorga',
    'Merida', 'Ormoc', 'Palo', 'Palompon', 'Pastrana', 'San Isidro', 'San Miguel',
    'Santa Fe', 'Tabango', 'Tabontabon', 'Tanauan', 'Tolosa', 'Tunga', 'Villaba'
  ],
  'Cebu': [
    'Alcantara', 'Alcoy', 'Alegria', 'Aloguinsan', 'Argao', 'Asturias', 'Badian',
    'Balamban', 'Bantayan', 'Barili', 'Bogo', 'Boljoon', 'Borbon', 'Carcar',
    'Carmen', 'Catmon', 'Cebu City', 'Compostela', 'Consolacion', 'Cordoba',
    'Daanbantayan', 'Dalaguete', 'Danao', 'Dumanjug', 'Ginatilan', 'Lapu-Lapu',
    'Liloan', 'Madridejos', 'Malabuyoc', 'Mandaue', 'Medellin', 'Minglanilla',
    'Moalboal', 'Naga', 'Oslob', 'Pilar', 'Pinamungajan', 'Poro', 'Ronda',
    'Samboan', 'San Fernando', 'San Francisco', 'San Remigio', 'Santa Fe',
    'Santander', 'Sibonga', 'Sogod', 'Tabogon', 'Tabuelan', 'Talisay',
    'Toledo', 'Tuburan', 'Tudela'
  ],
  'Laguna': [
    'Alaminos', 'Bay', 'Biñan', 'Cabuyao', 'Calamba', 'Calauan', 'Cavinti',
    'Famy', 'Kalayaan', 'Liliw', 'Los Baños', 'Luisiana', 'Lumban', 'Mabitac',
    'Magdalena', 'Majayjay', 'Nagcarlan', 'Paete', 'Pagsanjan', 'Pakil',
    'Pangil', 'Pila', 'Rizal', 'San Pablo', 'San Pedro', 'Santa Cruz',
    'Santa Maria', 'Santa Rosa', 'Siniloan', 'Victoria'
  ],
  'Cavite': [
    'Alfonso', 'Amadeo', 'Bacoor', 'Carmona', 'Cavite City', 'Dasmariñas',
    'General Emilio Aguinaldo', 'General Mariano Alvarez', 'General Trias',
    'Imus', 'Indang', 'Kawit', 'Magallanes', 'Maragondon', 'Mendez', 'Naic',
    'Noveleta', 'Rosario', 'Silang', 'Tagaytay', 'Tanza', 'Ternate', 'Trece Martires'
  ],
  'Bulacan': [
    'Angat', 'Balagtas', 'Baliuag', 'Bocaue', 'Bulakan', 'Bustos', 'Calumpit',
    'Doña Remedios Trinidad', 'Guiguinto', 'Hagonoy', 'Malolos', 'Marilao',
    'Meycauayan', 'Norzagaray', 'Obando', 'Pandi', 'Paombong', 'Plaridel',
    'Pulilan', 'San Ildefonso', 'San Jose del Monte', 'San Miguel', 'San Rafael',
    'Santa Maria'
  ],
  'Pampanga': [
    'Angeles', 'Apalit', 'Arayat', 'Bacolor', 'Candaba', 'Floridablanca',
    'Guagua', 'Lubao', 'Mabalacat', 'Macabebe', 'Magalang', 'Masantol',
    'Mexico', 'Minalin', 'Porac', 'San Fernando', 'San Luis', 'San Simon',
    'Santa Ana', 'Santa Rita', 'Santo Tomas', 'Sasmuan'
  ],
  'Batangas': [
    'Agoncillo', 'Alitagtag', 'Balayan', 'Balete', 'Batangas City', 'Bauan',
    'Calaca', 'Calatagan', 'Cuenca', 'Ibaan', 'Laurel', 'Lemery', 'Lian',
    'Lipa', 'Lobo', 'Mabini', 'Malvar', 'Mataas na Kahoy', 'Nasugbu',
    'Padre Garcia', 'Rosario', 'San Jose', 'San Juan', 'San Luis',
    'San Nicolas', 'San Pascual', 'Santa Teresita', 'Santo Tomas',
    'Taal', 'Talisay', 'Tanauan', 'Taysan', 'Tingloy', 'Tuy'
  ],
  'Rizal': [
    'Angono', 'Antipolo', 'Baras', 'Binangonan', 'Cainta', 'Cardona',
    'Jalajala', 'Morong', 'Pililla', 'Rodriguez', 'San Mateo', 'Tanay', 'Taytay', 'Teresa'
  ]
};

// Sample barangays for major cities (can be expanded)
export const barangaysByCity = {
  'Quezon City': [
    'Alicia', 'Amihan', 'Apolonio Samson', 'Aurora', 'Baesa', 'Bagbag',
    'Bagong Lipunan ng Crame', 'Bagong Pag-asa', 'Bagong Silangan', 'Bagumbayan',
    'Bagumbuhay', 'Bahay Toro', 'Balingasa', 'Balintawak', 'Batasan Hills',
    'Bayanihan', 'Blue Ridge A', 'Blue Ridge B', 'Botocan', 'Bungad',
    'Camp Aguinaldo', 'Central', 'Claro', 'Commonwealth', 'Culiat',
    'Damar', 'Damayan', 'Del Monte', 'Dioquino Zobel', 'Don Manuel',
    'Duyan-Duyan', 'E. Rodriguez', 'East Kamias', 'Escopa I', 'Escopa II'
  ],
  'Manila': [
    'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5',
    'Binondo', 'Ermita', 'Intramuros', 'Malate', 'Paco', 'Pandacan',
    'Port Area', 'Quiapo', 'Sampaloc', 'San Andres', 'San Miguel',
    'San Nicolas', 'Santa Ana', 'Santa Cruz', 'Santa Mesa', 'Tondo'
  ],
  'Makati': [
    'Bangkal', 'Bel-Air', 'Carmona', 'Cembo', 'Comembo', 'Dasmariñas',
    'East Rembo', 'Forbes Park', 'Guadalupe Nuevo', 'Guadalupe Viejo',
    'Kasilawan', 'La Paz', 'Magallanes', 'Olympia', 'Palanan',
    'Pembo', 'Pinagkaisahan', 'Pio del Pilar', 'Pitogo', 'Poblacion',
    'Rizal', 'San Antonio', 'San Isidro', 'San Lorenzo', 'Santa Cruz',
    'Singkamas', 'South Cembo', 'Tejeros', 'Urdaneta', 'Valenzuela', 'West Rembo'
  ],
  'Carigara': [
    'Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)',
    'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)',
    'Barayong', 'Barugohay Norte', 'Barugohay Sur', 'Binibihan', 'Bislig',
    'Baybay', 'Candigahub', 'Canlampay', 'Canmangui', 'Cutay', 'Guindapunan',
    'Hiluctogan', 'Jugaban', 'Libo', 'Licuma', 'Lower Hiraan', 'Manloy',
    'Nauguisan', 'Paglaum', 'Pangna', 'Parag-um', 'Piloro', 'Ponong',
    'San Isidro', 'San Mateo', 'Sawang', 'Tangnan', 'Tigbao', 'Tinaguban',
    'Uyawan', 'Upper Hiraan'
  ]
};

// Autocomplete search function
export const searchLocations = (query, type = 'all') => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];

  if (type === 'all' || type === 'region') {
    const matchedRegions = regions.filter(region => 
      region.name.toLowerCase().includes(normalizedQuery) ||
      region.code.toLowerCase().includes(normalizedQuery)
    );
    results.push(...matchedRegions.map(r => ({ ...r, type: 'region' })));
  }

  if (type === 'all' || type === 'province') {
    Object.entries(provincesByRegion).forEach(([regionCode, provinces]) => {
      const matchedProvinces = provinces.filter(province =>
        province.toLowerCase().includes(normalizedQuery)
      );
      results.push(...matchedProvinces.map(p => ({ 
        name: p, 
        region: regionCode, 
        type: 'province' 
      })));
    });
  }

  if (type === 'all' || type === 'city') {
    Object.entries(citiesByProvince).forEach(([province, cities]) => {
      const matchedCities = cities.filter(city =>
        city.toLowerCase().includes(normalizedQuery)
      );
      results.push(...matchedCities.map(c => ({ 
        name: c, 
        province: province, 
        type: 'city' 
      })));
    });
  }

  if (type === 'all' || type === 'barangay') {
    Object.entries(barangaysByCity).forEach(([city, barangays]) => {
      const matchedBarangays = barangays.filter(barangay =>
        barangay.toLowerCase().includes(normalizedQuery)
      );
      results.push(...matchedBarangays.map(b => ({ 
        name: b, 
        city: city, 
        type: 'barangay' 
      })));
    });
  }

  return results.slice(0, 10); // Limit to 10 results
};

// Get provinces for a specific region
export const getProvincesForRegion = (regionCode) => {
  return provincesByRegion[regionCode] || [];
};

// Get cities for a specific province
export const getCitiesForProvince = (province) => {
  return citiesByProvince[province] || [];
};

// Get barangays for a specific city
export const getBarangaysForCity = (city) => {
  return barangaysByCity[city] || [];
};