document.addEventListener('DOMContentLoaded', function() {
    let web3;
    let contract;
    let userAccount;
    
    // Connect to MetaMask
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    
    // Refresh results
    document.getElementById('refreshResults').addEventListener('click', loadResults);
    
    // Initialize
    async function init() {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                userAccount = accounts[0];
                document.getElementById('walletAddress').textContent = userAccount;
                
                // Load contract
                const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Replace with your contract address
                const contractABI = []; // Paste your contract ABI here
                contract = new web3.eth.Contract(contractABI, contractAddress);
                
                // Load candidates and results
                loadCandidates();
                loadResults();
                
                // Listen for account changes
                window.ethereum.on('accountsChanged', function(accounts) {
                    userAccount = accounts[0];
                    document.getElementById('walletAddress').textContent = userAccount;
                    loadCandidates();
                    loadResults();
                });
                
            } catch (error) {
                console.error("User denied account access");
            }
        } else {
            alert('Please install MetaMask to use this application!');
        }
    }
    
    async function connectWallet() {
        await init();
    }
    
    async function loadCandidates() {
        try {
            const response = await fetch('/candidates');
            const data = await response.json();
            
            if (data.success) {
                const candidatesList = document.getElementById('candidatesList');
                candidatesList.innerHTML = '';
                
                data.candidates.forEach(candidate => {
                    const candidateCard = document.createElement('div');
                    candidateCard.className = 'candidate-card';
                    candidateCard.innerHTML = `
                        <h3>${candidate.name}</h3>
                        <p>Votes: ${candidate.voteCount}</p>
                        <button class="vote-btn" data-id="${candidate.id}">Vote</button>
                    `;
                    candidatesList.appendChild(candidateCard);
                });
                
                // Add event listeners to vote buttons
                document.querySelectorAll('.vote-btn').forEach(button => {
                    button.addEventListener('click', async function() {
                        const candidateId = this.getAttribute('data-id');
                        try {
                            const response = await fetch('/vote', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    candidateId: candidateId,
                                    voterAddress: userAccount
                                })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                // Send transaction
                                await web3.eth.sendTransaction(data.transaction);
                                alert('Vote submitted successfully!');
                                loadCandidates();
                                loadResults();
                            } else {
                                alert('Error: ' + data.error);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            alert('Error submitting vote');
                        }
                    });
                });
            } else {
                console.error('Error loading candidates:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    async function loadResults() {
        try {
            const response = await fetch('/candidates');
            const data = await response.json();
            
            if (data.success) {
                const resultsChart = document.getElementById('resultsChart');
                resultsChart.innerHTML = '';
                
                data.candidates.forEach(candidate => {
                    const resultBar = document.createElement('div');
                    resultBar.className = 'result-bar';
                    resultBar.style.width = `${(candidate.voteCount / Math.max(1, data.candidates.reduce((sum, c) => sum + c.voteCount, 0))) * 100}%`;
                    resultBar.textContent = `${candidate.name}: ${candidate.voteCount} votes`;
                    resultsChart.appendChild(resultBar);
                });
            } else {
                console.error('Error loading results:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});
