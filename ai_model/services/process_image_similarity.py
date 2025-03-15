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


# import torch
# from transformers import CLIPProcessor, CLIPModel
# from PIL import Image
# import numpy as np
# import os
# from bson import ObjectId
# from config.db import get_db
# import faiss  # Import FAISS library

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
#         return features.cpu().numpy().flatten()  # Flatten to 1D array for FAISS
#     except Exception as e:
#         print(f"Error processing {image_path}: {e}")
#         return None

# def build_faiss_index(features_list):
#     """Build a FAISS index from a list of feature vectors."""
#     if not features_list or any(f is None for f in features_list):
#         return None
#     features_array = np.stack(features_list).astype('float32')  # Stack into a 2D array
#     dimension = features_array.shape[1]  # Feature dimensionality (e.g., 768 for CLIP ViT-L)
#     index = faiss.IndexFlatIP(dimension)  # Inner Product (cosine similarity) index
#     faiss.normalize_L2(features_array)  # Normalize for cosine similarity
#     index.add(features_array)  # Add features to index
#     return index

# def process_image_similarity(db, base_dir="/workspaces/Image_and_image_detection_web_app/backend/"):
#     """Fetch image paths from DB, use FAISS to compute similarity, and save results."""
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

#         # Construct absolute paths and verify existence
#         before_abs_paths = [os.path.join(base_dir, path) for path in before_paths]
#         after_abs_paths = [os.path.join(base_dir, path) for path in after_paths]
        
#         valid_before_paths = [p for p in before_abs_paths if os.path.isfile(p)]
#         valid_after_paths = [p for p in after_abs_paths if os.path.isfile(p)]
        
#         if not valid_before_paths or not valid_after_paths:
#             print(f"Skipping document {uid}: No valid image files found.")
#             continue

#         # Extract features for all before and after images
#         before_features = [extract_features(path) for path in valid_before_paths]
#         after_features = [extract_features(path) for path in valid_after_paths]
        
#         # Filter out None values
#         before_features = [f for f in before_features if f is not None]
#         after_features = [f for f in after_features if f is not None]
        
#         if not before_features or not after_features:
#             print(f"Skipping document {uid}: Failed to extract features.")
#             continue

#         # Build FAISS index for before images
#         index = build_faiss_index(before_features)
#         if index is None:
#             print(f"Skipping document {uid}: Failed to build FAISS index.")
#             continue

#         # Query after images against the index
#         after_features_array = np.stack(after_features).astype('float32')
#         faiss.normalize_L2(after_features_array)  # Normalize for cosine similarity
#         distances, indices = index.search(after_features_array, 1)  # Top 1 match
        
#         # Process results
#         for i, (after_path, distance, idx) in enumerate(zip(valid_after_paths, distances, indices)):
#             before_path = valid_before_paths[idx[0]]  # Most similar before image
#             similarity_score = float(distance[0] * 100)  # FAISS IP is [0, 1], scale to [0, 100]
            
#             result = {
#                 "_id": ObjectId(),
#                 "uid": uid,
#                 "projectName": project_name,
#                 "beforeImagePath": os.path.relpath(before_path, base_dir),
#                 "afterImagePath": os.path.relpath(after_path, base_dir),
#                 "similarityScore": similarity_score,
#                 "isSimilar": bool(similarity_score > 85),  # Threshold of 85%
#                 "processedAt": {"$date": "2025-03-15T17:52:31.802Z"}  # Update to current date in production
#             }
#             results.append(result)
#             print(f"Compared {result['beforeImagePath']} with {result['afterImagePath']} -> Similarity: {similarity_score}%")

#     # Save results to MongoDB
#     if results:
#         try:
#             results_collection.insert_many(results)
#             print(f"Successfully inserted {len(results)} similarity results into MongoDB.")
#         except Exception as e:
#             print(f"Error saving to MongoDB: {e}")

#     return results

