import os
import tempfile
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Tests never touch the couple's database.
_sandbox = tempfile.TemporaryDirectory()
os.environ['SQLITE_PATH'] = os.path.join(_sandbox.name, 'test.sqlite3')
os.environ['DB_DRIVER'] = 'sqlite'

from fastapi.testclient import TestClient
import server
from sqlite_store import SQLiteStore


def test_reservation_and_rsvp_contract():
    with TestClient(server.app) as client:
        auth = {'Authorization': 'Bearer ' + server.create_token(server.ADMIN_EMAIL)}
        first = client.post('/api/products', headers=auth, json={'title': 'Teste A'}).json()
        second = client.post('/api/products', headers=auth, json={'title': 'Teste B'}).json()
        guest = {'guest_name': 'Convidado Teste', 'phone': '(85) 99999-0001', 'message': 'Recado privado'}
        path = f"/api/products/{first['id']}/reserve"
        assert client.post(path, json={**guest, 'guest_name': 'Um'}).status_code == 422
        assert client.post(path, json={**guest, 'phone': '123'}).status_code == 422
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(lambda _: client.post(path, json=guest).status_code, range(2)))
        assert sorted(results) == [200, 409]
        # The same phone CAN reserve a different gift.
        assert client.post(f"/api/products/{second['id']}/reserve", json=guest).status_code == 200
        public = client.get('/api/products').json()
        assert all('reserved_phone' not in p and 'reserved_message' not in p and 'reserved_by' not in p for p in public)
        assert client.get('/api/reservations').status_code == 403
        assert client.get('/api/rsvp').status_code == 403
        private = client.get('/api/reservations', headers=auth).json()
        assert any(r['phone'] == '85999990001' and r['message'] == 'Recado privado' for r in private)
        rsvp = client.post('/api/rsvp', json={'name': 'Teste Presença', 'attending': True, 'companions': 2})
        assert rsvp.status_code == 200
        assert client.post('/api/rsvp', json={'name': 'Teste', 'companions': -1}).status_code == 422
        reopened = SQLiteStore(os.environ['SQLITE_PATH'])
        assert asyncio.run(reopened.rsvps.find_one({'id': rsvp.json()['id']}))['companions'] == 2
        assert asyncio.run(reopened.products.find_one({'id': first['id']}))['reserved'] is True
        assert client.delete(path).status_code == 403
        assert client.delete(path, headers=auth).status_code == 200
        assert client.post(path, json=guest).status_code == 200


def test_reservation_only_and_admin_permissions():
    with TestClient(server.app) as client:
        auth = {'Authorization': 'Bearer ' + server.create_token(server.ADMIN_EMAIL)}
        item = {'title': 'Presente sem loja', 'tier': 'premium', 'image': '/imagens/sofa.jpeg'}
        assert client.post('/api/products', json=item).status_code == 403
        product = client.post('/api/products', headers=auth, json=item).json()
        path = f"/api/products/{product['id']}"
        assert client.put(path, json=item).status_code == 403
        assert client.delete(path).status_code == 403
        assert client.put('/api/settings', json={}).status_code == 403
        response = client.post(path + '/reserve', json={'guest_name': 'Teste Sem Loja', 'phone': '85999990004'})
        assert response.status_code == 200
        assert response.json()['reserved'] is True
        assert 'reserved_by' not in response.json()
        forged = {'Authorization': 'Bearer ' + server.create_token('outro@example.com')}
        assert client.get('/api/reservations', headers=forged).status_code == 401


def test_catalog_restart_preserves_reservations():
    with TestClient(server.app) as client:
        products = client.get('/api/products').json()
        catalog_product = next(p for p in products if p['title'] not in ('Teste A', 'Teste B'))
        path = f"/api/products/{catalog_product['id']}/reserve"
        assert client.post(path, json={'guest_name': 'Teste Persistência', 'phone': '85999990002'}).status_code == 200
        asyncio.run(server.seed_database())
        persisted = next(p for p in client.get('/api/products').json() if p['id'] == catalog_product['id'])
        assert persisted['reserved'] is True


def test_pix_capacity_multiple_choices_and_configuration():
    with TestClient(server.app) as client:
        auth = {'Authorization': 'Bearer ' + server.create_token(server.ADMIN_EMAIL)}
        quotas = [p for p in client.get('/api/products').json() if p['tier'] == 'pix']
        assert len(quotas) == 30
        for amount in (50, 100, 200):
            assert len([p for p in quotas if p['id'].startswith(f'pix-{amount}-')]) == 10
        guest = {'guest_name': 'Teste Cotas Pix', 'phone': '85999990005'}
        initial_settings = client.get('/api/settings').json()
        client.put('/api/settings', headers=auth, json={**initial_settings, 'pix_key': ''})
        first_path = '/api/products/pix-50-01/reserve'
        assert client.post(first_path, json=guest).status_code == 503
        client.put('/api/settings', headers=auth, json=initial_settings)
        with ThreadPoolExecutor(max_workers=2) as pool:
            attempts = list(pool.map(lambda _: client.post(first_path, json=guest).status_code, range(2)))
        assert sorted(attempts) == [200, 409]
        for index in range(2, 11):
            assert client.post(f'/api/products/pix-50-{index:02}/reserve', json=guest).status_code == 200
        assert client.post(first_path, json=guest).status_code == 409
        assert client.post('/api/products/pix-100-01/reserve', json=guest).status_code == 200
        assert client.post('/api/products/pix-200-01/reserve', json=guest).status_code == 200
        asyncio.run(server.seed_database())
        remaining = client.get('/api/products').json()
        for amount, expected in ((50, 0), (100, 9), (200, 9)):
            assert len([p for p in remaining if p['id'].startswith(f'pix-{amount}-') and not p['reserved']]) == expected
