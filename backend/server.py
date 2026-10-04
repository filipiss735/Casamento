from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import json
import re
from pathlib import Path
from pydantic import BaseModel, Field, field_validator
from pymongo.errors import DuplicateKeyError
from typing import List
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
load_dotenv(ROOT_DIR / '.env.local', override=True)

client = None
if os.environ.get('DB_DRIVER', 'mongo') == 'sqlite':
    from sqlite_store import SQLiteStore
    db = SQLiteStore(os.environ.get('SQLITE_PATH', str(ROOT_DIR / 'data' / 'casamento.sqlite3')))
else:
    client = AsyncIOMotorClient(os.environ['MONGO_URL'], serverSelectionTimeoutMS=5000)
    db = client[os.environ['DB_NAME']]

ADMIN_EMAIL = os.environ['ADMIN_EMAIL'].strip().lower()
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
JWT_SECRET = os.environ['JWT_SECRET']

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()


def utcnow():
    return datetime.now(timezone.utc).isoformat()


class LoginInput(BaseModel):
    email: str
    password: str


class ProductInput(BaseModel):
    title: str
    category: str = "Casa"
    description: str = ""
    price: str = ""
    image: str = ""
    link_ml: str = ""
    link_magalu: str = ""
    price_note: str = ""
    checked_at: str = ""
    tier: str = "standard"


class Product(ProductInput):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reserved: bool = False
    reserved_by: str = ""
    created_at: str = Field(default_factory=utcnow)


class PublicProduct(Product):
    reserved_by: str = Field(default="", exclude=True)


class ReserveInput(BaseModel):
    guest_name: str = Field(min_length=3, max_length=120)
    phone: str = Field(min_length=10, max_length=25)
    message: str = Field(default="", max_length=1000)

    @field_validator('guest_name')
    @classmethod
    def full_name(cls, value):
        value = ' '.join(value.split())
        if len(value.split()) < 2:
            raise ValueError('Informe seu nome completo')
        return value

    @field_validator('phone')
    @classmethod
    def phone_number(cls, value):
        digits = re.sub(r'\D', '', value)
        if len(digits) in (12, 13) and digits.startswith('55'):
            digits = digits[2:]
        if len(digits) not in (10, 11) or len(set(digits)) == 1:
            raise ValueError('Informe um telefone válido com DDD')
        return digits


class RSVPInput(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    attending: bool = True
    companions: int = Field(default=0, ge=0, le=10)
    message: str = Field(default="", max_length=1000)


class RSVP(RSVPInput):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=utcnow)


class SettingsInput(BaseModel):
    pix_key: str = ""
    pix_name: str = ""
    party_time: str = ""
    party_address: str = ""


