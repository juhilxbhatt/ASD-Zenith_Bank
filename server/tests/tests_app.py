import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_transactions(client):
    response = client.get('/api/user/123/transactions?month=September')
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_post_transaction(client):
    new_transaction = {
        "type": "deposit",
        "amount": 100,
        "date": "2024-09-01",
        "category": "Income",
        "recipient": "Self"
    }
    response = client.post('/api/user/123/transaction', json=new_transaction)
    assert response.status_code == 201
    assert response.json['message'] == "Transaction added successfully"
