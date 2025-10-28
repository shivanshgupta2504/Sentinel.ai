import logging
import os
import sqlite3

import chromadb

logger = logging.getLogger(__name__)

def setup_sqllite_database():
    """
    Creates all the necessary Tables if they don't exist, it will be useful when the app is being run first time
    """

    try:

        conn = sqlite3.connect("app.db")
        cursor = conn.cursor()
            
        sql_create_videos_table = """
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            public_id TEXT NOT NULL UNIQUE,
            url TEXT NOT NULL UNIQUE,
            env_id INT NOT NULL DEFAULT 1,
            alerts TEXT DEFAULT NULL
        );
        """

        sql_create_images_table = """
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            public_id TEXT NOT NULL UNIQUE,
            url TEXT NOT NULL UNIQUE
        );
        """

        sql_create_people_table = """
        CREATE TABLE IF NOT EXISTS people (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            huid TEXT NOT NULL,
            video_public_id TEXT NOT NULL,
            annotation TEXT DEFAULT NULL,
            sop TEXT DEFAULT NULL,

            FOREIGN KEY (video_public_id) REFERENCES videos (public_id)
        );
        """

        # For now one env will only map to one sop, technically can have many

        sql_sop_defs_table = """
        CREATE TABLE IF NOT EXISTS sopdefs (
            sop_id INTEGER PRIMARY KEY AUTOINCREMENT,
            sop_checks TEXT NOT NULL,
            env_id INTEGER NOT NULL UNIQUE,

            FOREIGN KEY (env_id) REFERENCES videos (env_id)
        )
        """

        jew_sop_checks = """
        1) Customer arrives at the billing counter with items. Employee greets the customer and prepares to process the transaction.

        2) Employee scans each item's barcode. System displays item details and price. All items are verified and added to the transaction.

        3) System calculates total amount including taxes and discounts. Final bill is displayed on screen and presented to customer.

        4) Customer pays via cash, card, or digital payment. Employee processes payment and verifies transaction completion.

        5) Receipt is printed and handed to customer. Employee carefully hands over all purchased items to customer.

        6) Customer collects items and receipt, thanks the employee, and exits the billing area. 
        """

        sql_insert_env_1 = """
        INSERT OR IGNORE INTO sopdefs (sop_checks,env_id)
        VALUES (?,1)
        """

        cursor.execute(sql_create_videos_table)
        cursor.execute(sql_create_images_table)
        cursor.execute(sql_create_people_table)
        cursor.execute(sql_sop_defs_table)
        cursor.execute(sql_insert_env_1,(jew_sop_checks,))
        conn.commit()
        logger.info("Database tables checked/created successfully.")
        
    except sqlite3.Error as e:
        logger.error(f"An error occurred setting up the database: {e}")
        
    finally:
        if conn:
            conn.close()

def setup_vector_db():

    try:
        chroma_client = chromadb.Client()
        collection_name = "huid_collection"
        chroma_client.get_or_create_collection(name=collection_name, 
            configuration={ 
                "hnsw:space": "cosine",
            }
        )

        logger.info(f"Collection '{collection_name}' is ready.")

    except Exception as e:
        logger.error(f"Failed to setup vector db due to error {e}")


def get_sqllite_db_connection():
    conn = None
    try:
        conn = sqlite3.connect(f"app.db")
        conn.row_factory = sqlite3.Row
        yield conn
    finally:
        if conn:
            conn.close()

def get_huid_collection():
    chroma_client = chromadb.PersistentClient(path="chromadb_data")

    collection_name = "huid_collection"

    return chroma_client.get_or_create_collection(name=collection_name, 
            configuration={
                "hnsw:space": "cosine",
            }
        )