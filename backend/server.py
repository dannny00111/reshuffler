import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection with better error handling and development fallback
DEV_MODE = False
client: Optional[Any] = None
db: Optional[Any] = None

try:
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]
    print(f"🔗 Attempting to connect to MongoDB: {mongo_url}")
    print(f"📁 Using database: {db_name}")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    print("✅ MongoDB client initialized")

except KeyError as e:
    print(f"❌ Missing environment variable: {e}")
    print("💡 Enabling development mode - API will work without database")
    print("📄 For production: set MONGO_URL and DB_NAME in .env file")
    print("📖 See DEPLOYMENT_GUIDE.md for setup instructions")
    DEV_MODE = True
except Exception as e:
    print(f"⚠️  MongoDB connection error, enabling development mode: {e}")
    print("💡 API will work without database for testing")
    DEV_MODE = True

# In-memory storage for development mode
dev_storage: Dict[str, List[Dict[str, Any]]] = {"status_checks": []}

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StatusCheckCreate(BaseModel):
    client_name: str


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)

    if DEV_MODE:
        # Store in memory for development
        dev_storage["status_checks"].append(status_obj.dict())
        print(f"📝 [DEV MODE] Created status check: {status_obj.dict()}")
    else:
        # Store in MongoDB for production
        if db is not None:
            try:
                _ = await db.status_checks.insert_one(status_obj.dict())
                print(f"📝 [MONGO] Created status check: {status_obj.dict()}")
            except Exception as e:
                print(f"❌ MongoDB insert failed: {e}")
                # Fallback to dev storage
                dev_storage["status_checks"].append(status_obj.dict())
                print(f"📝 [FALLBACK] Created: {status_obj.dict()}")
        else:
            # Fallback to dev storage if db is None
            dev_storage["status_checks"].append(status_obj.dict())
            print(f"📝 [FALLBACK] Created: {status_obj.dict()}")

    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    if DEV_MODE:
        # Return from memory for development
        status_checks = dev_storage["status_checks"]
        print(f"📖 [DEV MODE] Retrieved {len(status_checks)} status checks")
    else:
        # Return from MongoDB for production
        if db is not None:
            try:
                status_checks = await db.status_checks.find().to_list(1000)
                print(f"📖 [MONGO] Retrieved {len(status_checks)} checks")
            except Exception as e:
                print(f"❌ MongoDB query failed: {e}")
                # Fallback to dev storage
                status_checks = dev_storage["status_checks"]
                print(f"📖 [FALLBACK] Retrieved {len(status_checks)} checks")
        else:
            # Fallback to dev storage if db is None
            status_checks = dev_storage["status_checks"]
            print(f"📖 [FALLBACK] Retrieved {len(status_checks)} checks")

    return [StatusCheck(**status_check) for status_check in status_checks]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


# Add startup event to test MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    if not DEV_MODE and client:
        try:
            # Test the connection
            await client.admin.command("ping")
            print("✅ MongoDB connection verified")
        except Exception as e:
            print(f"⚠️  MongoDB ping failed: {e}")


# For development: run with uvicorn when script is executed directly
if __name__ == "__main__":
    import uvicorn

    print("🚀 Starting AyoRecuts Backend Server...")
    if DEV_MODE:
        print("🛠️  Running in DEVELOPMENT MODE")
        print("📝 Data will be stored in memory only")
    else:
        print("🏭 Running in PRODUCTION MODE")
        print("📝 Data will be stored in MongoDB")

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
