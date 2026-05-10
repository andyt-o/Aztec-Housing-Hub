import Listings from "../Listings";

export default function OffCampusTab({
  offCampusListings = [],
  housingTypes = [],
  priceRanges = [],
  bedOptions = [],
}) {
  return (
    <Listings
      offCampusListings={offCampusListings}
      housingTypes={housingTypes}
      priceRanges={priceRanges}
      bedOptions={bedOptions}
    />
  );
}