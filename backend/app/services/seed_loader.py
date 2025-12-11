import os

BASE_PATH = "app/seed_corpora"


def load_seed_corpus(brand_id: int) -> dict:
    """
    Loads all text files for a specific brand from seed_corpora/brand_{id}/.
    Returns categorized text segments based on file name keywords.
    """

    brand_path = os.path.join(BASE_PATH, f"brand_{brand_id}")
    if not os.path.exists(brand_path):
        raise FileNotFoundError(f"Seed corpora folder not found for brand {brand_id}")

    corpus = {
        "voice": [],
        "blog": [],
        "social": [],
        "other": []
    }

    for file_name in os.listdir(brand_path):
        if file_name.endswith(".txt"):
            file_path = os.path.join(brand_path, file_name)

            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read().strip()

            # Categorize based on name
            name = file_name.lower()
            if "voice" in name:
                corpus["voice"].append(text)
            elif "blog" in name:
                corpus["blog"].append(text)
            elif "social" in name:
                corpus["social"].append(text)
            else:
                corpus["other"].append(text)

    return corpus
