from flask import Flask, render_template, request, jsonify
import pyodbc

app = Flask(__name__)


# ==================================================
# DATABASE CONNECTION
# ==================================================

def get_connection():

    connection_string = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=HP\\SQLEXPRESS;"
        "DATABASE=MyAppDB;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )

    return pyodbc.connect(connection_string)


# ==================================================
# HOME
# ==================================================

@app.route("/")
def home():
    return render_template("index.html")


# ==================================================
# DATABASE TEST
# ==================================================

@app.route("/test-db")
def test_db():

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT DB_NAME()")

        database_name = cursor.fetchone()[0]

        cursor.close()
        conn.close()

        return f"""
        <h2>Microsoft SQL Server Connected Successfully! ✅</h2>
        <p>Server: HP\\SQLEXPRESS</p>
        <p>Database: {database_name}</p>
        """

    except Exception as e:

        return f"""
        <h2>Database Connection Failed ❌</h2>
        <p>{str(e)}</p>
        """


# ==================================================
# SAVE PAYMENT
# ==================================================

@app.route("/save", methods=["POST"])
def save_payment():

    try:

        data = request.get_json()

        name = data.get("name")
        description = data.get("description")
        location = data.get("location")
        amount = data.get("amount")
        payment_type = data.get("paymentType")
        payment_mode = data.get("paymentMode")
        payment_date = data.get("paymentDate")


        # Required fields
        if not name:
            return jsonify({
                "error": "Please enter name."
            }), 400


        if amount is None or amount == "":
            return jsonify({
                "error": "Please enter amount."
            }), 400


        if not payment_type:
            return jsonify({
                "error": "Please select payment type."
            }), 400


        if not payment_mode:
            return jsonify({
                "error": "Please select payment mode."
            }), 400


        if not payment_date:
            return jsonify({
                "error": "Please select payment date."
            }), 400


        conn = get_connection()
        cursor = conn.cursor()


        cursor.execute("""
            INSERT INTO Payments
            (
                Name,
                Description,
                Location,
                Amount,
                PaymentType,
                PaymentMode,
                PaymentDate
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            name,
            description,
            location,
            amount,
            payment_type,
            payment_mode,
            payment_date
        ))


        conn.commit()

        cursor.close()
        conn.close()


        return jsonify({
            "message": "Payment saved successfully! ✅"
        })


    except Exception as e:

        print("SAVE ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ==================================================
# GET ALL PAYMENTS
# ==================================================

@app.route("/payments", methods=["GET"])
def get_payments():

    try:

        conn = get_connection()
        cursor = conn.cursor()


        cursor.execute("""
            SELECT
                PaymentID,
                Name,
                Description,
                Location,
                Amount,
                PaymentType,
                PaymentMode,
                PaymentDate
            FROM Payments
            ORDER BY PaymentID DESC
        """)


        rows = cursor.fetchall()

        payments = []


        for row in rows:

            payments.append({

                "PaymentID": row.PaymentID,

                "Name": row.Name,

                "Description": row.Description,

                "Location": row.Location,

                "Amount": float(row.Amount),

                "PaymentType": row.PaymentType,

                "PaymentMode": row.PaymentMode,

                "PaymentDate":
                    row.PaymentDate.isoformat()
                    if row.PaymentDate
                    else ""
            })


        cursor.close()
        conn.close()


        return jsonify(payments)


    except Exception as e:

        print("GET ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ==================================================
# UPDATE PAYMENT
# ==================================================

@app.route("/update/<int:payment_id>", methods=["PUT"])
def update_payment(payment_id):

    try:

        data = request.get_json()


        if not data:

            return jsonify({
                "error": "No data received."
            }), 400


        name = data.get("name")
        description = data.get("description")
        location = data.get("location")
        amount = data.get("amount")
        payment_type = data.get("paymentType")
        payment_mode = data.get("paymentMode")
        payment_date = data.get("paymentDate")


        if not name:

            return jsonify({
                "error": "Please enter name."
            }), 400


        if amount is None or amount == "":

            return jsonify({
                "error": "Please enter amount."
            }), 400


        if not payment_type:

            return jsonify({
                "error": "Please select payment type."
            }), 400


        if not payment_mode:

            return jsonify({
                "error": "Please select payment mode."
            }), 400


        if not payment_date:

            return jsonify({
                "error": "Please select payment date."
            }), 400


        conn = get_connection()
        cursor = conn.cursor()


        # Check payment exists
        cursor.execute("""
            SELECT PaymentID
            FROM Payments
            WHERE PaymentID = ?
        """, (payment_id,))


        existing = cursor.fetchone()


        if not existing:

            cursor.close()
            conn.close()

            return jsonify({
                "error": "Payment record not found."
            }), 404


        # Update
        cursor.execute("""
            UPDATE Payments

            SET
                Name = ?,
                Description = ?,
                Location = ?,
                Amount = ?,
                PaymentType = ?,
                PaymentMode = ?,
                PaymentDate = ?

            WHERE PaymentID = ?
        """,
        (
            name,
            description,
            location,
            amount,
            payment_type,
            payment_mode,
            payment_date,
            payment_id
        ))


        conn.commit()

        cursor.close()
        conn.close()


        return jsonify({
            "message": "Payment updated successfully! ✅"
        })


    except Exception as e:

        print("UPDATE ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ==================================================
# DELETE PAYMENT
# ==================================================

@app.route("/delete/<int:payment_id>", methods=["DELETE"])
def delete_payment(payment_id):

    try:

        conn = get_connection()
        cursor = conn.cursor()


        cursor.execute("""
            DELETE FROM Payments
            WHERE PaymentID = ?
        """, (payment_id,))


        if cursor.rowcount == 0:

            cursor.close()
            conn.close()

            return jsonify({
                "error": "Payment record not found."
            }), 404


        conn.commit()

        cursor.close()
        conn.close()


        return jsonify({
            "message": "Payment deleted successfully! 🗑️"
        })


    except Exception as e:

        print("DELETE ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# ==================================================
# RUN FLASK SERVER
# ==================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )