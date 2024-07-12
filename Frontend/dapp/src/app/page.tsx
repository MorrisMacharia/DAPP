"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import MyDApp from "../../contracts/MyDApp.json";
import "../app/page.css";

const ALCHEMY_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_API_URL || "";

const Home: React.FC = () => {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [txHash, setTxHash] = useState<string>("");

  useEffect(() => {
    // Guarded by SSR check
    if (typeof window !== "undefined" && (window as any).ethereum) {
      // Load provider and contract if MetaMask is available
      loadProvider();
    }
  }, []);

  const loadProvider = async () => {
    try {
      // Request accounts using MetaMask
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      // Use Alchemy as the provider
      const alchemyProvider = new ethers.providers.JsonRpcProvider(
        "https://eth-sepolia.g.alchemy.com/v2/-Dc7kjcZZos9SS80gLSZFyxedUjGaQzW"
      );
      const balance = await alchemyProvider.getBalance(accounts[0]);
      setBalance(ethers.utils.formatEther(balance));

      // Determine network ID and check deployed contract
      const networkId = (await alchemyProvider.getNetwork()).chainId;
      const deployedNetwork = (MyDApp as any).networks[networkId];
      if (deployedNetwork) {
        // Create contract instance
        const signer = alchemyProvider.getSigner(accounts[0]);
        const contractInstance = new ethers.Contract(
          deployedNetwork.address,
          MyDApp.abi,
          signer
        );
        setContract(contractInstance);
      } else {
        console.log("MyDApp contract not deployed to detected network.");
      }
    } catch (error) {
      console.error("Error requesting accounts or setting provider:", error);
    }
  };

  const connectWallet = async () => {
    // Re-check for window and ethereum availability
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await loadProvider(); // Load provider and contract
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      console.error("MetaMask not found or ALCHEMY_API_URL is not set");
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setBalance("");
    setContract(null);
  };

  const sendCrypto = async () => {
    if (contract) {
      try {
        const tx = await contract.sendCrypto(
          toAddress,
          ethers.utils.parseEther(amount),
          message,
          { value: ethers.utils.parseEther(amount) }
        );
        await tx.wait();
        setTxHash(tx.hash);
      } catch (error) {
        console.error("Error sending crypto:", error);
      }
    }
  };

  return (
    <div className="DApp">
      <h1>Crypto Transfer</h1>
      {typeof window !== "undefined" && (window as any).ethereum ? (
        // Render based on wallet connection state
        account ? (
          <div>
            <p>Account: {account}</p>
            <p>Balance: {balance} ETH</p>
            <button onClick={disconnectWallet}>Disconnect Wallet</button>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )
      ) : (
        <p>MetaMask or similar provider not available</p>
      )}
      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="To Address"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button color="red" onClick={sendCrypto}>
        Send Crypto
      </button>
      {txHash && <p>Transaction Hash: {txHash}</p>}
    </div>
  );
};

export default Home;
