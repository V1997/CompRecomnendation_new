import math
from datetime import datetime
from typing import Tuple

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in miles
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in miles
    r = 3959
    
    return c * r

def calculate_days_since(date: datetime) -> int:
    """Calculate days since a given date"""
    now = datetime.now()
    if date.tzinfo is None:
        # If date is naive, assume it's in the same timezone as now
        if now.tzinfo is not None:
            now = now.replace(tzinfo=None)
    else:
        # If date is timezone-aware, make sure now is too
        if now.tzinfo is None:
            from datetime import timezone
            now = now.replace(tzinfo=timezone.utc)
    
    delta = now - date
    return delta.days

def normalize_score(score: float, min_val: float = 0, max_val: float = 100) -> float:
    """Normalize a score to be between min_val and max_val"""
    return max(min_val, min(max_val, score))

def calculate_similarity_percentage(value1: float, value2: float, max_diff_threshold: float = 1.0) -> float:
    """
    Calculate similarity percentage between two values
    Returns 100% for identical values, decreasing as difference increases
    """
    if value1 == 0 and value2 == 0:
        return 100.0
    
    if value1 == 0 or value2 == 0:
        return 0.0
    
    diff_ratio = abs(value1 - value2) / max(value1, value2)
    similarity = max(0, 1 - (diff_ratio / max_diff_threshold))
    return similarity * 100
