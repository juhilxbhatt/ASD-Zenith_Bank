from mongoengine import Document, StringField, IntField, FloatField, DateTimeField, ReferenceField, EmbeddedDocumentField, EmbeddedDocument, ListField
import datetime


# User Model
class User(Document):
    name = StringField(required=True, max_length=100)
    password = StringField(required=True, min_length=6)
    email = StringField(required=True, unique=True)
    address = StringField()

    def to_json(self):
        return {
            "name": self.name,
            "email": self.email,
            "address": self.address
        }


# Account Model
class Account(Document):
    user = ReferenceField(User, required=True)
    transaction_id = StringField()
    account_type = StringField(choices=["savings", "checking"])
    balance = FloatField(required=True)
    status = StringField(choices=["active", "inactive", "closed"], default="active")

    def to_json(self):
        return {
            "user": self.user.name,
            "transaction_id": self.transaction_id,
            "account_type": self.account_type,
            "balance": self.balance,
            "status": self.status
        }


# Payee Account Model
class PayeeAccount(Document):
    user = ReferenceField(User, required=True)
    bank_details = StringField(required=True)

    def to_json(self):
        return {
            "user": self.user.name,
            "bank_details": self.bank_details
        }


# Withdrawal Model
class Withdrawal(Document):
    account = ReferenceField(Account, required=True)
    category_id = StringField()
    date = DateTimeField(default=datetime.datetime.utcnow)
    amount = FloatField(required=True)
    description = StringField()

    def to_json(self):
        return {
            "account": self.account.id,
            "category_id": self.category_id,
            "date": self.date.strftime('%Y-%m-%d %H:%M:%S'),
            "amount": self.amount,
            "description": self.description
        }


# Deposit Model
class Deposit(Document):
    account = ReferenceField(Account, required=True)
    category_id = StringField()
    date = DateTimeField(default=datetime.datetime.utcnow)
    amount = FloatField(required=True)
    description = StringField()

    def to_json(self):
        return {
            "account": self.account.id,
            "category_id": self.category_id,
            "date": self.date.strftime('%Y-%m-%d %H:%M:%S'),
            "amount": self.amount,
            "description": self.description
        }


# Transfer Model
class Transfer(Document):
    account = ReferenceField(Account, required=True)
    category_id = StringField()
    date = DateTimeField(default=datetime.datetime.utcnow)
    amount = FloatField(required=True)
    description = StringField()

    def to_json(self):
        return {
            "account": self.account.id,
            "category_id": self.category_id,
            "date": self.date.strftime('%Y-%m-%d %H:%M:%S'),
            "amount": self.amount,
            "description": self.description
        }


# Categories Model
class Category(Document):
    category = StringField(required=True, unique=True)

    def to_json(self):
        return {
            "category": self.category
        }


# Transaction Log Model
class TransactionLog(Document):
    account = ReferenceField(Account, required=True)
    user = ReferenceField(User, required=True)
    category_id = StringField()
    date = DateTimeField(default=datetime.datetime.utcnow)
    amount = FloatField(required=True)
    description = StringField()

    def to_json(self):
        return {
            "account": self.account.id,
            "user": self.user.name,
            "category_id": self.category_id,
            "date": self.date.strftime('%Y-%m-%d %H:%M:%S'),
            "amount": self.amount,
            "description": self.description
        }


# Bank Statement Model
class BankStatement(Document):
    account = ReferenceField(Account, required=True)
    user = ReferenceField(User, required=True)
    transaction_id = StringField()
    date = DateTimeField(default=datetime.datetime.utcnow)
    description = StringField()

    def to_json(self):
        return {
            "account": self.account.id,
            "user": self.user.name,
            "transaction_id": self.transaction_id,
            "date": self.date.strftime('%Y-%m-%d %H:%M:%S'),
            "description": self.description
        }