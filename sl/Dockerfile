FROM python:3.10-slim

# आवश्यक लिनक्स सॉफ्टवेअर्स आणि Microsoft ODBC ड्रायव्हर इन्स्टॉल करा
RUN apt-get update && apt-get install -y curl gnupg2 apt-utils build-essential unixodbc-dev \
    && curl https://microsoft.com | apt-key add - \
    && curl https://microsoft.com > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql17

# प्रोजेक्ट फाईल्स सर्व्हरवर कॉपी करा
WORKDIR /app
COPY . /app

# पायथनच्या लायब्ररीज इन्स्टॉल करा
RUN pip install --no-cache-dir -r requirements.txt

# ॲप रन करण्यासाठी कमांड
CMD ["gunicorn", "app:app"]
