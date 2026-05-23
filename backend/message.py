# message.py

from twilio.rest import Client

# Twilio credentials
ACCOUNT_SID = ''
AUTH_TOKEN = ''
TWILIO_PHONE_NUMBER = '+'

# Your phone number
MY_PHONE_NUMBER = ''

def send_sms(message_text):
    """Send an SMS to your own number."""
    client = Client(ACCOUNT_SID, AUTH_TOKEN)
    message = client.messages.create(
        body=message_text,
        from_=TWILIO_PHONE_NUMBER,
        to=MY_PHONE_NUMBER
    )
    return message.sid
