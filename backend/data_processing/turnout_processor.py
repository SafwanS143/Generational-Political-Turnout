import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional

def clean_turnout_data(data_path: Optional[str] = None) -> pd.DataFrame:
    """
    Clean and prepare turnout data for visualization.
    
    Args:
        data_path: Optional path to the CSV file. If None, uses default location.
        
    Returns:
        pd.DataFrame: Cleaned DataFrame with columns: election_year, age_group, turnout_percentage
    """
    # Get the data directory path relative to this file
    if data_path is None:
        data_path = Path(__file__).parent.parent.parent / "data" / "turnout_data.csv"
    
    # Read the CSV file
    df = pd.read_csv(data_path)
    
    # Select only needed columns
    df = df[['election_year', 'age_group', 'turnout_percentage']]
    
    # Convert election_year to integer
    df['election_year'] = pd.to_numeric(df['election_year'], errors='coerce')
    
    # Convert turnout_percentage to float, replacing any non-numeric values with NaN
    df['turnout_percentage'] = pd.to_numeric(df['turnout_percentage'], errors='coerce')
    
    # Clean age groups - ensure consistent format
    df['age_group'] = df['age_group'].str.strip()
    
    # Remove rows with missing or invalid values
    df = df.dropna(subset=['election_year', 'age_group', 'turnout_percentage'])
    
    # Remove any rows where turnout is not between 0 and 100
    df = df[
        (df['turnout_percentage'] >= 0) & 
        (df['turnout_percentage'] <= 100)
    ]
    
    # Sort by election year
    df = df.sort_values('election_year')
    
    # Reset index
    df = df.reset_index(drop=True)
    
    return df

if __name__ == "__main__":
    # Test the function
    df = clean_turnout_data()
    print("\nCleaned DataFrame Info:")
    print(df.info())
    print("\nFirst few rows:")
    print(df.head())
    print("\nUnique age groups:")
    print(df['age_group'].unique())
    print("\nUnique election years:")
    print(sorted(df['election_year'].unique())) 