# if __name__ == "__main__":
#     # Install FAISS if not already installed
#     try:
#         import faiss
#     except ImportError:
#         print("FAISS not found. Install it with: pip install faiss-cpu (or faiss-gpu)")
#         exit()

#     # Get database connection
#     db = get_db()
    
#     # Process image similarity
#     results = process_image_similarity(db)
    
#     # Print summary
#     print("\n📊 Final Results:")
#     for res in results:
#         print(f"🖼️ {res['beforeImagePath']} vs {res['afterImagePath']} -> {res['similarityScore']}% similarity")


# ---------------------------------------------FAISS 2-----------------------------------------------------------------------------------------------------------------------------------------


# import torch
# from transformers import CLIPProcessor, CLIPModel
# from PIL import Image
# import numpy as np
# import os
# from bson import ObjectId
# from config.db import get_db
# import faiss
# import pickle  # For saving image path metadata

# # Set device (GPU if available)
# device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# print(f"🔍 Using device: {device}")

# # Load the best open-source CLIP model
# model_name = "openai/clip-vit-large-patch14-336"
# processor = CLIPProcessor.from_pretrained(model_name)
# model = CLIPModel.from_pretrained(model_name).to(device)
# model.eval()  # Set to evaluation mode

# # Paths for saving FAISS index and metadata
# FAISS_INDEX_PATH = "faiss_index.bin"
# METADATA_PATH = "faiss_metadata.pkl"

# def extract_features(image_path):
#     """Extract features from an image using CLIP."""
#     try:
#         img = Image.open(image_path).convert("RGB")
#         inputs = processor(images=img, return_tensors="pt").to(device)
#         with torch.no_grad():
#             features = model.get_image_features(**inputs)
#         return features.cpu().numpy().flatten()  # Flatten to 1D array for FAISS
#     except Exception as e:
#         print(f"Error processing {image_path}: {e}")
#         return None

# def build_and_save_faiss_index(features_list, image_paths, index_path=FAISS_INDEX_PATH, metadata_path=METADATA_PATH):
#     """Build a FAISS index from features and save it with metadata."""
#     if not features_list or any(f is None for f in features_list):
#         return None, None
    
#     features_array = np.stack(features_list).astype('float32')  # Stack into a 2D array
#     dimension = features_array.shape[1]  # Feature dimensionality (e.g., 768 for CLIP ViT-L)
#     index = faiss.IndexFlatIP(dimension)  # Inner Product (cosine similarity) index
#     faiss.normalize_L2(features_array)  # Normalize for cosine similarity
#     index.add(features_array)  # Add features to index
    
#     # Save FAISS index to disk
#     faiss.write_index(index, index_path)
#     print(f"FAISS index saved to {index_path}")
    
#     # Save metadata (image paths) to disk
#     with open(metadata_path, 'wb') as f:
#         pickle.dump(image_paths, f)
#     print(f"Metadata saved to {metadata_path}")
    
#     return index, image_paths

# def load_faiss_index(index_path=FAISS_INDEX_PATH, metadata_path=METADATA_PATH):
#     """Load a FAISS index and metadata from disk."""
#     if not os.path.exists(index_path) or not os.path.exists(metadata_path):
#         print("FAISS index or metadata not found. Rebuilding required.")
#         return None, None
    
#     index = faiss.read_index(index_path)
#     with open(metadata_path, 'rb') as f:
#         image_paths = pickle.load(f)
#     print(f"Loaded FAISS index from {index_path} and metadata from {metadata_path}")
#     return index, image_paths

# def process_image_similarity(db, base_dir="/workspaces/Image_and_image_detection_web_app/backend/", recompute=False):
#     """Fetch image paths, compute/save FAISS index, match each image with all others, and save results."""
#     # Access collections
#     form_collection = db["forms"]  # Adjust to your collection name
#     results_collection = db["image_similarity_results"]

