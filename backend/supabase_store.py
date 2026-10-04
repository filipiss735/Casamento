"""Small async Mongo-like adapter over the Supabase REST API."""
import json
from types import SimpleNamespace
from urllib.parse import quote
import httpx


class SupabaseStore:
    def __init__(self, url, key):
        self.base = url.rstrip('/') + '/rest/v1'
        self.headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}

    def __getattr__(self, name):
        return SupabaseCollection(self, name)


class SupabaseCursor:
    def __init__(self, collection, query):
        self.collection, self.query, self.order = collection, query, None

    def sort(self, key, direction):
        self.order = f'{key}.{"desc" if direction == -1 else "asc"}'
        return self

    async def to_list(self, limit):
        params = [('select', '*'), ('limit', str(limit))]
        for key, value in self.query.items():
            params.append((key, f'eq.{value}'))
        if self.order:
            params.append(('order', self.order))
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(f'{self.collection.store.base}/{self.collection.name}', headers=self.collection.store.headers, params=params)
        response.raise_for_status()
        return response.json()


class SupabaseCollection:
    def __init__(self, store, name):
        self.store, self.name = store, name

    def find(self, query, projection=None):
        return SupabaseCursor(self, query)

    async def find_one(self, query, projection=None):
        rows = await SupabaseCursor(self, query).to_list(1)
        return rows[0] if rows else None

    async def count_documents(self, query):
        return len(await SupabaseCursor(self, query).to_list(10000))

    async def insert_one(self, data):
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(f'{self.store.base}/{self.name}', headers={**self.store.headers, 'Prefer': 'return=minimal'}, json=data)
        response.raise_for_status()

    async def insert_many(self, items):
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(f'{self.store.base}/{self.name}', headers={**self.store.headers, 'Prefer': 'return=minimal'}, json=items)
        response.raise_for_status()

    async def update_one(self, query, update, upsert=False):
        payload = {**update.get('$set', {})}
        params = {key: f'eq.{value}' for key, value in query.items()}
        headers = {**self.store.headers, 'Prefer': 'return=representation'}
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.patch(f'{self.store.base}/{self.name}', headers=headers, params=params, json=payload)
        response.raise_for_status()
        if response.json():
            return SimpleNamespace(matched_count=len(response.json()))
        matched = await self.find_one(query)
        if matched:
            return SimpleNamespace(matched_count=1)
        if upsert:
            data = {**query, **update.get('$setOnInsert', {}), **payload}
            await self.insert_one(data)
            return SimpleNamespace(matched_count=0)
        return SimpleNamespace(matched_count=0)

    async def delete_one(self, query):
        params = {key: f'eq.{value}' for key, value in query.items()}
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.delete(f'{self.store.base}/{self.name}', headers={**self.store.headers, 'Prefer': 'return=representation'}, params=params)
        response.raise_for_status()
        return SimpleNamespace(deleted_count=len(response.json()))
