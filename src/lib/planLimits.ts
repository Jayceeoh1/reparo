// @ts-nocheck
// Plan limits per subscription tier

export const PLAN_LIMITS = {
  free: {
    maxListings: 10,
    maxOffersPerDay: 5,
    relistInterval: null, // no auto-relist
    generatorCars: 0,
    searchBoost: 0,
    hasCustomPage: false,
    hasCsvImport: false,
    hasVerifiedBadge: false,
    label: 'Free',
  },
  starter: {
    maxListings: 300,
    maxOffersPerDay: 50,
    relistInterval: 24 * 60, // 24 ore in minute
    weeklyRelists: 5000,
    generatorCars: 1,
    searchBoost: 1,
    hasCustomPage: true,
    hasCsvImport: true,
    hasVerifiedBadge: true,
    label: 'Club Starter',
  },
  pro: {
    maxListings: 1000000,
    maxOffersPerDay: -1, // nelimitat
    relistInterval: 10, // 10 minute
    weeklyRelists: 10000,
    generatorCars: -1, // nelimitat
    searchBoost: 2,
    hasCustomPage: true,
    hasCsvImport: true,
    hasVerifiedBadge: true,
    label: 'Club Pro',
  },
  elite: {
    maxListings: 1000000,
    maxOffersPerDay: -1,
    relistInterval: 5, // 5 minute
    weeklyRelists: 50000,
    generatorCars: -1,
    searchBoost: 3,
    hasCustomPage: true,
    hasCsvImport: true,
    hasVerifiedBadge: true,
    label: 'Club Elite',
  },
  // Business plans
  business: {
    maxListings: 100000,
    maxOffersPerDay: -1,
    relistInterval: 20,
    weeklyRelists: 5000,
    generatorCars: 1,
    searchBoost: 1,
    hasCustomPage: true,
    hasCsvImport: true,
    hasVerifiedBadge: true,
    label: 'Club Business',
  },
  business_pro: {
    maxListings: 1000000,
    maxOffersPerDay: -1,
    relistInterval: 10,
    weeklyRelists: 10000,
    generatorCars: -1,
    searchBoost: 2,
    hasCustomPage: true,
    hasCsvImport: true,
    hasVerifiedBadge: true,
    label: 'Club Business Pro',
  },
  business_elite: {
    maxListings: 1000000,
    maxOffersPerDay: -1,
    relistInterval: 5,
    weeklyRelists: 50000,
    generatorCars: -1,
    searchBoost: 3,
    hasCustomPage: true,
    hasCsvImport: true,
    hasVerifiedBadge: true,
    label: 'Club Business Elite',
  },
  // backwards compat
  basic: {
    maxListings: 300,
    maxOffersPerDay: 50,
    relistInterval: 24 * 60,
    weeklyRelists: 5000,
    generatorCars: 1,
    searchBoost: 1,
    hasCustomPage: true,
    hasCsvImport: true,
    hasVerifiedBadge: true,
    label: 'Club Starter',
  },
}

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

export function canSendOffer(plan: string, offersToday: number): boolean {
  const limits = getPlanLimits(plan)
  if (limits.maxOffersPerDay === -1) return true
  return offersToday < limits.maxOffersPerDay
}

export function canAddListing(plan: string, currentCount: number): boolean {
  const limits = getPlanLimits(plan)
  return currentCount < limits.maxListings
}

export function canUseGenerator(plan: string, carsGenerated: number): boolean {
  const limits = getPlanLimits(plan)
  if (limits.generatorCars === -1) return true
  if (limits.generatorCars === 0) return false
  return carsGenerated < limits.generatorCars
}