#     # Load existing FAISS index if not recomputing
#     if not recompute and os.path.exists(FAISS_INDEX_PATH) and os.path.exists(METADATA_PATH):
#         index, all_image_paths = load_faiss_index()
#     else:
#         # Fetch all image paths from DB
#         documents = form_collection.find({"beforePicturePaths": {"$exists": True}, "afterPicturePaths": {"$exists": True}})
        
#         all_image_paths = []
#         doc_metadata = {}  # Store uid and projectName for each image
#         for doc in documents:
#             before_paths = doc.get("beforePicturePaths", [])
#             after_paths = doc.get("afterPicturePaths", [])
#             uid = doc.get("uid", None)
#             project_name = doc.get("projectName", "Unknown Project")
            
#             for path in before_paths + after_paths:
#                 abs_path = os.path.join(base_dir, path)
#                 if os.path.isfile(abs_path):
#                     all_image_paths.append(abs_path)
#                     doc_metadata[abs_path] = {"uid": uid, "projectName": project_name}

#         if not all_image_paths:
#             print("No valid image files found in the database.")
#             return []

#         # Extract features for all images
#         all_features = [extract_features(path) for path in all_image_paths]
#         valid_features = [f for f in all_features if f is not None]
#         valid_paths = [p for f, p in zip(all_features, all_image_paths) if f is not None]
        
#         if not valid_features:
#             print("Failed to extract features for any images.")
#             return []

#         # Build and save FAISS index
#         index, valid_paths = build_and_save_faiss_index(valid_features, valid_paths)
#         if index is None:
#             print("Failed to build FAISS index.")
#             return []
        
#         all_image_paths = valid_paths
#         doc_metadata = {p: doc_metadata[p] for p in valid_paths}  # Update metadata

#     # Compute similarities for each image against all others (excluding itself)
#     results = []
#     features_array = faiss.index_to_vectors(index) if hasattr(index, 'index_to_vectors') else np.array([index.reconstruct(i) for i in range(index.ntotal)])
#     for i, query_path in enumerate(all_image_paths):
#         query_features = features_array[i:i+1].astype('float32')  # Reshape to [1, dim]
        
#         # Search all images (including self, we'll filter later)
#         distances, indices = index.search(query_features, index.ntotal)
        
#         # Process results, excluding self
#         for distance, idx in zip(distances[0], indices[0]):
#             if idx == i:  # Skip self
#                 continue
#             compared_path = all_image_paths[idx]
#             similarity_score = float(distance * 100)  # FAISS IP is [0, 1], scale to [0, 100]
            
#             result = {
#                 "_id": ObjectId(),
#                 "uid": doc_metadata[query_path]["uid"],
#                 "projectName": doc_metadata[query_path]["projectName"],
#                 "queryImagePath": os.path.relpath(query_path, base_dir),
#                 "comparedImagePath": os.path.relpath(compared_path, base_dir),
#                 "similarityScore": similarity_score,
#                 "isSimilar": bool(similarity_score > 85),  # Threshold of 85%
#                 "processedAt": {"$date": "2025-03-15T17:52:31.802Z"}  # Update to current date in production
#             }
#             results.append(result)
#             print(f"Compared {result['queryImagePath']} with {result['comparedImagePath']} -> Similarity: {similarity_score}%")

#     # Save results to MongoDB
#     if results:
#         try:
#             results_collection.insert_many(results)
#             print(f"Successfully inserted {len(results)} similarity results into MongoDB.")
#         except Exception as e:
#             print(f"Error saving to MongoDB: {e}")

#     return results

# if __name__ == "__main__":
#     # Install FAISS if not already installed
#     try:
#         import faiss
#     except ImportError:
#         print("FAISS not found. Install it with: pip install faiss-cpu (or faiss-gpu)")
#         exit()

#     # Get database connection
#     db = get_db()
    
#     # Process image similarity (set recompute=True to rebuild index, False to reuse)
#     results = process_image_similarity(db, recompute=True)
    
