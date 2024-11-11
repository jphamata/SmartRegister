import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0xd15f6ccB13fa1D23bd116575f686e2A9439574F2";
const CONTRACT_ABI = [
  "function registerWork(string memory title, string memory description, string memory fileHash) public returns (uint256)",
  "function getWork(uint256 workId) public view returns (uint256 id, address workOwner, string title, string description, string fileHash, uint256 timestamp, bool isRegistered)",
  "function getWorksByOwner(address workOwner) public view returns (uint256[])",
  "function getWorkByHash(string memory searchHash) public view returns (uint256 id, address workOwner, string title, string description, string fileHash, uint256 timestamp, bool isRegistered)"
];

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [works, setWorks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileHash: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentWorkIndex, setCurrentWorkIndex] = useState(0);  

  const [searchAccount, setSearchAccount] = useState('');
  const [searchHash, setSearchHash] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const [generatedHash, setGeneratedHash] = useState('');

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await setupProviderAndContract(accounts[0]);
      } else {
        setError('Por favor, instale o MetaMask!');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const switchAccount = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        await setupProviderAndContract(accounts[0]);
      }
    } catch (err) {
      setError('Erro ao trocar de conta: ' + err.message);
    }
  };

  const setupProviderAndContract = async (currentAccount) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    setAccount(currentAccount);
    setProvider(provider);
    setContract(contract);

    await loadWorks(contract, currentAccount);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          await setupProviderAndContract(accounts[0]);
        } else {
          setAccount('');
          setWorks([]);
          setError("Nenhuma conta conectada.");
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const loadWorks = async (contract, address) => {
    try {
      const workIds = await contract.getWorksByOwner(address);
      const worksData = await Promise.all(
        workIds.map(async (id) => {
          const work = await contract.getWork(id);
          return {
            id: work.id.toString(),
            title: work.title,
            description: work.description,
            fileHash: work.fileHash,
            timestamp: new Date(work.timestamp * 1000).toLocaleString(),
            owner: work.workOwner
          };
        })
      );
      setWorks(worksData);
    } catch (err) {
      setError(err.message);
    }
  };

  const searchByAccount = async () => {
    if (searchAccount) {
      try {
        const workIds = await contract.getWorksByOwner(searchAccount);
        const worksData = await Promise.all(
          workIds.map(async (id) => {
            const work = await contract.getWork(id);
            return {
              id: work.id.toString(),
              title: work.title,
              description: work.description,
              fileHash: work.fileHash,
              timestamp: new Date(work.timestamp * 1000).toLocaleString(),
              owner: work.workOwner
            };
          })
        );
        setSearchResults(worksData);
      } catch (err) {
        setError('Erro ao buscar patentes por conta: ' + err.message);
      }
    }
  };

  const searchByHash = async () => {
  if (searchHash) {
    try {
      const work = await contract.getWorkByHash(searchHash);
      const workData = {
        id: work.id.toString(),
        title: work.title,
        description: work.description,
        fileHash: work.fileHash,
        timestamp: new Date(work.timestamp * 1000).toLocaleString(),
        owner: work.workOwner
      };
      setSearchResults([workData]);
    } catch (err) {
      setError('Erro ao buscar patentes por hash: ' + err.message);
    }
  }
};

  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchAccount('');
    setSearchHash('');
  };

  const generateFileHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tx = await contract.registerWork(
        formData.title,
        formData.description,
        formData.fileHash
      );
      console.log('Transação enviada:', tx);
      await tx.wait();
      await loadWorks(contract, account);
      setFormData({
        title: '',
        description: '',
        fileHash: ''
      });
    } catch (err) {
      console.error('Erro na transação:', err);
      setError('Tentativa de cadastro de obra já registrada');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const fileHash = await generateFileHash(file);
        setFormData((prevData) => ({ ...prevData, fileHash }));
        setGeneratedHash(fileHash);
      } catch (err) {
        setError('Erro ao gerar o hash do arquivo');
      }
    }
  };

  const nextWork = () => {
    if (currentWorkIndex < works.length - 1) {
      setCurrentWorkIndex(currentWorkIndex + 1);
    }
  };

  const prevWork = () => {
    if (currentWorkIndex > 0) {
      setCurrentWorkIndex(currentWorkIndex - 1);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>SmartRegister</h1>
        {!account ? (
          <button className="connect-button" onClick={connectWallet}>
            Conectar MetaMask
          </button>
        ) : (
          <div className="account-info">
            <p id="conexao">Conta conectada: {account}</p>
            <button onClick={switchAccount}>Trocar Conta</button>
          </div>
        )}
      </header>

      <div className="search-container">
        <input
          type="text"
          value={searchAccount}
          onChange={(e) => setSearchAccount(e.target.value)}
          placeholder="Pesquisar por Conta"
        />
        <button onClick={searchByAccount}>Buscar</button>

        <input
          type="text"
          value={searchHash}
          onChange={(e) => setSearchHash(e.target.value)}
          placeholder="Pesquisar por Hash"
        />
        <button onClick={searchByHash}>Buscar por Hash</button>
        
        <hr/>

      </div>

      <div className="works-list">
        {loading && <p>Carregando...</p>}

        <div className="work-results">
          {searchResults.length > 0 ? (
            searchResults.map((work) => (
              <div key={work.id} className="work-item">
                <h2>{work.title}</h2>
                <p>{work.description}</p>
                <p>Hash do arquivo: {work.fileHash}</p>
                <p>Criado por: {work.owner}</p>
                <p>Registrado em: {work.timestamp}</p>
              </div>
            ))
          ) : (
            <p id="aviso">Nenhum trabalho encontrado.</p>
          )}
        </div>
        <hr/>
        <button onClick={clearSearchResults}>Limpar busca</button>
      
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Cadastrar Obra</h2>
          <label>
            Título:
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </label>
          <label>
            Descrição:
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </label>
          <label>
            Arquivo:
            <input type="file" onChange={handleFileChange} />
          </label>
          {generatedHash && (
            <div className="hash-display">
              <p>Hash do Arquivo: {generatedHash}</p>
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Obra'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    <hr/>
      <h1>Minhas patentes:</h1>
      <div className="work-details">
        {works.length > 0 ? (
          <div>
            <h2>{works[currentWorkIndex].title}</h2>
            <p>{works[currentWorkIndex].description}</p>
            <p>Hash do arquivo: {works[currentWorkIndex].fileHash}</p>
            <p>Registrado em: {works[currentWorkIndex].timestamp}</p>
            <button onClick={prevWork} disabled={currentWorkIndex === 0}>
              Anterior
            </button>
            <button onClick={nextWork} disabled={currentWorkIndex === works.length - 1}>
              Próximo
            </button>
          </div>
        ) : (
          <p id="aviso">Nenhum trabalho registrado ainda.</p>
        )}
      </div>
    </div>
  );
}

export default App;
