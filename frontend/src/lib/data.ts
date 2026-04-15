export type Property = {
  id: string
  title: string
  location: string
  price: number
  area: number
  images?: string[]
  bedrooms?: number
  bathrooms?: number
  status?: 'ready-to-move' | 'under-construction' | 'new-launch'
  possession?: string
  tag?: 'NEW LAUNCH' | 'NEW ARRIVAL' | 'FEATURED' | 'HOT' | string
  priceChange?: number
  isRera?: boolean
  category?: 'Buy' | 'Rent' | 'Sell' | 'Swap' | string
  city?: string
  type?: string
  builder?: string
  amenities?: string[]
  propertyImages?: string[]
  description?: string
  beds?: number
  baths?: number
  leaseTerm?: string
  image?: string
}

export const INDIAN_CITIES = [
  'Mumbai',
  'Bangalore',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Gurgaon',
  'Noida',
  'Kolkata',
  'Ahmedabad',
]

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Neha Singh',
    role: 'First-time buyer',
    city: 'Mumbai',
    text: 'NexusEstate made it easy to compare neighborhoods, negotiate well, and close quickly.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    rating: 5,
  },
  {
    id: 2,
    name: 'Arjun Verma',
    role: 'Investor',
    city: 'Bangalore',
    text: 'The market snapshots helped me decide where to buy next, and I closed on a strong rental asset.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    rating: 5,
  },
  {
    id: 3,
    name: 'Priya Mehta',
    role: 'Rent seeker',
    city: 'Delhi',
    text: 'The rental search felt effortless, and I got a great apartment within my budget.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80',
    rating: 4,
  },
]

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'nexus-royal-gardens',
    title: 'Nexus Royal Gardens',
    location: 'New Delhi, India',
    city: 'New Delhi',
    type: 'villa',
    category: 'Buy',
    price: 18500000,
    area: 2500,
    images: ['https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&q=80'],
    bedrooms: 4,
    bathrooms: 3,
    status: 'ready-to-move',
    possession: '2025',
    tag: 'NEW LAUNCH',
    priceChange: 12,
    isRera: true,
  },
  {
    id: 'mumbai-riverfront',
    title: 'Mumbai Riverfront Residences',
    location: 'Mumbai, India',
    city: 'Mumbai',
    type: 'apartment',
    category: 'Buy',
    price: 28500000,
    area: 3200,
    images: ['https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80'],
    bedrooms: 5,
    bathrooms: 4,
    status: 'under-construction',
    possession: '2027',
    tag: 'FEATURED',
    priceChange: 18,
    isRera: true,
  },
  {
    id: 'bangalore-skyline',
    title: 'Bangalore Skyline Towers',
    location: 'Bangalore, India',
    city: 'Bangalore',
    type: 'builder-floor',
    category: 'Buy',
    price: 11000000,
    area: 1900,
    images: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80'],
    bedrooms: 3,
    bathrooms: 3,
    status: 'new-launch',
    possession: '2026',
    tag: 'NEW ARRIVAL',
    priceChange: 15,
    isRera: false,
  },
  {
    id: 'hyderabad-green-lane',
    title: 'Hyderabad Green Lane',
    location: 'Hyderabad, India',
    city: 'Hyderabad',
    type: 'villa',
    category: 'Buy',
    price: 8600000,
    area: 1700,
    images: ['https://images.unsplash.com/photo-1560440021-33f9b867899d?w=1200&q=80'],
    bedrooms: 3,
    bathrooms: 2,
    status: 'ready-to-move',
    possession: '2024',
    tag: 'HOT',
    priceChange: 22,
    isRera: true,
  },
  {
    id: 'pune-luxury-grove',
    title: 'Pune Luxury Grove',
    location: 'Pune, India',
    city: 'Pune',
    type: 'apartment',
    category: 'Buy',
    price: 9800000,
    area: 2100,
    images: ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80'],
    bedrooms: 4,
    bathrooms: 3,
    status: 'under-construction',
    possession: '2026',
    tag: 'FEATURED',
    priceChange: 9,
    isRera: true,
  },
]