#     # Print summary
#     print("\n📊 Final Results:")
#     for res in results:
#         print(f"🖼️ {res['queryImagePath']} vs {res['comparedImagePath']} -> {res['similarityScore']}% similarity")


# -------------------------FAISS 3---------------------------------------

# import torch
# from transformers import CLIPProcessor, CLIPModel
# from PIL import Image
# import numpy as np
# import os
# from bson import ObjectId
# from config.db import get_db
# import faiss
# import pickle  # For saving image path metadata

# # Set device (GPU if available)
# device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# print(f"🔍 Using device: {device}")

# # Load the best open-source CLIP model
# model_name = "openai/clip-vit-large-patch14-336"
# processor = CLIPProcessor.from_pretrained(model_name)
# model = CLIPModel.from_pretrained(model_name).to(device)
# model.eval()  # Set to evaluation mode

# # Paths for saving FAISS index and metadata
# FAISS_INDEX_PATH = "faiss_index.bin"
# METADATA_PATH = "faiss_metadata.pkl"

# def extract_features(image_path):
#     """Extract features from an image using CLIP."""
#     try:
#         img = Image.open(image_path).convert("RGB")
#         inputs = processor(images=img, return_tensors="pt").to(device)
#         with torch.no_grad():
#             features = model.get_image_features(**inputs)
#         return features.cpu().numpy().flatten()  # Flatten to 1D array for FAISS
#     except Exception as e:
#         print(f"Error processing {image_path}: {e}")
#         return None

# def build_and_save_faiss_index(features_list, image_paths, doc_metadata, index_path=FAISS_INDEX_PATH, metadata_path=METADATA_PATH):
#     """Build a FAISS index from features and save it with metadata."""
#     if not features_list or any(f is None for f in features_list):
#         return None, None, None

#     features_array = np.stack(features_list).astype('float32')
#     dimension = features_array.shape[1]
#     index = faiss.IndexFlatIP(dimension)
#     faiss.normalize_L2(features_array)
#     index.add(features_array)

#     # Save FAISS index
#     faiss.write_index(index, index_path)
#     print(f"FAISS index saved to {index_path}")

#     # Save metadata (image paths and doc metadata)
#     with open(metadata_path, 'wb') as f:
#         pickle.dump({"paths": image_paths, "metadata": doc_metadata}, f)
#     print(f"Metadata saved to {metadata_path}")

#     return index, image_paths, doc_metadata

# def load_faiss_index(index_path=FAISS_INDEX_PATH, metadata_path=METADATA_PATH):
#     """Load a FAISS index and metadata from disk."""
#     if not os.path.exists(index_path) or not os.path.exists(metadata_path):
#         print("FAISS index or metadata not found. Rebuilding required.")
#         return None, None, None  # Return an extra None for doc_metadata

#     index = faiss.read_index(index_path)
#     with open(metadata_path, 'rb') as f:
#         data = pickle.load(f)

#     if isinstance(data, dict) and "paths" in data and "metadata" in data:
#         image_paths = data["paths"]
#         doc_metadata = data["metadata"]
#     else:
#         image_paths = data  # If old format, assume it's only paths
#         doc_metadata = {}  # Empty metadata to avoid errors

#     print(f"Loaded FAISS index from {index_path} and metadata from {metadata_path}")
#     return index, image_paths, doc_metadata

# def process_image_similarity(db, base_dir="/workspaces/Image_and_image_detection_web_app/backend/", recompute=False):
#     """Fetch image paths, compute/save FAISS index, match each image with all others, and save results."""
#     form_collection = db["forms"]  # Adjust to your collection name
#     results_collection = db["image_similarity_results"]

#     if not recompute and os.path.exists(FAISS_INDEX_PATH) and os.path.exists(METADATA_PATH):
#         index, all_image_paths = load_faiss_index()
#         index, all_image_paths, doc_metadata = load_faiss_index()

