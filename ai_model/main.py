from config.db import get_db
# from services.text_plagiarism_checker import check_text_plagiarism
from services.process_image_similarity import process_image_similarity

if __name__ == "__main__":
    db = get_db()
    # plagiarism_results = check_text_plagiarism(db)

    similarity_results = process_image_similarity(db)
    print("Image similarity check completed.")