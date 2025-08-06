// Enhanced location mapping with Google Maps coordinates for Car & General branches
export interface BranchLocation {
  branch: string;
  county: string;
  coordinates?: [number, number]; // [longitude, latitude]
  address?: string;
  verified?: boolean;
}

// Enhanced branch mapping based on Car & General actual locations
export const enhancedBranchMapping: Record<string, BranchLocation> = {
  // Nairobi-based branches
  'Nairobi trading': {
    branch: 'Nairobi trading',
    county: 'NAIROBI',
    coordinates: [36.8665, -1.3034], // Lusaka Road, Industrial Area
    address: 'New Cargen House, Lusaka Road, Industrial Area, Nairobi',
    verified: true
  },
  'Doosan': {
    branch: 'Doosan',
    county: 'NAIROBI',
    coordinates: [36.8665, -1.3034], // Same as HQ
    address: 'Car & General HQ, Lusaka Road, Industrial Area, Nairobi',
    verified: true
  },
  'Garmins': {
    branch: 'Garmins',
    county: 'NAIROBI',
    coordinates: [36.8665, -1.3034], // Same as HQ
    address: 'Car & General Distribution, Lusaka Road, Industrial Area, Nairobi',
    verified: true
  },
  'Engineering': {
    branch: 'Engineering',
    county: 'NAIROBI',
    coordinates: [36.8665, -1.3034], // Same as HQ    
    address: 'Head Office, Nairobi',
    verified: true
  },
  'IR': {
    branch: 'IR',
    county: 'NAIROBI',
    coordinates: [36.8665, -1.3034], // Same as HQ
    address: 'Head Office, Nairobi',
    verified: true
  },
  'Kubota': {
    branch: 'Kubota',
    county: 'NAIROBI',
    coordinates: [36.8665, -1.3034], // Same as HQ
    address: 'Car & General HQ, Lusaka Road, Industrial Area, Nairobi',
    verified: true
  },
  'Lease': {
    branch: 'Lease',
    county: 'NAIROBI',
    coordinates: [36.8665, -1.3034],
    address: 'Head Office, Nairobi',
    verified: true
  },
  'MRF': {
    branch: 'MRF',
    county: 'NAIROBI',
    coordinates: [36.8665, -1.3034],
    address: 'Head Office, Nairobi',
    verified: true
  },
  'Toyota': {
    branch: 'Toyota',
    county: 'NAIROBI',
    coordinates: [36.8219, -1.2921], // Uhuru Highway
    address: 'Uhuru Highway, Nairobi',
    verified: true
  },
  'Unknown': {
    branch: 'Unknown',
    county: 'NAIROBI',
    coordinates: [36.8665, -1.3034],
    address: 'Nairobi',
    verified: false
  },
  
  // Regional branches with Google Maps coordinates
  'Bungoma': {
    branch: 'Bungoma',
    county: 'BUNGOMA',
    coordinates: [34.5607, 0.5692], // Mashambani Road, Bungoma
    address: 'Mashambani Road, Bungoma',
    verified: true
  },
  'Eldoret': {
    branch: 'Eldoret',
    county: 'UASIN GISHU',
    coordinates: [35.2699, 0.5143], // Uganda Road, Yana Building
    address: 'Uganda Road, Yana Building, Eldoret',
    verified: true
  },
  'Kisii': {
    branch: 'Kisii',
    county: 'KISII',
    coordinates: [34.7680, -0.6817], // Kisii – Sotik Road
    address: 'Kisii – Sotik Road, Ram Plaza/Gudka Building, Kisii',
    verified: true
  },
  'Kisumu trading': {
    branch: 'Kisumu trading',
    county: 'KISUMU',
    coordinates: [34.7617, -0.0917], // Obote Road
    address: 'Obote Road, Kisumu',
    verified: true
  },
  'Kitale': {
    branch: 'Kitale',
    county: 'TRANS NZOIA',
    coordinates: [35.0063, 1.0154], // Kitale – Eldoret Road
    address: 'Kitale – Eldoret Road, Soet House, Jovena, Kitale',
    verified: true
  },
  'Kitengela': {
    branch: 'Kitengela',
    county: 'KAJIADO',
    coordinates: [36.9547, -1.4469], // Yukos Opposite Shell
    address: 'Yukos Opposite Shell Petrol Station, Kitengela',
    verified: true
  },
  'Malindi': {
    branch: 'Malindi',
    county: 'KILIFI',
    coordinates: [40.1169, -3.2199], // Lamu Road
    address: 'Lamu Road, Malindi',
    verified: true
  },
  'Mombasa trading': {
    branch: 'Mombasa trading',
    county: 'MOMBASA',
    coordinates: [39.6682, -4.0435], // Mbaraki Road
    address: 'Mbaraki Road, Mombasa',
    verified: true
  },
  'Nakuru Distribution': {
    branch: 'Nakuru Distribution',
    county: 'NAKURU',
    coordinates: [36.0670, -0.3031], // Nairobi – Eldoret Highway
    address: 'Nairobi – Eldoret Highway, Nakuru',
    verified: true
  },
  'Nakuru trading': {
    branch: 'Nakuru trading',
    county: 'NAKURU',
    coordinates: [36.0670, -0.3031], // Same location
    address: 'Nairobi – Eldoret Highway, Nakuru',
    verified: true
  },
  'Thika': {
    branch: 'Thika',
    county: 'KIAMBU',
    coordinates: [37.0693, -1.0332], // Saleh Building Next to KRA
    address: 'Saleh Building Next to KRA, Thika',
    verified: true
  },
  'Voi': {
    branch: 'Voi',
    county: 'TAITA TAVETA',
    coordinates: [38.5661, -3.3960], // Caltex – Voi Road
    address: 'Caltex – Voi Road, Voi',
    verified: true
  }
};

// Function to get coordinates for a branch
export const getBranchCoordinates = (branchName: string): [number, number] | null => {
  const location = enhancedBranchMapping[branchName];
  return location?.coordinates || null;
};

// Function to get county for a branch
export const getBranchCounty = (branchName: string): string | null => {
  const location = enhancedBranchMapping[branchName];
  return location?.county || null;
};

// Function to get all branches in a county
export const getBranchesInCounty = (countyName: string): BranchLocation[] => {
  return Object.values(enhancedBranchMapping).filter(location => 
    location.county === countyName
  );
};

// Function to validate if a branch exists in our mapping
export const isBranchMapped = (branchName: string): boolean => {
  return branchName in enhancedBranchMapping;
};