#     else:
#         documents = form_collection.find({"beforePicturePaths": {"$exists": True}, "afterPicturePaths": {"$exists": True}})
        
#         all_image_paths = []
#         doc_metadata = {}
#         for doc in documents:
#             before_paths = doc.get("beforePicturePaths", [])
#             after_paths = doc.get("afterPicturePaths", [])
#             uid = doc.get("uid", None)
#             project_name = doc.get("projectName", "Unknown Project")
            
#             for path in before_paths + after_paths:
#                 abs_path = os.path.join(base_dir, path)
#                 if os.path.isfile(abs_path):
#                     all_image_paths.append(abs_path)
#                     doc_metadata[abs_path] = {"uid": uid, "projectName": project_name}

#         if not all_image_paths:
#             print("No valid image files found in the database.")
#             return []

#         all_features = [extract_features(path) for path in all_image_paths]
#         valid_features = [f for f in all_features if f is not None]
#         valid_paths = [p for f, p in zip(all_features, all_image_paths) if f is not None]
        
#         if not valid_features:
#             print("Failed to extract features for any images.")
#             return []

#         index, valid_paths = build_and_save_faiss_index(valid_features, valid_paths)
#         if index is None:
#             print("Failed to build FAISS index.")
#             return []
        
#         all_image_paths = valid_paths
#         doc_metadata = {p: doc_metadata[p] for p in valid_paths}

#     results = []
#     features_array = np.array([index.reconstruct(i) for i in range(index.ntotal)])
#     for i, query_path in enumerate(all_image_paths):
#         query_features = features_array[i:i+1].astype('float32')
#         distances, indices = index.search(query_features, index.ntotal)
        
#         for distance, idx in zip(distances[0], indices[0]):
#             if idx == i:
#                 continue
#             compared_path = all_image_paths[idx]
#             similarity_score = float(distance * 100)
            
#             result = {
#                 "_id": ObjectId(),
#                 "uid": doc_metadata[query_path]["uid"],
#                 "projectName": doc_metadata[query_path]["projectName"],
#                 "queryImagePath": os.path.relpath(query_path, base_dir),
#                 "comparedImagePath": os.path.relpath(compared_path, base_dir),
#                 "similarityScore": similarity_score,
#                 "isSimilar": bool(similarity_score > 85),
#                 "processedAt": {"$date": "2025-03-15T17:52:31.802Z"}
#             }
#             results.append(result)
#             print(f"Compared {result['queryImagePath']} with {result['comparedImagePath']} -> Similarity: {similarity_score}%")

#     if results:
#         try:
#             results_collection.insert_many(results)
#             print(f"Successfully inserted {len(results)} similarity results into MongoDB.")
#         except Exception as e:
#             print(f"Error saving to MongoDB: {e}")

#     return results

# if __name__ == "__main__":
#     db = get_db()
#     results = process_image_similarity(db, recompute=True)
#     print("\n📊 Final Results:")
#     for res in results:
#         print(f"🎨 {res['queryImagePath']} vs {res['comparedImagePath']} -> {res['similarityScore']}% similarity")

# -----------------------------------------------------------------5 ---------------------------------------------------------------------------------------------------------------------------
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

# # Load the CLIP model
# model_name = "openai/clip-vit-large-patch14-336"
# processor = CLIPProcessor.from_pretrained(model_name)
# model = CLIPModel.from_pretrained(model_name).to(device)
# model.eval()

# def extract_features(image_path):
#     """Extract features from an image using CLIP."""
#     try:
#         img = Image.open(image_path).convert("RGB")
#         inputs = processor(images=img, return_tensors="pt").to(device)
#         with torch.no_grad():
#             features = model.get_image_features(**inputs)
#         return features.cpu().numpy().flatten()
#     except Exception as e:
#         print(f"❌ Error processing {image_path}: {e}")
#         return None

