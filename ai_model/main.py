# from config.db import get_db
# # from services.text_plagiarism_checker import check_text_plagiarism
# from services.process_image_similarity import process_image_similarity

# if __name__ == "__main__":
#     db = get_db()
#     # plagiarism_results = check_text_plagiarism(db)

#     similarity_results = process_image_similarity(db)
#     # print("Image similarity check completed.")


#     # main.py
# from services.process_image_similarity import ImageSimilarityProcessor
# from config.db import get_db

# def main():
#     db = get_db()
#     processor = ImageSimilarityProcessor()
#     results = processor.process_similarity(db)
    
#     if results:
#         print("\nFinal Results:")
#         for res in results:
#             print(f"{res['queryImagePath']} (UID: {res['queryUid']}) vs "
#                   f"{res['comparedImagePath']} (UID: {res['comparedUid']}) -> "
#                   f"{res['similarityScore']}% similarity")
#     else:
#         print("No results to display")

# if __name__ == "__main__":
#     main()



from config.db import get_db
# from services.text_plagiarism_checker import check_text_plagiarism
from services.process_image_similarity import ImageSimilarityProcessor
import logging
# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def main():
    """Main execution function."""
    try:
        db = get_db()
        processor = ImageSimilarityProcessor()
        results = processor.process_similarity(db)
        
        if results:
            logger.info("\nFinal Results:")
            for res in results:
                logger.info(f"{res['queryImagePath']} (UID: {res['queryUid']}) vs "
                           f"{res['comparedImagePath']} (UID: {res['comparedUid']}) -> "
                           f"{res['similarityScore']}% similarity")
        else:
            logger.info("No results to display")
            
    except Exception as e:
        logger.error(f"Main execution failed: {e}")
        raise

if __name__ == "__main__":
    main()