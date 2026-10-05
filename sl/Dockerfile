FROM python:3.10

# सिस्टम अपडेट करा आणि लायब्ररीज इन्स्टॉल करा
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    build-essential \
    unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# Microsoft ODBC Driver 17 इन्स्टॉल करा (अधिकृत नवीन कमांड्स)
RUN curl https://microsoft.com | apt-key add - \
    && curl https://microsoft.com > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql17

WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt

CMD ["gunicorn", "app:app"]