# def process_image_similarity(db, base_dir="/workspaces/Image_and_image_detection_web_app/backend/"):
#     """Fetch image paths, compute similarity, and save results."""
#     form_collection = db["forms"]
#     results_collection = db["image_similarity_results"]

#     documents = form_collection.find({"beforePicturePaths": {"$exists": True}, "afterPicturePaths": {"$exists": True}})
    
#     image_data = []
#     for doc in documents:
#         uid = doc.get("uid", None)
#         project_name = doc.get("projectName", "Unknown Project")
#         image_paths = doc.get("beforePicturePaths", []) + doc.get("afterPicturePaths", [])
        
#         for path in image_paths:
#             abs_path = os.path.join(base_dir, path)
#             if os.path.isfile(abs_path):
#                 image_data.append({
#                     "path": abs_path,
#                     "rel_path": path,  # Save relative path
#                     "uid": uid,
#                     "projectName": project_name
#                 })
    
#     if not image_data:
#         print("No valid image files found in the database.")
#         return []

#     features = []
#     valid_images = []
#     for img in image_data:
#         feat = extract_features(img["path"])
#         if feat is not None:
#             features.append(feat / np.linalg.norm(feat))  # Normalize for cosine similarity
#             valid_images.append(img)

#     if not features:
#         print("Failed to extract features for any images.")
#         return []

#     features = np.array(features)
#     similarity_matrix = np.dot(features, features.T)  # Compute cosine similarity
#     results = []

#     for i, query_img in enumerate(valid_images):
#         for j, compared_img in enumerate(valid_images):
#             if i == j:
#                 continue  # Skip self-comparison
            
#             similarity_score = round(float(similarity_matrix[i, j] * 100), 2)

#             result = {
#                 "_id": ObjectId(),
#                 "queryUid": query_img["uid"],
#                 "comparedUid": compared_img["uid"],
#                 "queryImagePath": query_img["rel_path"],  # Save relative paths
#                 "comparedImagePath": compared_img["rel_path"],
#                 "similarityScore": similarity_score,
#                 "isSimilar": similarity_score > 85,
#                 "processedAt": {"$date": "2025-03-15T17:52:31.802Z"}
#             }
#             results.append(result)
#             print(f"📸 {result['queryImagePath']} (UID: {result['queryUid']}) vs {result['comparedImagePath']} (UID: {result['comparedUid']}) -> {similarity_score}%")

#     if results:
#         try:
#             results_collection.insert_many(results)
#             print(f"✅ Successfully inserted {len(results)} similarity results into MongoDB.")
#         except Exception as e:
#             print(f"❌ Error saving to MongoDB: {e}")

#     return results

# if __name__ == "__main__":
#     db = get_db()
#     results = process_image_similarity(db)
#     print("\n📊 Final Results:")
#     for res in results:
#         print(f"🔍 {res['queryImagePath']} (UID: {res['queryUid']}) vs {res['comparedImagePath']} (UID: {res['comparedUid']}) -> {res['similarityScore']}% similarity")




import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import numpy as np
import os
from bson import ObjectId
import logging
from dataclasses import dataclass
from typing import List, Dict, Optional
from config.db import get_db  # Assuming this is your DB config

