// @ts-nocheck
export const PLAN_LIMITS = {
  free:           { maxListings:10,      maxOffersPerDay:5,   relistInterval:null, weeklyRelists:0,     generatorCars:0,  searchBoost:0, hasCustomPage:false, hasCsvImport:false, hasVerifiedBadge:false, label:'Free' },
  starter:        { maxListings:300,     maxOffersPerDay:50,  relistInterval:1440, weeklyRelists:5000,  generatorCars:1,  searchBoost:1, hasCustomPage:true,  hasCsvImport:true,  hasVerifiedBadge:true,  label:'Club Starter' },
  basic:          { maxListings:300,     maxOffersPerDay:50,  relistInterval:1440, weeklyRelists:5000,  generatorCars:1,  searchBoost:1, hasCustomPage:true,  hasCsvImport:true,  hasVerifiedBadge:true,  label:'Club Starter' },
  pro:            { maxListings:1000000, maxOffersPerDay:-1,  relistInterval:10,   weeklyRelists:10000, generatorCars:-1, searchBoost:2, hasCustomPage:true,  hasCsvImport:true,  hasVerifiedBadge:true,  label:'Club Pro' },
  elite:          { maxListings:1000000, maxOffersPerDay:-1,  relistInterval:5,    weeklyRelists:50000, generatorCars:-1, searchBoost:3, hasCustomPage:true,  hasCsvImport:true,  hasVerifiedBadge:true,  label:'Club Elite' },
  business:       { maxListings:100000,  maxOffersPerDay:-1,  relistInterval:20,   weeklyRelists:5000,  generatorCars:1,  searchBoost:1, hasCustomPage:true,  hasCsvImport:true,  hasVerifiedBadge:true,  label:'Club Business' },
  business_pro:   { maxListings:1000000, maxOffersPerDay:-1,  relistInterval:10,   weeklyRelists:10000, generatorCars:-1, searchBoost:2, hasCustomPage:true,  hasCsvImport:true,  hasVerifiedBadge:true,  label:'Club Business Pro' },
  business_elite: { maxListings:1000000, maxOffersPerDay:-1,  relistInterval:5,    weeklyRelists:50000, generatorCars:-1, searchBoost:3, hasCustomPage:true,  hasCsvImport:true,  hasVerifiedBadge:true,  label:'Club Business Elite' },
}

export function getPlanLimits(plan) { return PLAN_LIMITS[plan] || PLAN_LIMITS.free }
export function canAddListing(plan, currentCount) { const l=getPlanLimits(plan); return currentCount < l.maxListings }
export function canUseGenerator(plan, carsGenerated) { const l=getPlanLimits(plan); if(l.generatorCars===-1) return true; if(l.generatorCars===0) return false; return carsGenerated < l.generatorCars }
export function canSendOffer(plan, offersToday) { const l=getPlanLimits(plan); if(l.maxOffersPerDay===-1) return true; return offersToday < l.maxOffersPerDay }
