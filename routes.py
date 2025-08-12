from flask import render_template, request, redirect, url_for, flash, session
from app import app, db
from models import User, Bill
from datetime import datetime, date, timedelta
import logging

@app.route('/')
def index():
    """Main dashboard showing all bills"""
    user_id = session.get('user_id')
    
    if not user_id:
        return redirect(url_for('setup_user'))
    
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return redirect(url_for('setup_user'))
    
    # Get all bills for the user, ordered by due date
    bills = Bill.query.filter_by(user_id=user_id).order_by(Bill.due_date.asc()).all()
    
    # Separate bills by status
    pending_bills = [bill for bill in bills if not bill.is_paid]
    paid_bills = [bill for bill in bills if bill.is_paid]
    
    # Check for bills that need reminders (due in 3 days or less)
    reminder_bills = [bill for bill in pending_bills if bill.days_until_due <= 3 and bill.days_until_due >= 0]
    
    return render_template('index.html', 
                         user=user, 
                         pending_bills=pending_bills,
                         paid_bills=paid_bills,
                         reminder_bills=reminder_bills)

@app.route('/setup', methods=['GET', 'POST'])
def setup_user():
    """Setup user contact information"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        phone_number = request.form.get('phone_number', '').strip()
        
        if not email or not phone_number:
            flash('Please provide both email and phone number.', 'error')
            return render_template('index.html', show_setup=True)
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        
        if existing_user:
            session['user_id'] = existing_user.id
            # Update phone number if different
            if existing_user.phone_number != phone_number:
                existing_user.phone_number = phone_number
                db.session.commit()
            flash(f'Welcome back, {email}!', 'success')
        else:
            # Create new user
            user = User(email=email, phone_number=phone_number)
            db.session.add(user)
            db.session.commit()
            session['user_id'] = user.id
            flash(f'Welcome, {email}! You can now start adding bills.', 'success')
        
        return redirect(url_for('index'))
    
    return render_template('index.html', show_setup=True)

@app.route('/add_bill', methods=['GET', 'POST'])
def add_bill():
    """Add a new bill"""
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('setup_user'))
    
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        description = request.form.get('description', '').strip()
        due_date_str = request.form.get('due_date', '').strip()
        amount_str = request.form.get('amount', '').strip()
        
        # Validation
        errors = []
        if not name:
            errors.append('Bill name is required.')
        
        if not due_date_str:
            errors.append('Due date is required.')
        else:
            try:
                due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
                if due_date < date.today():
                    errors.append('Due date cannot be in the past.')
            except ValueError:
                errors.append('Invalid due date format.')
                due_date = None
        
        amount = None
        if amount_str:
            try:
                amount = float(amount_str)
                if amount < 0:
                    errors.append('Amount cannot be negative.')
            except ValueError:
                errors.append('Invalid amount format.')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('add_bill.html', 
                                 name=name, 
                                 description=description,
                                 due_date=due_date_str,
                                 amount=amount_str)
        
        # Create new bill
        bill = Bill(
            name=name,
            description=description,
            due_date=due_date,
            amount=amount,
            user_id=user_id
        )
        
        db.session.add(bill)
        db.session.commit()
        
        flash(f'Bill "{name}" added successfully!', 'success')
        
        # Mock reminder setup message
        user = User.query.get(user_id)
        flash(f'Reminder notifications will be sent to {user.email} and {user.phone_number} starting 3 days before the due date.', 'info')
        
        return redirect(url_for('index'))
    
    return render_template('add_bill.html')

@app.route('/edit_bill/<int:bill_id>', methods=['GET', 'POST'])
def edit_bill(bill_id):
    """Edit an existing bill"""
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('setup_user'))
    
    bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
    if not bill:
        flash('Bill not found.', 'error')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        description = request.form.get('description', '').strip()
        due_date_str = request.form.get('due_date', '').strip()
        amount_str = request.form.get('amount', '').strip()
        
        # Validation
        errors = []
        if not name:
            errors.append('Bill name is required.')
        
        if not due_date_str:
            errors.append('Due date is required.')
        else:
            try:
                due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
            except ValueError:
                errors.append('Invalid due date format.')
                due_date = None
        
        amount = None
        if amount_str:
            try:
                amount = float(amount_str)
                if amount < 0:
                    errors.append('Amount cannot be negative.')
            except ValueError:
                errors.append('Invalid amount format.')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('edit_bill.html', bill=bill)
        
        # Update bill
        bill.name = name
        bill.description = description
        bill.due_date = due_date
        bill.amount = amount
        bill.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        flash(f'Bill "{name}" updated successfully!', 'success')
        return redirect(url_for('index'))
    
    return render_template('edit_bill.html', bill=bill)

@app.route('/mark_paid/<int:bill_id>')
def mark_paid(bill_id):
    """Mark a bill as paid"""
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('setup_user'))
    
    bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
    if not bill:
        flash('Bill not found.', 'error')
        return redirect(url_for('index'))
    
    bill.is_paid = True
    bill.updated_at = datetime.utcnow()
    db.session.commit()
    
    flash(f'Bill "{bill.name}" marked as paid!', 'success')
    return redirect(url_for('index'))

@app.route('/mark_unpaid/<int:bill_id>')
def mark_unpaid(bill_id):
    """Mark a bill as unpaid"""
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('setup_user'))
    
    bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
    if not bill:
        flash('Bill not found.', 'error')
        return redirect(url_for('index'))
    
    bill.is_paid = False
    bill.updated_at = datetime.utcnow()
    db.session.commit()
    
    flash(f'Bill "{bill.name}" marked as unpaid.', 'info')
    return redirect(url_for('index'))

@app.route('/delete_bill/<int:bill_id>')
def delete_bill(bill_id):
    """Delete a bill"""
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('setup_user'))
    
    bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
    if not bill:
        flash('Bill not found.', 'error')
        return redirect(url_for('index'))
    
    bill_name = bill.name
    db.session.delete(bill)
    db.session.commit()
    
    flash(f'Bill "{bill_name}" deleted successfully.', 'success')
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    """Clear session and return to setup"""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('setup_user'))

@app.context_processor
def utility_processor():
    """Make utility functions available in templates"""
    return dict(
        today=date.today(),
        datetime=datetime
    )
