import yfinance as yf
from flask import request, render_template, Flask, jsonify

app = Flask("stockAnalysisWebsite", template_folder='../frontend', static_folder='../frontend')

tickers = ['ARM', 'AMD', 'AGN.AS', 'BESI.AS', 'BYDDY', 'CRWD', 'HEIA.AS', 'META', 'PANW', 'O', 'WLN.PA']
# tickers = ['BESI.AS']

def send_from_directory(template_folder, page):
    return render_template(page)

def calculate_200dMA(ticker):
    # Fetch 1 year of historical data to calculate the 200d moving average
    stock = yf.Ticker(ticker)
    history = stock.history(period='1y')
    if history.empty:
        return None
    history['200dMA'] = history['Close'].rolling(window=200).mean()
    return history['200dMA'].iloc[-1]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<page>')
def serve_page(page):
    return send_from_directory(app.template_folder, page)

@app.route('/stock_data', methods=['GET', 'POST', 'PUT', 'DELETE'])
def stock_data():
    if request.method == 'GET':
        if len(tickers) == 0:
            return jsonify({'error': 'no data'}), 404
        else:
            array = []
            for ticker in tickers:
                data = yf.Ticker(ticker).history(period='1d', interval='1m')
                data_dict = data.to_dict()
                for key in list(data_dict.keys()):
                    data_dict[key] = {str(k): v for k, v in data_dict[key].items()}
                data_dict["200dMA"] = calculate_200dMA(ticker)
              
                array.append({
                    'ticker': ticker,
                    'data': data_dict,
                })
            return jsonify(array), 200
         
    elif request.method == 'DELETE':    # delete all stock data
        if len(tickers) == 0:           # if no stock data to delete return 404 status code
            return jsonify({'error': 'no data'}), 404
        else:
            tickers.clear()
            return jsonify({'message': 'all data deleted'}), 204

    elif request.method == 'POST' or request.method == 'PUT': 
        return jsonify({'error': 'invalid method'}), 405

    else:
        return jsonify({'error': 'unknown method'}), 405

@app.route('/stock_data/<ticker>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def stock_data_ticker(ticker):
    if request.method == 'GET':         # return stock data for ticker
        if ticker not in tickers:       # if ticker not found return 404 status code
            return jsonify({'error': 'ticker not found'}), 404
        else:                           # if ticker found return 200 status code
            data = yf.Ticker(ticker).history(period='1d')
            data_dict = data.to_dict()
            for key in data_dict:
                data_dict[key] = {str(k): v for k, v in data_dict[key].items()}
            print(data_dict)
            return jsonify({'ticker': ticker, 'data': data_dict}), 200
    
    elif request.method == 'POST':      # add stock data for ticker
        data = yf.Ticker(ticker).history(period='1d')
        if data.empty:                  # if ticker not found return 404 status code
            return jsonify({'error': 'ticker not found'}), 404
        elif ticker in tickers:
            return jsonify({'error': 'ticker already exists'}), 409
        else:
            print(ticker)
            tickers.append(ticker.upper())
            return jsonify({'message': 'ticker added'}), 201
    
    elif request.method == 'PUT':        # bad request
       return jsonify({'error': 'Method not allowed'}), 405
    
    elif request.method == 'DELETE':    # delete stock data for ticker
        if ticker in tickers:           # if succesful return 204 status code
            tickers.remove(ticker)
            return jsonify({'message': 'ticker deleted'}), 200
        else:
            return jsonify({'error': 'ticker not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)