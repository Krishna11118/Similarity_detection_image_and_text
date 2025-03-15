# import torch
# from transformers import CLIPProcessor, CLIPModel
# from PIL import Image
# import numpy as np
# import os
# from bson import ObjectId
# from config.db import get_db  

# # Set device (GPU if available)
# device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# print(f"🔍 Using device: {device}")

# # Load the best open-source CLIP model
# model_name = "openai/clip-vit-large-patch14-336"
# processor = CLIPProcessor.from_pretrained(model_name)
# model = CLIPModel.from_pretrained(model_name).to(device)
# model.eval()  # Set to evaluation mode

# def extract_features(image_path):
#     """Extract features from an image using CLIP."""
#     try:
#         img = Image.open(image_path).convert("RGB")
#         inputs = processor(images=img, return_tensors="pt").to(device)
#         with torch.no_grad():
#             features = model.get_image_features(**inputs)
#         return features.cpu().numpy()
#     except Exception as e:
#         print(f"Error processing {image_path}: {e}")
#         return None

# def compute_similarity(before_path, after_path):
#     """Compute similarity score between two images."""
#     before_features = extract_features(before_path)
#     after_features = extract_features(after_path)
    
#     if before_features is None or after_features is None:
#         return None
    
#     # Compute cosine similarity
#     similarity = np.dot(before_features, after_features.T) / (
#         np.linalg.norm(before_features) * np.linalg.norm(after_features)
#     )
#     similarity_score = float((similarity.item() + 1) / 2 * 100)  # Normalize to [0, 100]
#     return similarity_score

# def process_image_similarity(db, base_dir="/workspaces/Image_and_image_detection_web_app/backend/"):
#     """Fetch image paths from DB, match with filesystem, compute similarity, and save results."""
#     # Access collections
#     form_collection = db["forms"]  # Adjust to your collection name
#     results_collection = db["image_similarity_results"]

#     # Fetch documents with before and after picture paths
#     documents = form_collection.find({"beforePicturePaths": {"$exists": True}, "afterPicturePaths": {"$exists": True}})
    
#     results = []
#     for doc in documents:
#         before_paths = doc.get("beforePicturePaths", [])
#         after_paths = doc.get("afterPicturePaths", [])
#         project_name = doc.get("projectName", "Unknown Project")
#         uid = doc.get("uid", None)

#         # Pair before and after images (assuming equal lengths or handling mismatches)
#         for before_rel_path, after_rel_path in zip(before_paths, after_paths):
#             # Construct absolute paths
#             before_path = os.path.join(base_dir, before_rel_path)
#             after_path = os.path.join(base_dir, after_rel_path)

#             # Verify file existence
#             if not os.path.isfile(before_path):
#                 print(f"File not found: {before_path}")
#                 continue
#             if not os.path.isfile(after_path):
#                 print(f"File not found: {after_path}")
#                 continue

#             # Compute similarity
#             similarity_score = compute_similarity(before_path, after_path)
#             if similarity_score is None:
#                 continue

#             # Prepare result
#             result = {
#                 "_id": ObjectId(),
#                 "uid": uid,
#                 "projectName": project_name,
#                 "beforeImagePath": before_rel_path,
#                 "afterImagePath": after_rel_path,
#                 "similarityScore": similarity_score,
#                 "isSimilar": bool(similarity_score > 85),  # Threshold of 85% for similarity
#                 "processedAt": {"$date": "2025-03-15T17:52:31.802Z"}  # Use current date in production
#             }
#             results.append(result)
#             print(f"Compared {before_rel_path} with {after_rel_path} -> Similarity: {similarity_score}%")

#     # Save results to MongoDB
#     if results:
#         try:
#             results_collection.insert_many(results)
#             print(f"Successfully inserted {len(results)} similarity results into MongoDB.")
#         except Exception as e:
#             print(f"Error saving to MongoDB: {e}")

#     return results

# if __name__ == "__main__":
#     # Get database connection
#     db = get_db()
    
#     # Process image similarity
#     results = process_image_similarity(db)
    
#     # Print summary
#     print("\n📊 Final Results:")
#     for res in results:
#         print(f"🖼️ {res['beforeImagePath']} vs {res['afterImagePath']} -> {res['similarityScore']}% similarity")


# -------------------------------DINOv2-------------------------------------------------------------------------------------------------------------------------------------------------

# import torch
# from transformers import AutoImageProcessor, AutoModel
# from PIL import Image
# import numpy as np
# import os
# from bson import ObjectId
# from datetime import datetime
# from config.db import get_db 
# from sklearn.preprocessing import normalize
# import torchvision.transforms as transforms