@dataclass
class Config:
    model_name: str = "openai/clip-vit-large-patch14-336"
    base_dir: str = "/workspaces/Image_and_image_detection_web_app/backend/"
    similarity_threshold: float = 85.0
    batch_size: int = 32
    max_image_size: int = 336

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ImageSimilarityProcessor:
    def __init__(self, config: Config = Config()):
        """Initialize the image similarity processor."""
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
        try:
            self.processor = CLIPProcessor.from_pretrained(config.model_name)
            self.model = CLIPModel.from_pretrained(config.model_name).to(self.device)
            self.model.eval()
            # Optimize model for GPU if available
            if torch.cuda.is_available():
                self.model = torch.compile(self.model)
            logger.info(f"Loaded model: {config.model_name}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def extract_features(self, image_path: str) -> Optional[np.ndarray]:
        """Extract features from an image using CLIP."""
        try:
            img = Image.open(image_path).convert("RGB")
            img.thumbnail(
                (self.config.max_image_size, self.config.max_image_size),
                Image.Resampling.LANCZOS
            )
            inputs = self.processor(images=img, return_tensors="pt").to(self.device)
            with torch.no_grad(), torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
                features = self.model.get_image_features(**inputs)
            return features.cpu().numpy().flatten()
        except Exception as e:
            logger.error(f"Error processing {image_path}: {e}")
            return None

    def get_image_data(self, db) -> List[Dict]:
        """Fetch image data from MongoDB."""
        try:
            form_collection = db["forms"]
            documents = form_collection.find({
                "beforePicturePaths": {"$exists": True},
                "afterPicturePaths": {"$exists": True}
            })
            
            image_data = []
            for doc in documents:
                uid = doc.get("uid", None)
                project_name = doc.get("projectName", "Unknown Project")
                image_paths = doc.get("beforePicturePaths", []) + doc.get("afterPicturePaths", [])
                
                for path in image_paths:
                    abs_path = os.path.join(self.config.base_dir, path)
                    if os.path.isfile(abs_path):
                        image_data.append({
                            "path": abs_path,
                            "rel_path": path,
                            "uid": uid,
                            "projectName": project_name
                        })
            return image_data
        except Exception as e:
            logger.error(f"Error fetching image data from DB: {e}")
            return []

    def process_batch(self, image_data: List[Dict]) -> tuple[np.ndarray, List[Dict]]:
        """Process images in batches."""
        all_features = []
        valid_images = []
        
        for i in range(0, len(image_data), self.config.batch_size):
            batch = image_data[i:i + self.config.batch_size]
            batch_features = [self.extract_features(img["path"]) for img in batch]
            valid_batch = [img for img, feat in zip(batch, batch_features) if feat is not None]
            valid_feats = [feat / np.linalg.norm(feat) for feat in batch_features if feat is not None]
            all_features.extend(valid_feats)
            valid_images.extend(valid_batch)
            logger.info(f"Processed batch {i//self.config.batch_size + 1}: "
                       f"{len(valid_feats)} valid features")
        
        return np.array(all_features), valid_images

    def process_similarity(self, db) -> List[Dict]:
        """Process image similarity and store results."""
        image_data = self.get_image_data(db)
        if not image_data:
            logger.warning("No valid image files found in the database")
            return []

        # Process images in batches
        features, valid_images = self.process_batch(image_data)
        if not features.any():
            logger.warning("Failed to extract features for any images")
            return []

        # Compute similarity matrix
        similarity_matrix = np.dot(features, features.T)
        results = []
        
        # Generate similarity results
        for i, query_img in enumerate(valid_images):
            for j, compared_img in enumerate(valid_images):
                if i == j:  # Skip self-comparison
                    continue
                
                similarity_score = round(float(similarity_matrix[i, j] * 100), 2)
                result = {
                    "_id": ObjectId(),
                    "queryUid": query_img["uid"],
                    "comparedUid": compared_img["uid"],
                    "queryImagePath": query_img["rel_path"],
                    "comparedImagePath": compared_img["rel_path"],
                    "similarityScore": similarity_score,
                    "isSimilar": similarity_score > self.config.similarity_threshold,
                    "processedAt": {"$date": "2025-03-15T17:52:31.802Z"}
                }
                results.append(result)
                logger.info(f"Compared {result['queryImagePath']} vs "
                           f"{result['comparedImagePath']}: {similarity_score}%")

        # Save to MongoDB
        if results:
            try:
                results_collection = db["image_similarity_results"]
                results_collection.insert_many(results)
                logger.info(f"Successfully inserted {len(results)} similarity results")
            except Exception as e:
                logger.error(f"Error saving to MongoDB: {e}")

        return results

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