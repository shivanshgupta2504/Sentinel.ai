from itertools import combinations
import json
import logging
import os
from pathlib import Path
import random

import cv2
import numpy as np
from app.config import APP_ROOT_DIR, chat

logger = logging.getLogger(__name__)


def build_local_uri_for_video(video_public_id):
    return f"{APP_ROOT_DIR}/videos/{video_public_id}.mp4"

def build_uri_for_huid(huid,folder):
    folder_uri = f"{APP_ROOT_DIR}/crops/{folder}/{huid}"
    os.makedirs(folder_uri, exist_ok=True)
    return folder_uri

def build_uri_for_crop(huid,id,folder):

    valid_folders = ["huid_crops","trash_crops"]

    if id is None or huid is None or folder is None or id == "" or huid == "" or folder == "":
        raise ValueError("huid and id and folder must be provided")

    if folder in valid_folders:
       huid_folder_uri = build_uri_for_huid(huid,folder)
       uri = f"{huid_folder_uri}/{huid}_{id}.jpg"
       return uri
    else:
        raise ValueError(f"folder must be any of the valid folders: {valid_folders}")
    
def store_crop_at_path(crop,uri):
    os.makedirs(Path(uri).parent.resolve(), exist_ok=True)
    cv2.imwrite(uri, crop)
    
def generate_unique_id() -> str:
    # using uuid will be better, ToDo -> will do it later
    return str(random.randint(1, 1000000000))
    
def select_most_diverse_subset(embeddings, k):
    """
    Finds the most diverse subset of k embeddings using the optimal determinant method. (DPP Method)

    This method is guaranteed to find the best possible combination for small sets.

    Args:
        embeddings (np.ndarray): A 2D array of shape (n_images, embedding_dim).
        k (int): The number of images to select in the subset.

    Returns:
        list: The indices of the images in the most diverse subset.

    """
    n_images = embeddings.shape[0]
    if k >= n_images:
        return list(range(n_images))
    
    # This ensures selection is based purely on angular diversity, not magnitude.
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)

    normalized_embeddings = embeddings / (norms + 1e-8)

    max_log_det = -np.inf
    best_subset_indices = []

    # Generate all possible combinations of k indices from the total number of images
    all_possible_indices = combinations(range(n_images), k)

    for indices in all_possible_indices:
        subset_embeddings = normalized_embeddings[list(indices)]
        
        # Calculate the Gram matrix (S * S^T)
        gram_matrix = np.dot(subset_embeddings, subset_embeddings.T)

        # Use the log-determinant for numerical stability. It's a reliable diversity score.
        _sign, log_determinant = np.linalg.slogdet(gram_matrix)

        if log_determinant > max_log_det:
            max_log_det = log_determinant
            best_subset_indices = list(indices)

    return best_subset_indices

def get_structured_output(response_text: str, prompt_type: str, sop_events = None):

    annotate_prompt = f"""
    Given the following text:
    {response_text}

    Understand and Convert it to a list of structured JSON object following the specific pattern like this:
    {{
        "start": MM:SS,
        "end": MM:SS,
        "action": str
    }}
    Action should not contain any person's name. Derive everything exactly from the input text that I'm providing.
    IMPORTANT: Respond with *only* the raw JSON object
    and no other text, markdown, or explanation.
    """

    alert_prompt = f"""
    Given the following text:
    {response_text}

    Understand and Convert it to a list of structured JSON object following the specific pattern like this:
    {{
        "start": MM:SS,
        "end": MM:SS,
        "alert_level": str - warning, high, critical,
        "description": str
    }}
    Derive everything exactly from the input text that I'm providing
    IMPORTANT: Respond with *only* the raw JSON object
    and no other text, markdown, or explanation.
    """

    sop_prompt = ""

    if sop_events is not None:
        sop_prompt = f"""
        Given the following text:
        {response_text}

        and the SOP Events:
        {sop_events}

        Understand and Convert it to a list of structured JSON object following the specific pattern like this:
        {{
            "start": MM:SS (should be exactly same as present in response string provided, if event never happened set it 00:00),
            "end": MM:SS (should be exactly same as present in response string provided, if event never happened set it 00:00)
            "sop_event": str (should exactly match from what is provided, and in the same order as SOP events given, no need of serial Number),
            "done": bool (False - if that sop event never happened True Otherwise)
        }}
        Derive everything exactly from the input text that I'm providing
        IMPORTANT: Respond with *only* the raw JSON object
        and no other text, markdown, or explanation.
        """
    try: 
        final_str = None
        if prompt_type == "annotate":
            response = chat.send_message(annotate_prompt)
            final_str = response.text

        elif prompt_type == "sop":
            response = chat.send_message(sop_prompt)
            final_str = response.text

        elif prompt_type == "alert":
            response = chat.send_message(alert_prompt)
            final_str = response.text
        else:
            logger.error("unknown prompt type provided")
            return ""

        # --- Key Changes Below ---

        # Clean the string, just in case the AI adds markdown backticks
        if final_str.startswith("```json"):
            final_str = final_str[7:-3].strip()

        logger.info(f"Structured Resp - {final_str}")

        json_object = json.loads(final_str)
        return json_object
    except json.decoder.JSONDecodeError as e:
        logger.error(f"JSON decoding failed due to error {e}")
    except Exception as e:
        logger.error(f"Call to LLM Failed due to error {e}")