# # Set device (GPU if available)
# device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# print(f"🔍 Using device: {device}")

# # Load DINOv2 Model
# processor = AutoImageProcessor.from_pretrained("facebook/dinov2-base")
# model = AutoModel.from_pretrained("facebook/dinov2-base").to(device)
# model.eval()

# # Define image preprocessing pipeline
# preprocess = transforms.Compose([
#     transforms.Resize((518, 518)),  
#     transforms.CenterCrop(518),
#     transforms.ToTensor(),
#     transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),  
# ])

# def extract_features(image_path):
#     """Extract features from an image using DINOv2."""
#     try:
#         img = Image.open(image_path).convert("RGB")
#         img_tensor = preprocess(img).unsqueeze(0).to(device)  # Add batch dimension
        
#         with torch.no_grad():
#             features = model(img_tensor).last_hidden_state.mean(dim=1)  # Average pooling
        
#         features_np = features.cpu().numpy().squeeze()
#         return normalize(features_np.reshape(1, -1)).flatten()  # Normalize features
#     except Exception as e:
#         print(f"❌ Error processing {image_path}: {e}")
#         return None

# def compute_similarity(before_path, after_path):
#     """Compute cosine similarity between two images."""
#     before_features = extract_features(before_path)
#     after_features = extract_features(after_path)
    
#     if before_features is None or after_features is None:
#         return None
    
#     # Compute cosine similarity
#     similarity = np.dot(before_features, after_features.T)  # Normalized vectors
#     similarity_score = float((similarity + 1) / 2 * 100)  # Normalize to [0, 100]
#     return similarity_score

# def process_image_similarity(db, base_dir="/workspaces/Image_and_image_detection_web_app/backend/"):
#     """Fetch image paths from DB, match with filesystem, compute similarity, and save results."""
#     form_collection = db["forms"]
#     results_collection = db["image_similarity_results"]

#     documents = form_collection.find({"beforePicturePaths": {"$exists": True}, "afterPicturePaths": {"$exists": True}})
    
#     results = []
#     for doc in documents:
#         before_paths = doc.get("beforePicturePaths", [])
#         after_paths = doc.get("afterPicturePaths", [])
#         project_name = doc.get("projectName", "Unknown Project")
#         uid = doc.get("uid", None)

#         for before_rel_path, after_rel_path in zip(before_paths, after_paths):
#             before_path = os.path.join(base_dir, before_rel_path)
#             after_path = os.path.join(base_dir, after_rel_path)

#             if not os.path.isfile(before_path):
#                 print(f"⚠️ File not found: {before_path}")
#                 continue
#             if not os.path.isfile(after_path):
#                 print(f"⚠️ File not found: {after_path}")
#                 continue

#             similarity_score = compute_similarity(before_path, after_path)
#             if similarity_score is None:
#                 continue

#             results.append({
#                 "_id": ObjectId(),
#                 "uid": uid,
#                 "projectName": project_name,
#                 "beforeImagePath": before_rel_path,
#                 "afterImagePath": after_rel_path,
#                 "similarityScore": similarity_score,
#                 "isSimilar": similarity_score > 85,  # Threshold of 85%
#                 "processedAt": datetime.utcnow(),  # Store in UTC format
#             })
#             print(f"✅ {before_rel_path} vs {after_rel_path} → {similarity_score}% similarity")

#     if results:
#         try:
#             results_collection.insert_many(results)  # Bulk insert
#             print(f"📌 Successfully inserted {len(results)} similarity results.")
#         except Exception as e:
#             print(f"❌ Error saving to MongoDB: {e}")

#     return results

# if __name__ == "__main__":
#     db = get_db()
#     results = process_image_similarity(db)
    
#     print("\n📊 Final Results:")
#     for res in results[:10]:  # Print only first 10 results
#         print(f"🖼 {res['beforeImagePath']} vs {res['afterImagePath']} → {res['similarityScore']}% similarity")


# -------------------------------FAISS-------------------------------------------------------------------------------------------------------------------------------------------------


import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import numpy as np
import os
from bson import ObjectId
from config.db import get_db
import faiss  # Import FAISS library

# Set device (GPU if available)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"🔍 Using device: {device}")

# Load the best open-source CLIP model
model_name = "openai/clip-vit-large-patch14-336"
processor = CLIPProcessor.from_pretrained(model_name)
model = CLIPModel.from_pretrained(model_name).to(device)
model.eval()  # Set to evaluation mode

