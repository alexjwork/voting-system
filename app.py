from flask import Flask, render_template, request, jsonify
from web3 import Web3
import json
import os

app = Flask(__name__)

# Connect to Ganache (local blockchain)
web3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))

# Load contract ABI and address
with open('contracts/Voting.json') as f:
    contract_data = json.load(f)
    contract_abi = contract_data['abi']
    contract_address = contract_data['networks']['5777']['address']  # Update with your deployed address

# Create contract instance
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/candidates', methods=['GET'])
def get_candidates():
    try:
        candidate_count = contract.functions.getCandidateCount().call()
        candidates = []
        for i in range(candidate_count):
            candidate = contract.functions.candidates(i).call()
            candidates.append({
                'id': candidate[0],
                'name': candidate[1],
                'voteCount': candidate[2]
            })
        return jsonify({'success': True, 'candidates': candidates})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/vote', methods=['POST'])
def vote():
    try:
        data = request.get_json()
        candidate_id = int(data['candidateId'])
        voter_address = data['voterAddress']
        
        # Get the voter's account nonce
        nonce = web3.eth.get_transaction_count(voter_address)
        
        # Build transaction
        tx = contract.functions.vote(candidate_id).build_transaction({
            'from': voter_address,
            'nonce': nonce,
            'gas': 200000,
            'gasPrice': web3.to_wei('50', 'gwei')
        })
        
        return jsonify({
            'success': True,
            'transaction': tx
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
