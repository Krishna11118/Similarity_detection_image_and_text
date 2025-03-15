from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId

def check_text_plagiarism(db, threshold=60):
    print("Starting plagiarism check...")
    try:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Model loaded successfully")
        
        collection = db["forms"]
        results_collection = db["text_plagiarism_results"]

        # Retrieve all documents
        documents = list(collection.find({}))
        print(f"Found {len(documents)} documents in collection")
        
        if not documents:
            print("No documents found in MongoDB collection.")
            return []

        results = []
        processed_docs = 0

        # Process each document
        for doc in documents:
            processed_docs += 1
            uid = doc.get("uid")
            current_situation = doc.get("currentSituation", "")
            root_cause = doc.get("rootCause", "")
            action_taken = doc.get("actionTaken", "")

            print(f"Processing document {processed_docs} with uid: {uid}")
            
            # Check if any fields are present
            if not any([current_situation, root_cause, action_taken]):
                print(f"Skipping document {uid} - all fields are empty")
                continue

            # Encode the texts
            texts = [current_situation, root_cause, action_taken]
            embeddings = model.encode(texts)

            # Compare each pair of texts
            comparisons = [
                (0, 1, "currentSituation vs rootCause"),
                (0, 2, "currentSituation vs actionTaken"),
                (1, 2, "rootCause vs actionTaken")
            ]

            for i, j, comparison_name in comparisons:
                if not texts[i] or not texts[j]:
                    print(f"Skipping {comparison_name} - one or both texts are empty")
                    continue

                similarity = cosine_similarity(
                    embeddings[i].reshape(1, -1), 
                    embeddings[j].reshape(1, -1)
                )[0][0]
                similarity_score = float(round(similarity * 100, 2))

                print(f"{comparison_name}: {similarity_score}% similarity")

                if similarity_score > threshold:
                    result = {
                        "_id": ObjectId(),
                        "uid": uid,
                        "comparison": comparison_name,
                        "text1": texts[i],
                        "text2": texts[j],
                        "similarity_score": similarity_score,
                        "is_plagiarism": True
                    }
                    results.append(result)
                    print(f"Plagiarism detected - {comparison_name}: {similarity_score}%")

        # Save results to MongoDB
        if results:
            results_collection.insert_many(results)
            print(f"Stored {len(results)} plagiarism results successfully.")
        else:
            print("No plagiarism instances found above threshold")

        return results

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return []