export const MOCK_SWAP_LISTINGS = [
  {
    id: 'swap-1',
    userName: 'Ayesha K.',
    currentProperty: '2BHK Koramangala',
    currentCity: 'Bangalore',
    targetCity: 'Mumbai',
    bedrooms: 2,
    rent: 42000,
    area: 1150,
    description: 'Ready to swap a fully furnished apartment in prime Koramangala for a similar Mumbai location.',
    propertyImages: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'],
  },
  {
    id: 'swap-2',
    userName: 'Rahul T.',
    currentProperty: '3BHK Wakad Villa',
    currentCity: 'Pune',
    targetCity: 'Bangalore',
    bedrooms: 3,
    rent: 52000,
    area: 1600,
    description: 'Seeking a 3BHK in Bangalore near Whitefield for an executive job transfer.',
    propertyImages: ['https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80'],
  },
  {
    id: 'swap-3',
    userName: 'Sneha M.',
    currentProperty: '1BHK Bandra Studio',
    currentCity: 'Mumbai',
    targetCity: 'Pune',
    bedrooms: 1,
    rent: 38000,
    area: 700,
    description: 'Flexible lease transfer from Bandra to Pune for a startup role change.',
    propertyImages: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80'],
  },
];

export const MOCK_RENT_PROPERTIES: Property[] = [
  {
    id: 'rent-mumbai-flat',
    title: 'South Mumbai Riverside Flat',
    location: 'Mumbai, India',
    city: 'Mumbai',
    type: 'apartment',
    category: 'Rent',
    price: 32000,
    area: 1100,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80'],
    bedrooms: 2,
    bathrooms: 2,
    status: 'ready-to-move',
    leaseTerm: '12 months',
    tag: 'HOT',
    isRera: true,
  },
  {
    id: 'rent-bangalore-pad',
    title: 'Whitefield Work+Live Pad',
    location: 'Bangalore, India',
    city: 'Bangalore',
    type: 'apartment',
    category: 'Rent',
    price: 28000,
    area: 950,
    images: ['https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80'],
    bedrooms: 1,
    bathrooms: 1,
    status: 'ready-to-move',
    leaseTerm: '6 months',
    tag: 'NEW LAUNCH',
    isRera: false,
  },
  {
    id: 'rent-delhi-flat',
    title: 'Gurgaon Executive Suite',
    location: 'Gurgaon, India',
    city: 'Gurgaon',
    type: 'apartment',
    category: 'Rent',
    price: 36000,
    area: 1250,
    images: ['https://images.unsplash.com/photo-1550136510-6da8e1ecb3b6?w=1200&q=80'],
    bedrooms: 2,
    bathrooms: 2,
    status: 'ready-to-move',
    leaseTerm: '12 months',
    isRera: true,
  },
  {
    id: 'rent-pune-serviced',
    title: 'Pune Serviced Studio',
    location: 'Pune, India',
    city: 'Pune',
    type: 'studio',
    category: 'Rent',
    price: 22000,
    area: 750,
    images: ['https://images.unsplash.com/photo-1494521370777-1d196c973c5c?w=1200&q=80'],
    bedrooms: 1,
    bathrooms: 1,
    status: 'ready-to-move',
    leaseTerm: '6 months',
    isRera: false,
  },
]

export const MARKET_STATS = [
  { city: 'Mumbai', avgPrice: 25000, listings: 4200, change: 12 },
  { city: 'Bangalore', avgPrice: 21000, listings: 3800, change: 10 },
  { city: 'Delhi NCR', avgPrice: 19500, listings: 4500, change: 8 },
  { city: 'Hyderabad', avgPrice: 17000, listings: 3200, change: 14 },
]

export const PRICE_TREND_DATA = [
  { month: 'Nov', Mumbai: 21000, Bangalore: 18500, Delhi: 19000, Hyderabad: 16000 },
  { month: 'Dec', Mumbai: 21500, Bangalore: 18800, Delhi: 19300, Hyderabad: 16200 },
  { month: 'Jan', Mumbai: 22000, Bangalore: 19200, Delhi: 19600, Hyderabad: 16500 },
  { month: 'Feb', Mumbai: 22500, Bangalore: 19700, Delhi: 20000, Hyderabad: 16800 },
  { month: 'Mar', Mumbai: 23000, Bangalore: 20200, Delhi: 20500, Hyderabad: 17100 },
  { month: 'Apr', Mumbai: 23500, Bangalore: 20800, Delhi: 21000, Hyderabad: 17500 },
]

