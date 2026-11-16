import { ABOUT_IMAGE_KEYS } from "@/components/about/about-content";

export interface AssetLibrarySlot {
  key: string;
  label: string;
  page: string;
}

/**
 * Known, human-named image slots across the site — lets the Upload form
 * offer a dropdown instead of requiring an exact `image_key` to be typed
 * from memory. Purely a UI convenience: this list doesn't gate or
 * validate anything at the API/service layer — uploading with a key not
 * listed here (via the form's "Custom key" option) still works exactly
 * the same way.
 *
 * Add an entry here whenever a new page is wired to the Asset Library
 * (see apps/web/lib/asset-library.ts and the About page for the pattern).
 */
export const ASSET_LIBRARY_SLOTS: AssetLibrarySlot[] = [
  { key: ABOUT_IMAGE_KEYS.heroPortrait, label: "Hero Portrait", page: "About" },
  { key: ABOUT_IMAGE_KEYS.whereMusicFoundMe, label: "Where Music Found Me", page: "About" },
  { key: ABOUT_IMAGE_KEYS.rootsLegacy, label: "Roots & Legacy", page: "About" },
  { key: ABOUT_IMAGE_KEYS.signatureWorksSongs, label: "Signature Works — Songs Poster", page: "About" },
  {
    key: ABOUT_IMAGE_KEYS.signatureWorksFilmScores,
    label: "Signature Works — Film Score Poster",
    page: "About",
  },
  { key: ABOUT_IMAGE_KEYS.signatureWorksTheatre, label: "Signature Works — Theatre Poster", page: "About" },
  {
    key: ABOUT_IMAGE_KEYS.signatureWorksVoiceTraining,
    label: "Signature Works — Voice Training Poster",
    page: "About",
  },
  { key: ABOUT_IMAGE_KEYS.lookingAheadBackground, label: "Looking Ahead — Background", page: "About" },
  { key: ABOUT_IMAGE_KEYS.manifestoImage, label: "Manifesto Image", page: "About" },
];
