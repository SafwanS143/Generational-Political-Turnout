import pandas as pd
import os
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from tqdm import tqdm
import folium

DATA_PATH = os.path.join(os.path.dirname(__file__), '../../data/canada_vote_on_campus_clean.csv')
COORDS_PATH = os.path.join(os.path.dirname(__file__), '../../data/institution_locations.csv')
MERGED_PATH = os.path.join(os.path.dirname(__file__), '../../data/voter_turnout_with_coords.csv')


def load_data(data_path=DATA_PATH):
    """Load the voter turnout CSV as a DataFrame."""
    df = pd.read_csv(data_path)
    return df


def extract_unique_institutions(df):
    """Extract unique institutions with province info."""
    return df[['Province', 'Post-secondary Institution']].drop_duplicates().reset_index(drop=True)


def geocode_institutions(inst_df, coords_path=COORDS_PATH):
    """Geocode institutions, using cache if available."""
    if os.path.exists(coords_path):
        print(f"Loading cached coordinates from {coords_path}")
        coords_df = pd.read_csv(coords_path)
        return coords_df

    geolocator = Nominatim(user_agent="canada_vote_geocoder")
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)

    latitudes = []
    longitudes = []
    addresses = []
    status = []

    tqdm.pandas(desc="Geocoding institutions")
    for idx, row in tqdm(inst_df.iterrows(), total=inst_df.shape[0], desc="Geocoding institutions"):
        query = f"{row['Post-secondary Institution']}, {row['Province']}, Canada"
        try:
            location = geocode(query)
            if location:
                latitudes.append(location.latitude)
                longitudes.append(location.longitude)
                addresses.append(location.address)
                status.append('OK')
            else:
                latitudes.append(None)
                longitudes.append(None)
                addresses.append(None)
                status.append('NOT FOUND')
        except Exception as e:
            latitudes.append(None)
            longitudes.append(None)
            addresses.append(str(e))
            status.append('ERROR')

    coords_df = inst_df.copy()
    coords_df['latitude'] = latitudes
    coords_df['longitude'] = longitudes
    coords_df['geocode_status'] = status
    coords_df['geocode_address'] = addresses
    coords_df.to_csv(coords_path, index=False)
    print(f"Saved geocoded results to {coords_path}")
    return coords_df


def merge_data(df, coords_df):
    """Merge original data with coordinates on institution and province."""
    merged = pd.merge(df, coords_df, on=['Province', 'Post-secondary Institution'], how='left')
    return merged


def save_merged_data(merged, merged_path=MERGED_PATH):
    merged.to_csv(merged_path, index=False)
    print(f"Saved merged data to {merged_path}")


def plot_map(merged, output_html='institution_map.html'):
    """Plot institutions on a folium map, colored by voter turnout."""
    # Remove rows without coordinates
    plot_df = merged.dropna(subset=['latitude', 'longitude'])
    # Convert turnout to numeric
    turnout_col = merged.columns[-merged.columns[::-1].get_loc('43rd General Election')-1]
    plot_df[turnout_col] = plot_df[turnout_col].replace({',':''}, regex=True).astype(float)
    m = folium.Map(location=[56, -96], zoom_start=4, tiles='cartodbpositron')
    for _, row in plot_df.iterrows():
        turnout = row[turnout_col]
        folium.CircleMarker(
            location=[row['latitude'], row['longitude']],
            radius=6,
            popup=f"{row['Post-secondary Institution']} ({row['Province']}): {int(turnout):,} votes",
            color='blue',
            fill=True,
            fill_color='green' if turnout > 2000 else 'orange' if turnout > 500 else 'red',
            fill_opacity=0.7
        ).add_to(m)
    m.save(output_html)
    print(f"Map saved to {output_html}")


def main():
    df = load_data()
    inst_df = extract_unique_institutions(df)
    coords_df = geocode_institutions(inst_df)
    merged = merge_data(df, coords_df)
    save_merged_data(merged)
    plot_map(merged)

if __name__ == "__main__":
    main()