def extract_features(image_path):
    """Extract features from an image using CLIP."""
    try:
        img = Image.open(image_path).convert("RGB")
        inputs = processor(images=img, return_tensors="pt").to(device)
        with torch.no_grad():
            features = model.get_image_features(**inputs)
        return features.cpu().numpy().flatten()  # Flatten to 1D array for FAISS
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return None

def build_faiss_index(features_list):
    """Build a FAISS index from a list of feature vectors."""
    if not features_list or any(f is None for f in features_list):
        return None
    features_array = np.stack(features_list).astype('float32')  # Stack into a 2D array
    dimension = features_array.shape[1]  # Feature dimensionality (e.g., 768 for CLIP ViT-L)
    index = faiss.IndexFlatIP(dimension)  # Inner Product (cosine similarity) index
    faiss.normalize_L2(features_array)  # Normalize for cosine similarity
    index.add(features_array)  # Add features to index
    return index

def process_image_similarity(db, base_dir="/workspaces/Image_and_image_detection_web_app/backend/"):
    """Fetch image paths from DB, use FAISS to compute similarity, and save results."""
    # Access collections
    form_collection = db["forms"]  # Adjust to your collection name
    results_collection = db["image_similarity_results"]

    # Fetch documents with before and after picture paths
    documents = form_collection.find({"beforePicturePaths": {"$exists": True}, "afterPicturePaths": {"$exists": True}})
    
    results = []
    for doc in documents:
        before_paths = doc.get("beforePicturePaths", [])
        after_paths = doc.get("afterPicturePaths", [])
        project_name = doc.get("projectName", "Unknown Project")
        uid = doc.get("uid", None)

        # Construct absolute paths and verify existence
        before_abs_paths = [os.path.join(base_dir, path) for path in before_paths]
        after_abs_paths = [os.path.join(base_dir, path) for path in after_paths]
        
        valid_before_paths = [p for p in before_abs_paths if os.path.isfile(p)]
        valid_after_paths = [p for p in after_abs_paths if os.path.isfile(p)]
        
        if not valid_before_paths or not valid_after_paths:
            print(f"Skipping document {uid}: No valid image files found.")
            continue

        # Extract features for all before and after images
        before_features = [extract_features(path) for path in valid_before_paths]
        after_features = [extract_features(path) for path in valid_after_paths]
        
        # Filter out None values
        before_features = [f for f in before_features if f is not None]
        after_features = [f for f in after_features if f is not None]
        
        if not before_features or not after_features:
            print(f"Skipping document {uid}: Failed to extract features.")
            continue

        # Build FAISS index for before images
        index = build_faiss_index(before_features)
        if index is None:
            print(f"Skipping document {uid}: Failed to build FAISS index.")
            continue

        # Query after images against the index
        after_features_array = np.stack(after_features).astype('float32')
        faiss.normalize_L2(after_features_array)  # Normalize for cosine similarity
        distances, indices = index.search(after_features_array, 1)  # Top 1 match
        
        # Process results
        for i, (after_path, distance, idx) in enumerate(zip(valid_after_paths, distances, indices)):
            before_path = valid_before_paths[idx[0]]  # Most similar before image
            similarity_score = float(distance[0] * 100)  # FAISS IP is [0, 1], scale to [0, 100]
            
            result = {
                "_id": ObjectId(),
                "uid": uid,
                "projectName": project_name,
                "beforeImagePath": os.path.relpath(before_path, base_dir),
                "afterImagePath": os.path.relpath(after_path, base_dir),
                "similarityScore": similarity_score,
                "isSimilar": bool(similarity_score > 85),  # Threshold of 85%
                "processedAt": {"$date": "2025-03-15T17:52:31.802Z"}  # Update to current date in production
            }
            results.append(result)
            print(f"Compared {result['beforeImagePath']} with {result['afterImagePath']} -> Similarity: {similarity_score}%")

    # Save results to MongoDB
    if results:
        try:
            results_collection.insert_many(results)
            print(f"Successfully inserted {len(results)} similarity results into MongoDB.")
        except Exception as e:
            print(f"Error saving to MongoDB: {e}")

    return results

if __name__ == "__main__":
    # Install FAISS if not already installed
    try:
        import faiss
    except ImportError:
        print("FAISS not found. Install it with: pip install faiss-cpu (or faiss-gpu)")
        exit()

    # Get database connection
    db = get_db()
    
    # Process image similarity
    results = process_image_similarity(db)
    
    # Print summary
    print("\n📊 Final Results:")
    for res in results:
        print(f"🖼️ {res['beforeImagePath']} vs {res['afterImagePath']} -> {res['similarityScore']}% similarity")