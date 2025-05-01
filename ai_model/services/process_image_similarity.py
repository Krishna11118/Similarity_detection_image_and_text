

# ----------------------------------------------------------Chroma DB Working-------------------
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import numpy as np
import os
from bson import ObjectId
import logging
import chromadb
from dataclasses import dataclass
from typing import List, Dict, Optional
from config.db import get_db

@dataclass
class Config:
    model_name: str = "openai/clip-vit-large-patch14-336"
    base_dir: str = "/workspace/Text_and_Image_detection/backend/"
    similarity_threshold: float = 85.0
    batch_size: int = 32
    max_image_size: int = 336
    chromadb_collection: str = "image_embeddings"

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImageSimilarityProcessor:
    def __init__(self, config: Config = Config()):
        """Initialize the image similarity processor and ChromaDB."""
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")

        # Load CLIP Model
        try:
            self.processor = CLIPProcessor.from_pretrained(config.model_name)
            self.model = CLIPModel.from_pretrained(config.model_name).to(self.device)
            self.model.eval()
            if torch.cuda.is_available():
                self.model = torch.compile(self.model)
            logger.info(f"Loaded model: {config.model_name}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(path="./chromadb_store")
        self.collection = self.client.get_or_create_collection(name=self.config.chromadb_collection)
        logger.info(f"Connected to ChromaDB collection: {self.config.chromadb_collection}")

    def extract_features(self, image_path: str) -> Optional[np.ndarray]:
        """Extract features from an image using CLIP."""
        try:
            img = Image.open(image_path).convert("RGB")
            img.thumbnail((self.config.max_image_size, self.config.max_image_size), Image.Resampling.LANCZOS)
            inputs = self.processor(images=img, return_tensors="pt").to(self.device)
            with torch.no_grad(), torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
                features = self.model.get_image_features(**inputs)
            # Normalize the features for cosine similarity
            features = features / torch.norm(features, dim=-1, keepdim=True)
            return features.cpu().numpy().flatten()
        except Exception as e:
            logger.error(f"Error processing {image_path}: {e}")
            return None

    def get_image_data(self, db) -> List[Dict]:
        """Fetch image data from MongoDB."""
        try:
            form_collection = db["forms"]
            documents = form_collection.find({"beforePicturePaths": {"$exists": True}, "afterPicturePaths": {"$exists": True}})
            
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

    def store_embeddings_in_chroma(self, image_data: List[Dict]):
        """Store image embeddings in ChromaDB with unique IDs."""
        try:
            # Clear existing embeddings only if there are any
            existing_ids = self.collection.get()["ids"]
            if existing_ids:  # Check if the list is non-empty
                self.collection.delete(ids=existing_ids)
                logger.info(f"Cleared {len(existing_ids)} existing embeddings from collection")
            
            for i, img in enumerate(image_data):
                embedding = self.extract_features(img["path"])
                if embedding is not None:
                    unique_id = f"{img['uid']}_{i}"
                    self.collection.add(
                        ids=[unique_id],
                        embeddings=[embedding.tolist()],
                        metadatas=[{
                            "path": img["rel_path"],
                            "uid": str(img["uid"]),
                            "projectName": img["projectName"]
                        }]
                    )
                    logger.info(f"Stored embedding for {img['rel_path']} in ChromaDB with ID {unique_id}")
                else:
                    logger.warning(f"Skipping {img['rel_path']} due to missing embedding.")
        except Exception as e:
            logger.error(f"Error storing embeddings in ChromaDB: {e}")
            raise

    def find_similar_images(self, image_data: List[Dict]) -> List[Dict]:
        """Find similar images using ChromaDB, excluding self-matches and duplicates."""
        results = []
        total_images = self.collection.count()
        seen_pairs = set()  # To track processed pairs and avoid duplicates
        
        for img in image_data:
            embedding = self.extract_features(img["path"])
            if embedding is None:
                continue

            # Query ChromaDB for similar images, no limit on results
            search_results = self.collection.query(
                query_embeddings=[embedding.tolist()]
            )

            query_path = img["rel_path"]
            for i, (distance, matched) in enumerate(zip(search_results["distances"][0], search_results["metadatas"][0])):
                matched_path = matched["path"]
                
                # Skip self-match by comparing paths
                if query_path == matched_path:
                    continue

                # Create a unique pair key to avoid duplicates
                pair_key = tuple(sorted([query_path, matched_path]))
                if pair_key in seen_pairs:
                    continue
                seen_pairs.add(pair_key)

                # Convert cosine distance to similarity percentage (0-100)
                similarity_score = (1 - distance) * 100
                logger.debug(f"Raw distance for {query_path} vs {matched_path}: {distance}")
                similarity_score = max(0, min(100, similarity_score))  # Clamp to [0, 100]
                is_similar = similarity_score > self.config.similarity_threshold

                result = {
                    "_id": ObjectId(),
                    "queryUid": img["uid"],
                    "comparedUid": matched["uid"],
                    "queryImagePath": query_path,
                    "comparedImagePath": matched_path,
                    "similarityScore": round(similarity_score, 2),
                    "isSimilar": is_similar,
                    "processedAt": {"$date": "2025-03-16T08:56:50.097Z"}
                }
                results.append(result)
                logger.info(f"Compared {query_path} vs {matched_path}: {similarity_score}%")

        return results

    def process_similarity(self, db) -> List[Dict]:
        """Process and store image similarity results using ChromaDB."""
        image_data = self.get_image_data(db)
        if not image_data:
            logger.warning("No valid image files found in the database")
            return []

        # Store embeddings in ChromaDB
        self.store_embeddings_in_chroma(image_data)

        # Find similar images
        results = self.find_similar_images(image_data)

        # Save results to MongoDB
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