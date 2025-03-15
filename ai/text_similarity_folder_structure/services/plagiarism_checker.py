from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId

def check_text_plagiarism(db, threshold=80):
    model = SentenceTransformer('all-MiniLM-L6-v2')

    reference_collection = db["reference_texts"]
    suspect_collection = db["suspect_texts"]
    results_collection = db["text_plagiarism_results"]

    # Retrieve texts from MongoDB
    reference_sentences = [doc["text"] for doc in reference_collection.find({}, {"text": 1})]
    suspect_sentences = [doc["text"] for doc in suspect_collection.find({}, {"text": 1})]

    if not reference_sentences or not suspect_sentences:
        print("❌ No sentences found in MongoDB collections.")
        return
    
    # Encode sentences
    reference_embeddings = model.encode(reference_sentences)
    suspect_embeddings = model.encode(suspect_sentences)

    results = []

    # Calculate similarity
    for i, suspect_embed in enumerate(suspect_embeddings):
        similarities = cosine_similarity(suspect_embed.reshape(1, -1), reference_embeddings)[0]
        max_sim = np.max(similarities)
        similarity_score = float(round(max_sim * 100, 2))  # Convert NumPy float32 to Python float
        max_index = np.argmax(similarities)

        is_plagiarism = bool(similarity_score > threshold)  # Convert NumPy bool to Python bool

        result = {
            "_id": ObjectId(),
            "suspect_text": suspect_sentences[i],
            "reference_text": reference_sentences[max_index],
            "similarity_score": similarity_score,
            "is_plagiarism": is_plagiarism
        }

        results.append(result)

        if is_plagiarism:
            print(f"🚨 Plagiarism detected!")
            print(f"🔍 Suspect: {suspect_sentences[i]}")
            print(f"📖 Reference: {reference_sentences[max_index]}")
            print(f"🔥 Score: {similarity_score}%\n")

    # Save results to MongoDB
    if results:
        results_collection.insert_many(results)
        print(f"✅ {len(results)} plagiarism results stored successfully.")

    return results
