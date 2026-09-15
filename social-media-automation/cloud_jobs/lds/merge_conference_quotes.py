"""
Merge conference quotes from conference_scraper into main quotes_data.json
"""

import json
import os
from pathlib import Path


def merge_quotes():
    """Merge all category JSON files from conference_quotes/ into quotes_data.json"""

    # Load existing quotes
    try:
        with open("quotes_data.json") as f:
            main_data = json.load(f)
    except FileNotFoundError:
        main_data = {"quotes": []}

    existing_quotes = main_data.get("quotes", [])
    max_id = max((q.get("id", 0) for q in existing_quotes), default=60000)

    # Find all category files
    conference_quotes_dir = Path("conference_quotes")
    if not conference_quotes_dir.exists():
        print("No conference_quotes directory found")
        return 0

    merged_count = 0

    for category_file in conference_quotes_dir.glob("*.json"):
        with open(category_file) as f:
            category_data = json.load(f)

        for quote in category_data.get("quotes", []):
            # Check for duplicates by comparing quote text
            existing_texts = {q["quote"].lower() for q in existing_quotes}

            if quote["quote"].lower() not in existing_texts:
                # Re-assign ID to maintain uniqueness
                max_id += 1
                quote["id"] = max_id

                existing_quotes.append(quote)
                merged_count += 1

    # Save merged data
    main_data["quotes"] = existing_quotes
    with open("quotes_data.json", "w") as f:
        json.dump(main_data, f, indent=2)

    print(f"✓ Merged {merged_count} new quotes into quotes_data.json")
    print(f"Total quotes now: {len(existing_quotes)}")
    return merged_count


if __name__ == "__main__":
    merge_quotes()
