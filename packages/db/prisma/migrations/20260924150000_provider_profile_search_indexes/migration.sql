-- CreateIndex
CREATE INDEX "provider_profiles_isAvailable_city_idx" ON "provider_profiles"("isAvailable", "city");

-- CreateIndex
CREATE INDEX "provider_profiles_avgRating_idx" ON "provider_profiles"("avgRating");

-- CreateIndex
CREATE INDEX "provider_profiles_avgPrice_idx" ON "provider_profiles"("avgPrice");
