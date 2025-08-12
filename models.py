from app import db
from datetime import datetime, date
from sqlalchemy import func

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with bills
    bills = db.relationship('Bill', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'

class Bill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Float)
    is_paid = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key to user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    @property
    def days_until_due(self):
        """Calculate days until due date"""
        today = date.today()
        delta = self.due_date - today
        return delta.days
    
    @property
    def is_overdue(self):
        """Check if bill is overdue"""
        return self.due_date < date.today() and not self.is_paid
    
    @property
    def status_class(self):
        """Get CSS class for bill status"""
        if self.is_paid:
            return 'success'
        elif self.is_overdue:
            return 'danger'
        elif self.days_until_due <= 3:
            return 'warning'
        else:
            return 'primary'
    
    @property
    def status_text(self):
        """Get human-readable status text"""
        if self.is_paid:
            return 'Paid'
        elif self.is_overdue:
            return f'Overdue by {abs(self.days_until_due)} days'
        elif self.days_until_due == 0:
            return 'Due today'
        elif self.days_until_due <= 3:
            return f'Due in {self.days_until_due} days'
        else:
            return f'Due in {self.days_until_due} days'
    
    def __repr__(self):
        return f'<Bill {self.name}>'
