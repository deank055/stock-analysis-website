import yfinance as yf
from flask import request, render_template, Flask, jsonify

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stock_data', methods=['POST'])

def stock_data():
    ticker = request.get_json()['ticker']
    data = yf.Ticker(ticker).history(period='1d')
    print(data)
    return jsonify({
        'currentPrice': data.iloc[-1].Close,
        'openPrice': data.iloc[-1].Open,
        'ticker': ticker})

if __name__ == '__main__':
    app.run(debug=True)