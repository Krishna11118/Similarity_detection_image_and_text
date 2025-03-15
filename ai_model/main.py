from config.db import get_db
from services.plagiarism_checker import check_text_plagiarism

if __name__ == "__main__":
    db = get_db()
    plagiarism_results = check_text_plagiarism(db)
    print(plagiarism_results)