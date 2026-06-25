// File: TasteProfileSummary.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Taste profile views to be used in profile and profile modal

import Ionicons from '@expo/vector-icons/Ionicons';
import { styles } from '@/assets/styles/my_styles';
import { Text, View } from '@/components/Themed';

// typescript type definition for taste profile place
export type TasteProfilePlace = {
  city?: string;
  country?: string;
  num_cafes: number;
  aggregate_rating: number | string | null;
};

// typescript type for tasteprofile data containing taste profile place shape
export type TasteProfileData = {
  countries: TasteProfilePlace[];
  cities: TasteProfilePlace[];
};

// typescript type for prop for tasteprofile with type shape, and loading state
type TasteProfileSummaryProps = {
  tasteProfile: TasteProfileData | null;
  loading?: boolean;
};

// fix rating to 1 decimal, or return -- if it does not exist
const formatRating = (rating: number | string | null) => {
  if (rating === null || rating === undefined) {
    return "--";
  }

  const ratingNumber = Number(rating);

  if (Number.isNaN(ratingNumber)) {
    return "--";
  }

  return ratingNumber.toFixed(1);
};

// react native component for place row
const renderPlaceRow = (item: TasteProfilePlace, label: string, icon: keyof typeof Ionicons.glyphMap) => (
  <View style={styles.tasteRow} key={label}>
    <View style={styles.polishedRowMain}>
      <View style={styles.polishedIconCircle}>
        <Ionicons name={icon} size={20} color="#2D5A3D" />
      </View>
      {/** number of cafes rated, and place label */}
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Text style={styles.polishedRowTitle}>{label}</Text>
        <Text style={styles.polishedRowMeta}>{item.num_cafes} cafes rated</Text>
      </View>
    </View>

    {/** average rating */}
    <View style={styles.polishedScoreBadge}>
      <Text style={styles.polishedScoreText}>{formatRating(item.aggregate_rating)}</Text>
    </View>
  </View>
);

// default export function
export function TasteProfileSummary({ tasteProfile, loading = false }: TasteProfileSummaryProps) {
  // countries or cities from data, and handler for if there is no data
  const countries = tasteProfile?.countries ?? [];
  const cities = tasteProfile?.cities ?? [];
  const hasTasteData = countries.length > 0 || cities.length > 0;

  // if loading state prop is true, show loading state
  if (loading) {
    return (
      <View style={styles.tasteProfileWrap}>
        <Text style={styles.tasteEmptyTitle}>Loading taste profile</Text>
      </View>
    );
  }

  // if no data, show empty state 
  if (!hasTasteData) {
    return (
      <View style={styles.tasteProfileWrap}>
        <View style={styles.tasteEmptyCard}>
          <Ionicons name="cafe-outline" size={28} color="#2D5A3D" />
          <Text style={styles.tasteEmptyTitle}>No taste profile yet</Text>
          <Text style={styles.tasteEmptyText}>Ratings will appear here once cafes have been reviewed.</Text>
        </View>
      </View>
    );
  }

  // otherwise, return the main react native component
  return (
    <View style={styles.tasteProfileWrap}>
      {countries.length > 0 ? (
        <View style={styles.tasteSection}>
          <Text style={styles.tasteSectionTitle}>Countries</Text>
          {countries.map((item) => renderPlaceRow(item, item.country ?? "Unknown", "earth-outline"))}
        </View>
      ) : null}

      {cities.length > 0 ? (
        <View style={styles.tasteSection}>
          <Text style={styles.tasteSectionTitle}>Cities</Text>
          {cities.map((item) => renderPlaceRow(item, item.city ?? "Unknown", "location-outline"))}
        </View>
      ) : null}
    </View>
  );
}