def create_token(email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "role": "admin",
        "iat": now,
        "exp": now + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


async def require_admin(creds: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=["HS256"], options={"require": ["exp", "sub"]})
        if payload.get("role") != "admin" or payload.get("sub") != ADMIN_EMAIL:
            raise HTTPException(status_code=401, detail="Não autorizado")
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")


SEED_PRODUCTS = [
    {
        "title": "Jogo de Jantar Porcelana 20 Peças",
        "category": "Mesa Posta",
        "price": "R$ 480,00",
        "image": "https://images.unsplash.com/photo-1683048769158-6f109b096d0d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "link_ml": "https://www.mercadolivre.com.br",
        "link_magalu": "https://www.magazineluiza.com.br",
        "description": "Conjunto elegante de porcelana fina branca com acabamento acetinado para ocasiões especiais na nossa casa nova.",
    },
    {
        "title": "Cafeteira Espresso Italiana",
        "category": "Eletrodomésticos",
        "price": "R$ 650,00",
        "image": "https://images.unsplash.com/photo-1674504866626-fe4f19f68564?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "link_ml": "https://www.mercadolivre.com.br",
        "link_magalu": "https://www.magazineluiza.com.br",
        "description": "Para preparar aquele café especial das manhãs de domingo no nosso novo lar.",
    },
    {
        "title": "Jogo de Panelas Cerâmica Premium",
        "category": "Cozinha",
        "price": "R$ 520,00",
        "image": "https://images.unsplash.com/photo-1696986324692-f4aa0f2f495d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "link_ml": "https://www.mercadolivre.com.br",
        "link_magalu": "https://www.magazineluiza.com.br",
        "description": "Conjunto com revestimento cerâmico antiaderente livre de PFOA para receitas deliciosas.",
    },
    {
        "title": "Jogo de Cama 600 Fios Algodão Egípcio",
        "category": "Cama & Banho",
        "price": "R$ 390,00",
        "image": "https://images.unsplash.com/photo-1615803795424-a477dc508acf?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "link_ml": "https://www.mercadolivre.com.br",
        "link_magalu": "https://www.magazineluiza.com.br",
        "description": "Toque ultra suave de algodão egípcio para noites de descanso perfeitas na casa nova.",
    },
    {
        "title": "Fritadeira Air Fryer Inox Digital",
        "category": "Eletrodomésticos",
        "price": "R$ 420,00",
        "image": "https://images.unsplash.com/photo-1690731848955-a074a072610d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "link_ml": "https://www.mercadolivre.com.br",
        "link_magalu": "https://www.magazineluiza.com.br",
        "description": "Praticidade e rapidez para preparar nossas refeições do dia a dia.",
    },
    {
        "title": "Jogo de Taças de Cristal Lapidado 6 Peças",
        "category": "Mesa Posta",
        "price": "R$ 280,00",
        "image": "https://images.unsplash.com/photo-1630396079679-46c1cfd2be2c?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "link_ml": "https://www.mercadolivre.com.br",
        "link_magalu": "https://www.magazineluiza.com.br",
        "description": "Taças refinadas para brindar os novos momentos e receber os amigos.",
    },
]


@app.on_event("startup")
async def seed_database():
    if not await db.admins.find_one({"email": ADMIN_EMAIL}):
        await db.admins.insert_one({
            "email": ADMIN_EMAIL,
            "password_hash": bcrypt.hashpw(ADMIN_PASSWORD.encode(), bcrypt.gensalt()).decode(),
            "created_at": utcnow(),
        })
    catalog_path = ROOT_DIR / 'catalog.generated.json'
    if catalog_path.exists():
        for item in json.loads(catalog_path.read_text(encoding='utf-8')):
            product = Product(**item).model_dump()
            # Refresh file-managed catalog fields, never reset an existing reservation.
            initial = {key: product.pop(key) for key in ('reserved', 'reserved_by', 'created_at')}
            await db.products.update_one({'id': product['id']}, {'$set': product, '$setOnInsert': initial}, upsert=True)
    elif os.environ.get('SEED_DEMO_PRODUCTS') == 'true' and await db.products.count_documents({}) == 0:
        await db.products.insert_many([Product(**p).model_dump() for p in SEED_PRODUCTS])
    if not await db.settings.find_one({"key": "party"}):
        await db.settings.insert_one({
            "key": "party",
            "pix_key": "",
            "pix_name": "Filipi & Larissa",
            "party_time": "16h30",
            "party_address": "Av. Frei Cirilo, 4340 — Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        })


@api_router.get("/")
async def root():
    return {"message": "Chá de Casa Nova — Filipi & Larissa"}


@api_router.post("/auth/login")
async def login(data: LoginInput):
    admin = await db.admins.find_one({"email": data.email.strip().lower()}, {"_id": 0})
    if not admin or not bcrypt.checkpw(data.password.encode(), admin["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    return {"token": create_token(admin["email"]), "email": admin["email"]}


@api_router.get("/auth/me")
async def auth_me(email: str = Depends(require_admin)):
    return {"email": email}


@api_router.get("/products", response_model=List[PublicProduct])
async def list_products():
    return await db.products.find({}, {"_id": 0}).sort("created_at", 1).to_list(500)


@api_router.post("/products", response_model=Product)
async def create_product(data: ProductInput, _: str = Depends(require_admin)):
    product = Product(**data.model_dump())
    await db.products.insert_one(product.model_dump())
    return product


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, data: ProductInput, _: str = Depends(require_admin)):
    result = await db.products.update_one({"id": product_id}, {"$set": data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Presente não encontrado")
    return await db.products.find_one({"id": product_id}, {"_id": 0})


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, _: str = Depends(require_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Presente não encontrado")
    return {"ok": True}


@api_router.post("/products/{product_id}/reserve", response_model=PublicProduct)
async def reserve_product(product_id: str, data: ReserveInput):
    if not data.guest_name.strip():
        raise HTTPException(status_code=400, detail="Informe seu nome")
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Presente não encontrado")
    if product.get("reserved"):
        raise HTTPException(status_code=409, detail="Este presente já foi escolhido por outro convidado")
    try:
        result = await db.products.update_one(
            {"id": product_id, "reserved": False},
            {"$set": {"reserved": True, "reserved_by": data.guest_name,
                      "reserved_phone": data.phone, "reserved_message": data.message,
                      "reserved_at": utcnow()}},
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Não foi possível reservar este presente. Atualize a lista e tente novamente.")
    if result.matched_count == 0:
        raise HTTPException(status_code=409, detail="Este presente acabou de ser escolhido. Escolha outro item.")
    return await db.products.find_one({"id": product_id}, {"_id": 0})


@api_router.delete("/products/{product_id}/reserve", response_model=Product)
async def unreserve_product(product_id: str, _: str = Depends(require_admin)):
    await db.products.update_one({"id": product_id}, {"$set": {"reserved": False, "reserved_by": ""},
        "$unset": {"reserved_phone": "", "reserved_message": "", "reserved_at": ""}})
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Presente não encontrado")
    return product


@api_router.post("/rsvp", response_model=RSVP)
async def create_rsvp(data: RSVPInput):
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Informe seu nome")
    rsvp = RSVP(**{**data.model_dump(), 'name': data.name.strip(), 'companions': data.companions if data.attending else 0})
    await db.rsvps.insert_one(rsvp.model_dump())
    return rsvp


@api_router.get("/rsvp", response_model=List[RSVP])
async def list_rsvps(_: str = Depends(require_admin)):
    return await db.rsvps.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.get('/reservations')
async def list_reservations(_: str = Depends(require_admin)):
    products = await db.products.find({'reserved': True}, {'_id': 0}).to_list(1000)
    return [{'product_id': p['id'], 'title': p['title'], 'name': p.get('reserved_by', ''),
             'phone': p.get('reserved_phone', ''), 'message': p.get('reserved_message', '')} for p in products]


@api_router.delete("/rsvp/{rsvp_id}")
async def delete_rsvp(rsvp_id: str, _: str = Depends(require_admin)):
    await db.rsvps.delete_one({"id": rsvp_id})
    return {"ok": True}


@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"key": "party"}, {"_id": 0})
    if not settings:
        return {"pix_key": "", "pix_name": "", "party_time": "", "party_address": ""}
    settings.pop("key", None)
    return settings


@api_router.put("/settings")
async def update_settings(data: SettingsInput, _: str = Depends(require_admin)):
    await db.settings.update_one({"key": "party"}, {"$set": data.model_dump()}, upsert=True)
    return await get_settings()


app.include_router(api_router)

cors_origins = [origin.strip() for origin in os.environ.get('CORS_ORIGINS', '*').split(',') if origin.strip()]
allow_all_origins = '*' in cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_credentials=not allow_all_origins,
    allow_origins=['*'] if allow_all_origins else cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    if client is not None:
        client.close()