export const categoryCards = [
  { title: 'Buy', subtitle: 'Homes, condos & villas', highlight: 'Best prices' },
  { title: 'Rent', subtitle: 'Short-term & long-term', highlight: 'Flexible stays' },
  { title: 'Sell', subtitle: 'List your property fast', highlight: 'Trusted buyers' },
  { title: 'Swap', subtitle: 'City lease exchange', highlight: 'Nomad-ready' },
  { title: 'Insights', subtitle: 'Market trends & news', highlight: 'Data-driven' },
  { title: 'Agent help', subtitle: 'Personal guidance', highlight: 'Expert support' },
]

export const sampleProperties: Property[] = [
  {
    id: 'laura-villa',
    title: 'Lakeview Villa',
    location: 'San Francisco, CA',
    price: 1980000,
    area: 2850,
    image: '/images/property-1.jpg',
    category: 'Buy',
    description: 'A premium villa with sweeping bay views, large terrace, and modern finishes.',
    beds: 4,
    baths: 3,
  },
  {
    id: 'shore-apartment',
    title: 'Shoreline Apartment',
    location: 'Santa Monica, CA',
    price: 4800,
    area: 980,
    image: '/images/property-2.jpg',
    category: 'Rent',
    description: 'Bright coastal apartment with easy beach access and sweeping city views.',
    beds: 2,
    baths: 2,
    leaseTerm: '6 months',
  },
  {
    id: 'harbor-house',
    title: 'Harbor House',
    location: 'Miami, FL',
    price: 2250000,
    area: 3200,
    image: '/images/property-3.jpg',
    category: 'Sell',
    description: 'Luxury waterfront home with private dock and resort-style amenities.',
    beds: 5,
    baths: 4,
  },
  {
    id: 'urban-swap',
    title: 'City Swap Loft',
    location: 'Portland, OR',
    price: 1100000,
    area: 1550,
    image: '/images/property-4.jpg',
    category: 'Swap',
    description: 'Flexible urban loft designed for lease swaps and remote city living.',
    beds: 3,
    baths: 2,
    leaseTerm: '12 months',
  },
  {
    id: 'midtown-flat',
    title: 'Midtown Flat',
    location: 'New York, NY',
    price: 5200,
    area: 1100,
    image: '/images/property-5.jpg',
    category: 'Rent',
    description: 'Sleek city rental in the heart of the financial district.',
    beds: 1,
    baths: 1,
    leaseTerm: '3 months',
  },
]

export const featuredProperties = sampleProperties.slice(0, 3)

export const marketInsights = [
  {
    title: 'Urban demand rises 18%',
    summary: 'City markets are seeing renewed interest from remote workers and hybrid families.',
  },
  {
    title: 'Luxury leasing outpaces sales',
    summary: 'Short-term rentals remain strong while premium sales listings continue to move quickly.',
  },
  {
    title: 'Swap stays gain popularity',
    summary: 'Lease swaps are emerging as a top choice for travelers and digital nomads.',
  },
]

export const articles = [
  {
    title: 'How to choose the right city lease',
    description: 'A simple framework to compare neighborhoods, commute times, and lifestyle fit.',
  },
  {
    title: 'Market outlook for coastal properties',
    description: 'Why waterfront real estate is still a reliable long-term investment.',
  },
  {
    title: 'The future of hybrid rentals',
    description: 'Flexible rent models designed for the modern workforce.',
  },
]

export const testimonials = [
  {
    name: 'Maya Winter',
    role: 'Remote professional',
    quote: 'NexusEstate helped me swap cities without the stress of traditional leases.',
  },
  {
    name: 'Carlos Greene',
    role: 'Property seller',
    quote: 'My listing went live quickly, and I connected with strong buyers right away.',
  },
  {
    name: 'Aisha Patel',
    role: 'First-time renter',
    quote: 'The search tools made it easy to find a property that matched my budget and lifestyle.',
  },
]
