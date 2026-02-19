import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask_cors import CORS
import os

app = Flask(__name__)

# Enable CORS for cross-origin requests
CORS(app, resources={r"/*": {"origins": "*"}})

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
EMAIL_USERNAME =
EMAIL_PASSWORD = 


@app.route("/send-email", methods=["POST", "OPTIONS"])  # Ensure POST is allowed
def send_email():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS Preflight OK"}), 200

    try:
        # Log the incoming request
        print("Request received:", request.get_json())

        data = request.get_json()
        name = data.get("name")
        number = data.get("number")
        email = data.get("email")
        message = data.get("message")

        # Ensure all fields are filled
        if not name or not number or not email or not message:
            print("Missing form data")
            return jsonify({"error": "All form fields are required."}), 400

        # Log form data to see what is being received
        print(f"Name: {name},Number: {number} Email: {email}, Message: {message}")

        # Create the email
        msg = MIMEMultipart()
        msg["From"] = EMAIL_USERNAME
        msg["To"] = (
            "rokon.raz@gmail.com"  # The email where you want to receive form submissions
        )
        msg["Subject"] = f"New Contact Form Submission from {name}"

        # Email body
        body = f"Name: {name}\nNumber: {number}\nEmail: {email}\nMessage: {message}"
        msg.attach(MIMEText(body, "plain"))

        # Send the email
        print("Sending email...")
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.set_debuglevel(1)  # Enable debug output for SMTP
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.send_message(msg)
        print("Email sent successfully")
        return jsonify({"message": "Email sent successfully!"}), 200
    except Exception as e:
        # Print the error message to the console for easier debugging
        print(f"Error sending email: {e}")
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
