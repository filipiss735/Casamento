"""Small persistent local store implementing the collection operations used by server.py.

One JSON document per row keeps the existing MongoDB API contract. Conditional
updates run inside BEGIN IMMEDIATE; indexes enforce uniqueness across processes.
"""
import json
import sqlite3
from pathlib import Path
from types import SimpleNamespace
from contextlib import contextmanager
from pymongo.errors import DuplicateKeyError


class SQLiteStore:
    def __init__(self, path):
        self.path = str(path)
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as conn:
            conn.executescript('''
                CREATE TABLE IF NOT EXISTS documents (
                    row_id INTEGER PRIMARY KEY, collection TEXT NOT NULL, body TEXT NOT NULL);
                CREATE UNIQUE INDEX IF NOT EXISTS document_id ON documents(collection, json_extract(body, '$.id'));
                CREATE UNIQUE INDEX IF NOT EXISTS admin_email ON documents(json_extract(body, '$.email')) WHERE collection = 'admins';
                CREATE UNIQUE INDEX IF NOT EXISTS settings_key ON documents(json_extract(body, '$.key')) WHERE collection = 'settings';
            ''')

    @contextmanager
    def connect(self):
        conn = sqlite3.connect(self.path, timeout=15)
        try:
            with conn:
                yield conn
        finally:
            conn.close()

    def __getattr__(self, name):
        return Collection(self, name)


class Cursor:
    def __init__(self, rows):
        self.rows = rows

    def sort(self, key, direction):
        self.rows.sort(key=lambda row: row.get(key, ''), reverse=direction == -1)
        return self

    async def to_list(self, limit):
        return self.rows[:limit]


class Collection:
    def __init__(self, store, name):
        self.store, self.name = store, name

    def rows(self, conn, query):
        result = []
        for row_id, raw in conn.execute('SELECT row_id, body FROM documents WHERE collection = ?', (self.name,)):
            data = json.loads(raw)
            if all(data.get(key) == value for key, value in query.items()):
                result.append((row_id, data))
        return result

    async def find_one(self, query, projection=None):
        with self.store.connect() as conn:
            rows = self.rows(conn, query)
        return rows[0][1] if rows else None

    def find(self, query, projection=None):
        with self.store.connect() as conn:
            return Cursor([data for _, data in self.rows(conn, query)])

    async def count_documents(self, query):
        return len((await self.find(query).to_list(100000)))

    async def insert_one(self, data):
        try:
            with self.store.connect() as conn:
                conn.execute('INSERT INTO documents(collection, body) VALUES (?, ?)', (self.name, json.dumps(data)))
        except sqlite3.IntegrityError as exc:
            raise DuplicateKeyError(str(exc)) from exc

    async def insert_many(self, items):
        for item in items:
            await self.insert_one(item)

    async def update_one(self, query, update, upsert=False):
        try:
            with self.store.connect() as conn:
                conn.execute('BEGIN IMMEDIATE')
                rows = self.rows(conn, query)
                if rows:
                    row_id, data = rows[0]
                    data.update(update.get('$set', {}))
                    for key in update.get('$unset', {}):
                        data.pop(key, None)
                    conn.execute('UPDATE documents SET body = ? WHERE row_id = ?', (json.dumps(data), row_id))
                elif upsert:
                    data = {**query, **update.get('$setOnInsert', {}), **update.get('$set', {})}
                    conn.execute('INSERT INTO documents(collection, body) VALUES (?, ?)', (self.name, json.dumps(data)))
                return SimpleNamespace(matched_count=len(rows))
        except sqlite3.IntegrityError as exc:
            raise DuplicateKeyError(str(exc)) from exc

    async def delete_one(self, query):
        with self.store.connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            rows = self.rows(conn, query)
            if rows:
                conn.execute('DELETE FROM documents WHERE row_id = ?', (rows[0][0],))
        return SimpleNamespace(deleted_count=min(len(rows), 1))

    async def create_index(self, *args, **kwargs):
        # Equivalent unique indexes are created centrally in SQLiteStore.
        return None
