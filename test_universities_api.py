import requests
import json

BASE_URL = "http://universities.hipolabs.com"

def test_search_universities(name=None, country=None):
    print(f"Testing search with name='{name}' and country='{country}'...")
    params = {}
    if name:
        params['name'] = name
    if country:
        params['country'] = country
    
    try:
        response = requests.get(f"{BASE_URL}/search", params=params)
        response.raise_for_status()
        data = response.json()
        
        print(f"Status Code: {response.status_code}")
        print(f"Number of results: {len(data)}")
        if data:
            print("First result sample:")
            print(json.dumps(data[0], indent=2))
        else:
            print("No results found.")
            
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 50)

if __name__ == "__main__":
    # Test 1: Search for a specific university by name
    test_search_universities(name="Amrita")

    # Test 2: Search for universities in a specific country
    test_search_universities(country="India")

    # Test 3: Search with both parameters
    test_search_universities(name="Technology", country="United States")
