from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from typing import Dict, Any, List, Optional
from datetime import datetime
import os
from bson import ObjectId

class DatabaseService:
    def __init__(self):
        # MongoDB connection settings for local installation
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.database_name = os.getenv("MONGO_DB", "config_generator")
        self.client: MongoClient = None
        self.db: Database = None
        
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.database_name]
            # Test the connection
            self.client.admin.command('ping')
            print("Successfully connected to MongoDB")
            
            # Initialize database with default templates if they don't exist
            await self.initialize_default_templates()
            
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            print("Please ensure MongoDB is installed and running locally")
            print("Installation guide: https://docs.mongodb.com/manual/installation/")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
    
    async def initialize_default_templates(self):
        """Initialize default templates if they don't exist"""
        collection = self.get_templates_collection()
        
        # Check if templates already exist
        if collection.count_documents({}) > 0:
            return
        
        # Insert default templates
        default_templates = [
            {
                "environment": "UAT",
                "template_type": "application",
                "template_content": """# UAT Application Configuration
[Application]
name = {{ application_name }}
version = {{ version }}
debug = {{ debug_mode }}

[Database]
host = {{ db_host }}
port = {{ db_port }}
database = {{ db_name }}
username = {{ db_username }}

[Logging]
level = {{ log_level }}
file_path = {{ log_file_path }}

[Features]
feature_flag_1 = {{ feature_flag_1 }}
feature_flag_2 = {{ feature_flag_2 }}"""
            },
            {
                "environment": "PROD",
                "template_type": "application", 
                "template_content": """# Production Application Configuration
[Application]
name = {{ application_name }}
version = {{ version }}
debug = false

[Database]
host = {{ db_host }}
port = {{ db_port }}
database = {{ db_name }}
username = {{ db_username }}

[Logging]
level = {{ log_level }}
file_path = {{ log_file_path }}

[Security]
ssl_enabled = true
encryption_level = high

[Features]
feature_flag_1 = {{ feature_flag_1 }}
feature_flag_2 = {{ feature_flag_2 }}"""
            },
            {
                "environment": "COB",
                "template_type": "application",
                "template_content": """# Close of Business Configuration
[Application]
name = {{ application_name }}
version = {{ version }}
debug = {{ debug_mode }}

[Database]
host = {{ db_host }}
port = {{ db_port }}
database = {{ db_name }}
username = {{ db_username }}

[Logging]
level = {{ log_level }}
file_path = {{ log_file_path }}

[COB_Settings]
batch_processing = true
backup_enabled = {{ backup_enabled }}
cleanup_old_data = {{ cleanup_old_data }}

[Features]
feature_flag_1 = {{ feature_flag_1 }}
feature_flag_2 = {{ feature_flag_2 }}"""
            }
        ]
        
        collection.insert_many(default_templates)
        print("Default templates initialized")
    
    def get_configurations_collection(self) -> Collection:
        """Get configurations collection"""
        return self.db.configurations
    
    def get_templates_collection(self) -> Collection:
        """Get templates collection"""
        return self.db.templates
    
    async def save_configuration(self, config_data: Dict[str, Any]) -> str:
        """Save configuration to database"""
        collection = self.get_configurations_collection()
        config_data["created_at"] = datetime.utcnow()
        config_data["updated_at"] = datetime.utcnow()
        
        result = collection.insert_one(config_data)
        return str(result.inserted_id)
    
    async def get_configuration_by_id(self, config_id: str) -> Optional[Dict[str, Any]]:
        """Get configuration by ID"""
        collection = self.get_configurations_collection()
        try:
            return collection.find_one({"_id": ObjectId(config_id)})
        except:
            return None
    
    async def get_configurations_by_environment(self, environment: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get configurations by environment"""
        collection = self.get_configurations_collection()
        cursor = collection.find(
            {"environment": environment},
            sort=[("created_at", -1)]
        ).limit(limit)
        return list(cursor)
    
    async def get_all_configurations(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all configurations"""
        collection = self.get_configurations_collection()
        cursor = collection.find(
            {},
            sort=[("created_at", -1)]
        ).limit(limit)
        return list(cursor)
    
    async def get_template(self, environment: str, template_type: str = "application") -> Optional[Dict[str, Any]]:
        """Get template by environment and type"""
        collection = self.get_templates_collection()
        return collection.find_one({
            "environment": environment,
            "template_type": template_type
        })
    
    async def get_all_templates(self) -> List[Dict[str, Any]]:
        """Get all templates"""
        collection = self.get_templates_collection()
        cursor = collection.find({})
        return list(cursor)
    
    async def save_template(self, template_data: Dict[str, Any]) -> str:
        """Save template to database"""
        collection = self.get_templates_collection()
        
        # Check if template already exists
        existing = collection.find_one({
            "environment": template_data["environment"],
            "template_type": template_data["template_type"]
        })
        
        if existing:
            # Update existing template
            result = collection.update_one(
                {"_id": existing["_id"]},
                {"$set": template_data}
            )
            return str(existing["_id"])
        else:
            # Insert new template
            result = collection.insert_one(template_data)
            return str(result.inserted_id)
    
    async def delete_configuration(self, config_id: str) -> bool:
        """Delete configuration by ID"""
        collection = self.get_configurations_collection()
        try:
            result = collection.delete_one({"_id": ObjectId(config_id)})
            return result.deleted_count > 0
        except:
            return False

# Global database service instance
db_service = DatabaseService() 